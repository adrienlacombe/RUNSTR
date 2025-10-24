/**
 * RouteMatchingService - GPS route comparison and matching
 * Detects when a workout follows a previously saved route
 * Provides real-time progress comparison against personal records
 */

import routeStorageService, {
  type SavedRoute,
  type GPSPoint,
} from './RouteStorageService';
import type { WorkoutType } from '../../types/workout';

export interface RouteMatch {
  routeId: string;
  routeName: string;
  confidence: number; // 0-1 match confidence score
  matchedPoints: number; // Number of GPS points that matched
  totalPoints: number; // Total GPS points in current workout
  matchPercentage: number; // Percentage of route matched
}

export interface ProgressComparison {
  isAheadOfPR: boolean; // Are we faster than PR pace?
  timeDifference: number; // Seconds ahead (+) or behind (-)
  paceDifference: number; // min/km difference
  percentComplete: number; // 0-100 progress through route
  estimatedFinishTime: number; // Projected total time based on current pace
  prFinishTime: number; // Best time on this route
}

export class RouteMatchingService {
  private static instance: RouteMatchingService;
  private currentMatchedRoute: SavedRoute | null = null; // Currently matched route
  private activeRoute: SavedRoute | null = null; // Manually selected route

  // GPS matching parameters (tunable for accuracy vs performance)
  private readonly MATCH_DISTANCE_THRESHOLD = 50; // meters - points within this distance count as match
  private readonly MIN_MATCH_PERCENTAGE = 70; // minimum % of points to consider a route match
  private readonly MIN_POINTS_FOR_MATCH = 10; // minimum GPS points needed to attempt matching

  private constructor() {}

  static getInstance(): RouteMatchingService {
    if (!RouteMatchingService.instance) {
      RouteMatchingService.instance = new RouteMatchingService();
    }
    return RouteMatchingService.instance;
  }

  /**
   * Calculate distance between two GPS points using Haversine formula
   */
  private calculateDistance(point1: GPSPoint, point2: GPSPoint): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Find the closest point in a route to a given GPS point
   */
  private findClosestPoint(
    point: GPSPoint,
    routePoints: GPSPoint[]
  ): {
    distance: number;
    index: number;
  } {
    let minDistance = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < routePoints.length; i++) {
      const distance = this.calculateDistance(point, routePoints[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return { distance: minDistance, index: closestIndex };
  }

  /**
   * Check if a GPS point matches the route (within threshold distance)
   */
  private isPointOnRoute(
    point: GPSPoint,
    routePoints: GPSPoint[],
    expectedIndex?: number
  ): boolean {
    // If we have an expected index, check nearby points first for performance
    if (
      expectedIndex !== undefined &&
      expectedIndex >= 0 &&
      expectedIndex < routePoints.length
    ) {
      const searchRadius = 5; // Check ±5 points from expected position
      const startIndex = Math.max(0, expectedIndex - searchRadius);
      const endIndex = Math.min(
        routePoints.length - 1,
        expectedIndex + searchRadius
      );

      for (let i = startIndex; i <= endIndex; i++) {
        const distance = this.calculateDistance(point, routePoints[i]);
        if (distance <= this.MATCH_DISTANCE_THRESHOLD) {
          return true;
        }
      }
    }

    // Fallback: Check all points (slower but more accurate)
    const { distance } = this.findClosestPoint(point, routePoints);
    return distance <= this.MATCH_DISTANCE_THRESHOLD;
  }

  /**
   * Attempt to match current workout GPS track against saved routes
   */
  async findMatchingRoute(
    currentPoints: GPSPoint[],
    activityType: WorkoutType
  ): Promise<RouteMatch | null> {
    try {
      // Need minimum points to attempt matching
      if (currentPoints.length < this.MIN_POINTS_FOR_MATCH) {
        return null;
      }

      // Get saved routes for this activity type
      const routes = await routeStorageService.getRoutesByActivity(
        activityType
      );
      if (routes.length === 0) {
        return null;
      }

      let bestMatch: RouteMatch | null = null;
      let highestConfidence = 0;

      // Compare against each saved route
      for (const route of routes) {
        const matchedPoints = this.countMatchedPoints(
          currentPoints,
          route.coordinates
        );
        const matchPercentage = (matchedPoints / currentPoints.length) * 100;

        // Calculate confidence score (0-1)
        // Higher confidence = higher match percentage + more matched points
        const confidence = Math.min(1, matchPercentage / 100);

        // Only consider matches above minimum threshold
        if (
          matchPercentage >= this.MIN_MATCH_PERCENTAGE &&
          confidence > highestConfidence
        ) {
          highestConfidence = confidence;
          bestMatch = {
            routeId: route.id,
            routeName: route.name,
            confidence,
            matchedPoints,
            totalPoints: currentPoints.length,
            matchPercentage,
          };
        }
      }

      if (bestMatch) {
        console.log(
          `🎯 Route match found: "${
            bestMatch.routeName
          }" (${bestMatch.matchPercentage.toFixed(
            1
          )}% match, confidence: ${bestMatch.confidence.toFixed(2)})`
        );
      }

      return bestMatch;
    } catch (error) {
      console.error('❌ Failed to find matching route:', error);
      return null;
    }
  }

  /**
   * Count how many points in current track match the saved route
   */
  private countMatchedPoints(
    currentPoints: GPSPoint[],
    routePoints: GPSPoint[]
  ): number {
    let matchedCount = 0;
    let expectedIndex = 0;

    for (const point of currentPoints) {
      if (this.isPointOnRoute(point, routePoints, expectedIndex)) {
        matchedCount++;
        // Advance expected index for next point (assumes sequential movement)
        expectedIndex = Math.min(expectedIndex + 1, routePoints.length - 1);
      }
    }

    return matchedCount;
  }

  /**
   * Compare current workout progress against route PR
   */
  async compareWithPR(
    routeId: string,
    currentDistance: number, // meters
    currentTime: number // seconds
  ): Promise<ProgressComparison | null> {
    try {
      const route = await routeStorageService.getRouteById(routeId);
      if (!route || !route.bestTime) {
        return null; // No PR to compare against
      }

      // Calculate current pace (min/km)
      const currentPace =
        currentDistance > 0 ? currentTime / 60 / (currentDistance / 1000) : 0;

      // Calculate percentage of route completed
      const percentComplete = Math.min(
        100,
        (currentDistance / route.distance) * 100
      );

      // Calculate expected time at current pace for full route
      const estimatedFinishTime =
        (route.distance / currentDistance) * currentTime;

      // Compare with PR
      const timeDifference = route.bestTime - estimatedFinishTime;
      const isAheadOfPR = timeDifference > 0; // Positive means we're ahead

      const paceDifference = route.bestPace ? route.bestPace - currentPace : 0;

      return {
        isAheadOfPR,
        timeDifference,
        paceDifference,
        percentComplete,
        estimatedFinishTime,
        prFinishTime: route.bestTime,
      };
    } catch (error) {
      console.error('❌ Failed to compare with PR:', error);
      return null;
    }
  }

  /**
   * Get user-friendly progress message
   */
  formatProgressMessage(comparison: ProgressComparison): string {
    if (comparison.isAheadOfPR) {
      const minutes = Math.floor(Math.abs(comparison.timeDifference) / 60);
      const seconds = Math.floor(Math.abs(comparison.timeDifference) % 60);
      return `🔥 ${minutes}:${seconds
        .toString()
        .padStart(2, '0')} ahead of PR!`;
    } else {
      const minutes = Math.floor(Math.abs(comparison.timeDifference) / 60);
      const seconds = Math.floor(Math.abs(comparison.timeDifference) % 60);
      return `💪 ${minutes}:${seconds
        .toString()
        .padStart(2, '0')} behind PR - push harder!`;
    }
  }

  /**
   * Check if we're on track to beat the PR
   */
  isOnTrackForPR(comparison: ProgressComparison): boolean {
    // Consider "on track" if ahead or within 30 seconds of PR pace
    return comparison.isAheadOfPR || Math.abs(comparison.timeDifference) <= 30;
  }

  /**
   * Get recommended pace to match PR
   */
  getTargetPace(
    route: SavedRoute,
    currentDistance: number,
    currentTime: number
  ): number | null {
    if (!route.bestTime) return null;

    const remainingDistance = route.distance - currentDistance;
    const remainingTime = route.bestTime - currentTime;

    if (remainingDistance <= 0 || remainingTime <= 0) return null;

    // Calculate required pace for remaining distance (min/km)
    return remainingTime / 60 / (remainingDistance / 1000);
  }

  /**
   * Start tracking a specific route
   */
  startMatching(route: SavedRoute): void {
    this.activeRoute = route;
    this.currentMatchedRoute = route;
    console.log(`📍 Started route tracking: ${route.name}`);
  }

  /**
   * Stop route tracking
   */
  stopMatching(): void {
    this.activeRoute = null;
    this.currentMatchedRoute = null;
    console.log('📍 Stopped route tracking');
  }

  /**
   * Get the currently matched route
   */
  getMatchedRoute(): SavedRoute | null {
    return this.currentMatchedRoute || this.activeRoute;
  }

  /**
   * Set the matched route (for auto-detection)
   */
  setMatchedRoute(route: SavedRoute | null): void {
    this.currentMatchedRoute = route;
  }
}

export default RouteMatchingService.getInstance();
