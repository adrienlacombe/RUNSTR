/**
 * EventAnnouncementCardGenerator - Social Media Cards for Event Announcements
 * Creates beautiful announcement cards when captains create new events
 * Reuses SVG architecture from WorkoutCardGenerator
 */

import { RUNSTR_LOGO_BASE64 } from './runstrLogoBase64';
import { generateEventDeepLink } from '../../utils/eventDeepLink';

export interface EventAnnouncementData {
  eventId: string;
  eventName: string;
  teamId: string;
  teamName: string;
  activityType: string;
  eventDate: string; // ISO string
  entryFee?: number; // sats
  prizePool?: number; // sats
  captainName?: string;
  durationMinutes?: number;
}

export interface AnnouncementCardData {
  svgContent: string;
  dimensions: { width: number; height: number };
  deepLink: string;
  metadata: {
    eventId: string;
    generatedAt: string;
  };
}

export class EventAnnouncementCardGenerator {
  private static instance: EventAnnouncementCardGenerator;

  private constructor() {}

  static getInstance(): EventAnnouncementCardGenerator {
    if (!EventAnnouncementCardGenerator.instance) {
      EventAnnouncementCardGenerator.instance =
        new EventAnnouncementCardGenerator();
    }
    return EventAnnouncementCardGenerator.instance;
  }

  /**
   * Generate event announcement card as SVG
   */
  async generateAnnouncementCard(
    event: EventAnnouncementData
  ): Promise<AnnouncementCardData> {
    try {
      console.log(
        `🎨 Generating announcement card for event: ${event.eventName}`
      );

      const dimensions = { width: 800, height: 600 };

      // Generate deep link
      const deepLink = generateEventDeepLink({
        eventId: event.eventId,
        teamId: event.teamId,
        eventName: event.eventName,
        eventDate: event.eventDate,
        entryFee: event.entryFee,
      });

      // Generate SVG content
      const svgContent = this.createAnnouncementSVG(event, deepLink, dimensions);

      return {
        svgContent,
        dimensions,
        deepLink,
        metadata: {
          eventId: event.eventId,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Error generating announcement card:', error);
      throw new Error('Failed to generate announcement card');
    }
  }

  /**
   * Create SVG card content for event announcement
   */
  private createAnnouncementSVG(
    event: EventAnnouncementData,
    deepLink: string,
    dimensions: { width: number; height: number }
  ): string {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const accentColor = '#FF6B35'; // RUNSTR orange
    const sansFont = 'system-ui, -apple-system, sans-serif';

    // Format event date
    const eventDateObj = new Date(event.eventDate);
    const formattedDate = eventDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    // Get activity emoji
    const activityEmoji = this.getActivityEmoji(event.activityType);

    // Format duration if available
    const durationText = event.durationMinutes
      ? this.formatDuration(event.durationMinutes)
      : null;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradient background -->
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

        <!-- Orange accent bar at top -->
        <rect width="${width}" height="8" fill="${accentColor}"/>

        <!-- RUNSTR Logo (top center) -->
        <image
          href="${RUNSTR_LOGO_BASE64}"
          x="${centerX - 50}"
          y="30"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid meet"
        />

        <!-- "NEW EVENT" label -->
        <text
          x="${centerX}"
          y="160"
          font-family="${sansFont}"
          font-size="16"
          font-weight="600"
          text-anchor="middle"
          fill="${accentColor}"
          letter-spacing="2"
        >NEW EVENT</text>

        <!-- Event name -->
        <text
          x="${centerX}"
          y="210"
          font-family="${sansFont}"
          font-size="36"
          font-weight="700"
          text-anchor="middle"
          fill="#FFFFFF"
          letter-spacing="-0.5"
        >${this.escapeXml(event.eventName)}</text>

        <!-- Activity type with emoji -->
        <text
          x="${centerX}"
          y="260"
          font-family="${sansFont}"
          font-size="28"
          font-weight="500"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.8"
        >${activityEmoji} ${this.escapeXml(event.activityType)}</text>

        <!-- Event date -->
        <text
          x="${centerX}"
          y="310"
          font-family="${sansFont}"
          font-size="20"
          font-weight="400"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.7"
        >📅 ${formattedDate}</text>

        <!-- Duration (if available) -->
        ${
          durationText
            ? `
        <text
          x="${centerX}"
          y="345"
          font-family="${sansFont}"
          font-size="18"
          font-weight="400"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.6"
        >⏱️ ${durationText}</text>
        `
            : ''
        }

        <!-- Entry fee and prize pool info -->
        <g transform="translate(${centerX - 150}, ${durationText ? 380 : 350})">
          ${
            event.entryFee && event.entryFee > 0
              ? `
          <rect x="0" y="0" width="140" height="60" fill="${accentColor}20" rx="8" stroke="${accentColor}" stroke-width="2"/>
          <text
            x="70"
            y="25"
            font-family="${sansFont}"
            font-size="22"
            font-weight="700"
            text-anchor="middle"
            fill="${accentColor}"
          >${event.entryFee.toLocaleString()} sats</text>
          <text
            x="70"
            y="45"
            font-family="${sansFont}"
            font-size="12"
            font-weight="500"
            text-anchor="middle"
            fill="#FFFFFF"
            opacity="0.7"
            letter-spacing="0.5"
          >ENTRY FEE</text>
          `
              : `
          <rect x="0" y="0" width="140" height="60" fill="${accentColor}20" rx="8" stroke="${accentColor}" stroke-width="2"/>
          <text
            x="70"
            y="30"
            font-family="${sansFont}"
            font-size="18"
            font-weight="600"
            text-anchor="middle"
            fill="${accentColor}"
          >FREE EVENT</text>
          `
          }
        </g>

        ${
          event.prizePool && event.prizePool > 0
            ? `
        <g transform="translate(${centerX + 10}, ${durationText ? 380 : 350})">
          <rect x="0" y="0" width="140" height="60" fill="${accentColor}20" rx="8" stroke="${accentColor}" stroke-width="2"/>
          <text
            x="70"
            y="25"
            font-family="${sansFont}"
            font-size="22"
            font-weight="700"
            text-anchor="middle"
            fill="${accentColor}"
          >${event.prizePool.toLocaleString()} sats</text>
          <text
            x="70"
            y="45"
            font-family="${sansFont}"
            font-size="12"
            font-weight="500"
            text-anchor="middle"
            fill="#FFFFFF"
            opacity="0.7"
            letter-spacing="0.5"
          >PRIZE POOL</text>
        </g>
        `
            : ''
        }

        <!-- Team name -->
        <text
          x="${centerX}"
          y="${durationText ? 480 : 450}"
          font-family="${sansFont}"
          font-size="16"
          font-weight="500"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.6"
        >Hosted by ${this.escapeXml(event.teamName)}</text>

        <!-- Deep link (bottom) -->
        <text
          x="${centerX}"
          y="${durationText ? 530 : 500}"
          font-family="${sansFont}"
          font-size="14"
          font-weight="400"
          text-anchor="middle"
          fill="${accentColor}"
          opacity="0.8"
        >${deepLink}</text>

        <!-- RUNSTR branding -->
        <text
          x="${centerX}"
          y="${durationText ? 565 : 535}"
          font-family="${sansFont}"
          font-size="12"
          font-weight="600"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.4"
          letter-spacing="1"
        >POWERED BY RUNSTR</text>
      </svg>
    `.trim();
  }

  /**
   * Get activity emoji based on type
   */
  private getActivityEmoji(activityType: string): string {
    const emojiMap: Record<string, string> = {
      running: '🏃',
      cycling: '🚴',
      walking: '🚶',
      hiking: '🥾',
      'strength training': '💪',
      yoga: '🧘',
      meditation: '🧘',
      diet: '🥗',
      swimming: '🏊',
      rowing: '🚣',
    };

    const lowerType = activityType.toLowerCase();
    return emojiMap[lowerType] || '⚡';
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export default EventAnnouncementCardGenerator.getInstance();
