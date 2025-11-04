/**
 * ChallengeAnnouncementCardGenerator - Social Media Cards for Challenge Announcements
 * Creates beautiful announcement cards when users create new challenges
 * Reuses SVG architecture from EventAnnouncementCardGenerator
 */

import { RUNSTR_LOGO_BASE64 } from './runstrLogoBase64';

export interface ChallengeAnnouncementData {
  challengeId: string;
  challengeName: string;
  distance: number; // km
  duration: number; // hours
  wager: number; // sats
  opponentName?: string;
  opponentPubkey?: string;
  creatorName?: string;
}

export interface AnnouncementCardData {
  svgContent: string;
  dimensions: { width: number; height: number };
  deepLink: string;
  metadata: {
    challengeId: string;
    generatedAt: string;
  };
}

export class ChallengeAnnouncementCardGenerator {
  private static instance: ChallengeAnnouncementCardGenerator;

  private constructor() {}

  static getInstance(): ChallengeAnnouncementCardGenerator {
    if (!ChallengeAnnouncementCardGenerator.instance) {
      ChallengeAnnouncementCardGenerator.instance =
        new ChallengeAnnouncementCardGenerator();
    }
    return ChallengeAnnouncementCardGenerator.instance;
  }

  /**
   * Generate challenge announcement card as SVG
   */
  async generateAnnouncementCard(
    challenge: ChallengeAnnouncementData
  ): Promise<AnnouncementCardData> {
    try {
      console.log(
        `🎨 Generating announcement card for challenge: ${challenge.challengeName}`
      );

      const dimensions = { width: 800, height: 600 };

      // Generate deep link (simple format for now)
      const deepLink = `runstr://challenge/${challenge.challengeId}`;

      // Generate SVG content
      const svgContent = this.createAnnouncementSVG(challenge, deepLink, dimensions);

      return {
        svgContent,
        dimensions,
        deepLink,
        metadata: {
          challengeId: challenge.challengeId,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Error generating announcement card:', error);
      throw new Error('Failed to generate announcement card');
    }
  }

  /**
   * Create SVG card content for challenge announcement
   */
  private createAnnouncementSVG(
    challenge: ChallengeAnnouncementData,
    deepLink: string,
    dimensions: { width: number; height: number }
  ): string {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const accentColor = '#FF6B35'; // RUNSTR orange
    const sansFont = 'system-ui, -apple-system, sans-serif';

    // Format duration
    const durationText = this.formatDuration(challenge.duration);

    // Format opponent info
    const opponentText = challenge.opponentName || 'Open Challenge';

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

        <!-- "NEW CHALLENGE" label -->
        <text
          x="${centerX}"
          y="160"
          font-family="${sansFont}"
          font-size="16"
          font-weight="600"
          text-anchor="middle"
          fill="${accentColor}"
          letter-spacing="2"
        >NEW CHALLENGE</text>

        <!-- Challenge name -->
        <text
          x="${centerX}"
          y="210"
          font-family="${sansFont}"
          font-size="36"
          font-weight="700"
          text-anchor="middle"
          fill="#FFFFFF"
          letter-spacing="-0.5"
        >${this.escapeXml(challenge.challengeName)}</text>

        <!-- Distance -->
        <text
          x="${centerX}"
          y="260"
          font-family="${sansFont}"
          font-size="28"
          font-weight="500"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.8"
        >🏃 ${challenge.distance} km</text>

        <!-- Scoring method -->
        <text
          x="${centerX}"
          y="300"
          font-family="${sansFont}"
          font-size="20"
          font-weight="400"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.7"
        >⚡ Fastest Time Wins</text>

        <!-- Duration -->
        <text
          x="${centerX}"
          y="335"
          font-family="${sansFont}"
          font-size="18"
          font-weight="400"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.6"
        >⏱️ ${durationText}</text>

        <!-- Wager and opponent info -->
        <g transform="translate(${centerX - 150}, 360)">
          ${
            challenge.wager > 0
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
          >${challenge.wager.toLocaleString()} sats</text>
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
          >WAGER</text>
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
          >NO WAGER</text>
          `
          }
        </g>

        <!-- Opponent info -->
        <g transform="translate(${centerX + 10}, 360)">
          <rect x="0" y="0" width="140" height="60" fill="${accentColor}20" rx="8" stroke="${accentColor}" stroke-width="2"/>
          <text
            x="70"
            y="25"
            font-family="${sansFont}"
            font-size="16"
            font-weight="600"
            text-anchor="middle"
            fill="#FFFFFF"
            opacity="0.9"
          >VS</text>
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
          >${this.escapeXml(opponentText).toUpperCase()}</text>
        </g>

        <!-- Created by -->
        ${
          challenge.creatorName
            ? `
        <text
          x="${centerX}"
          y="470"
          font-family="${sansFont}"
          font-size="16"
          font-weight="500"
          text-anchor="middle"
          fill="#FFFFFF"
          opacity="0.6"
        >Created by ${this.escapeXml(challenge.creatorName)}</text>
        `
            : ''
        }

        <!-- Deep link (bottom) -->
        <text
          x="${centerX}"
          y="520"
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
          y="555"
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
   * Format duration in human-readable format
   */
  private formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours === 0) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }

    return `${days}d ${remainingHours}h`;
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

export default ChallengeAnnouncementCardGenerator.getInstance();
