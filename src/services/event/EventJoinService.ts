/**
 * Event Join Service
 * Handles paid and free event joining with payment + join request flow
 * Payment happens externally (Cash App, Strike, Alby, etc.) - users pay Lightning invoices
 * Service coordinates Nostr join requests with payment proof
 */

import { Alert } from 'react-native';
import eventJoinRequestService, {
  EventJoinRequestData,
} from '../events/EventJoinRequestService';
import { NostrProtocolHandler } from '../nostr/NostrProtocolHandler';
import { nostrRelayManager } from '../nostr/NostrRelayManager';
import { getAuthenticationData } from '../../utils/nostrAuth';
import { getInvoiceFromLightningAddress } from '../../utils/lnurl';
import {
  validateInvoiceAmount,
  isInvoiceExpired,
} from '../../utils/bolt11Parser';
import type { QREventData } from './QREventService';

export interface EventJoinResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Event Join Service
 * Manages the full flow of joining paid/free events
 */
export class EventJoinService {
  private static instance: EventJoinService;

  private constructor() {}

  public static getInstance(): EventJoinService {
    if (!EventJoinService.instance) {
      EventJoinService.instance = new EventJoinService();
    }
    return EventJoinService.instance;
  }

  /**
   * Join a free event (send join request only)
   */
  public async joinFreeEvent(eventData: QREventData): Promise<EventJoinResult> {
    try {
      console.log(`📝 Joining free event: ${eventData.event_name}`);

      // Get user authentication data
      const authData = await getAuthenticationData();
      if (!authData?.nsec || !authData?.hexPubkey) {
        throw new Error('Cannot access user credentials for signing');
      }

      // Prepare join request data
      const requestData: EventJoinRequestData = {
        eventId: eventData.event_id,
        eventName: eventData.event_name,
        teamId: eventData.team_id,
        captainPubkey: eventData.captain_pubkey,
        message: `Request to join: ${eventData.event_name}`,
      };

      // Create event template
      const eventTemplate = eventJoinRequestService.prepareEventJoinRequest(
        requestData,
        authData.hexPubkey
      );

      // Sign and publish event
      const protocolHandler = new NostrProtocolHandler();
      const signedEvent = await protocolHandler.signEvent(
        eventTemplate as any,
        authData.nsec
      );
      const publishResult = await nostrRelayManager.publishEvent(signedEvent);

      if (publishResult.successful.length === 0) {
        throw new Error('Failed to publish join request');
      }

      console.log(
        `✅ Free event join request sent for: ${eventData.event_name}`
      );

      Alert.alert(
        'Request Sent!',
        `Your join request has been sent to the captain. You'll be notified when approved.`,
        [{ text: 'OK' }]
      );

      return {
        success: true,
        message: 'Join request sent successfully',
      };
    } catch (error) {
      console.error('❌ Failed to join free event:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      Alert.alert('Join Failed', errorMessage, [{ text: 'OK' }]);

      return {
        success: false,
        message: 'Failed to send join request',
        error: errorMessage,
      };
    }
  }

  /**
   * Join a paid event - DEPRECATED METHOD
   * Note: Payment now happens externally (Cash App, Strike, Alby, etc.)
   * Use getEventEntryInvoice() + submitPaidJoinRequest() instead
   * This method kept for backward compatibility but should not be used
   */
  public async joinPaidEvent(eventData: QREventData): Promise<EventJoinResult> {
    console.warn(
      '⚠️ joinPaidEvent is deprecated - use getEventEntryInvoice() + submitPaidJoinRequest() instead'
    );

    return {
      success: false,
      message: 'This method is deprecated. Please use the new payment flow.',
      error:
        'Method deprecated - use getEventEntryInvoice() and submitPaidJoinRequest()',
    };
  }

  /**
   * Get Lightning invoice for event entry from captain's Lightning address
   * Uses LNURL protocol to request invoice
   */
  public async getEventEntryInvoice(
    eventData: QREventData,
    captainLightningAddress: string
  ): Promise<{ success: boolean; invoice?: string; error?: string }> {
    try {
      console.log(
        `💳 Requesting invoice from ${captainLightningAddress} for ${eventData.entry_fee} sats`
      );

      const result = await getInvoiceFromLightningAddress(
        captainLightningAddress,
        eventData.entry_fee,
        `Entry fee: ${eventData.event_name}`
      );

      console.log('✅ Invoice generated successfully');

      return {
        success: true,
        invoice: result.invoice,
      };
    } catch (error) {
      console.error('❌ Failed to get invoice:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get invoice';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Submit paid join request with payment proof
   * Publishes kind 1105 join request with invoice as proof of payment
   *
   * SECURITY: Validates invoice amount matches entry fee before submission
   */
  public async submitPaidJoinRequest(
    eventData: QREventData,
    paymentInvoice: string
  ): Promise<EventJoinResult> {
    try {
      console.log(
        `📝 Submitting paid join request for: ${eventData.event_name}`
      );

      // SECURITY CHECK 1: Validate invoice amount matches entry fee
      if (eventData.entry_fee > 0) {
        const amountValid = validateInvoiceAmount(
          paymentInvoice,
          eventData.entry_fee
        );

        if (!amountValid) {
          throw new Error(
            `Invoice amount doesn't match entry fee. Expected ${eventData.entry_fee} sats. Please generate a new invoice for the correct amount.`
          );
        }

        console.log(`✅ Invoice amount validated: ${eventData.entry_fee} sats`);
      }

      // SECURITY CHECK 2: Verify invoice hasn't expired
      const expired = isInvoiceExpired(paymentInvoice);
      if (expired === true) {
        throw new Error(
          'Invoice has expired. Please generate a new invoice and try again.'
        );
      }

      console.log('✅ Invoice expiration check passed');

      const authData = await getAuthenticationData();
      if (!authData?.nsec || !authData?.hexPubkey) {
        throw new Error('Cannot access user credentials for signing');
      }

      // Prepare join request with payment proof
      const requestData: EventJoinRequestData = {
        eventId: eventData.event_id,
        eventName: eventData.event_name,
        teamId: eventData.team_id,
        captainPubkey: eventData.captain_pubkey,
        message: `Paid ${eventData.entry_fee} sats entry fee for: ${eventData.event_name}`,
      };

      // Create event template
      const eventTemplate = eventJoinRequestService.prepareEventJoinRequest(
        requestData,
        authData.hexPubkey
      );

      // Add payment proof tags
      if (eventTemplate.tags) {
        eventTemplate.tags.push(['payment_proof', paymentInvoice]);
        eventTemplate.tags.push([
          'amount_paid',
          eventData.entry_fee.toString(),
        ]);
        eventTemplate.tags.push(['payment_timestamp', Date.now().toString()]);
      }

      // Sign and publish event
      const protocolHandler = new NostrProtocolHandler();
      const signedEvent = await protocolHandler.signEvent(
        eventTemplate as any,
        authData.nsec
      );
      const publishResult = await nostrRelayManager.publishEvent(signedEvent);

      if (publishResult.successful.length === 0) {
        throw new Error('Failed to publish join request');
      }

      console.log(`✅ Paid join request sent for: ${eventData.event_name}`);

      Alert.alert(
        'Request Sent!',
        `Your payment and join request have been sent to the captain. You'll be notified when approved.`,
        [{ text: 'OK' }]
      );

      return {
        success: true,
        message: 'Join request sent with payment proof',
      };
    } catch (error) {
      console.error('❌ Failed to submit paid join request:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      Alert.alert('Request Failed', errorMessage, [{ text: 'OK' }]);

      return {
        success: false,
        message: 'Failed to send join request',
        error: errorMessage,
      };
    }
  }

  /**
   * Join event (auto-detects paid vs free)
   */
  public async joinEvent(eventData: QREventData): Promise<EventJoinResult> {
    if (eventData.entry_fee > 0) {
      return this.joinPaidEvent(eventData);
    } else {
      return this.joinFreeEvent(eventData);
    }
  }
}

// Export singleton instance
export const eventJoinService = EventJoinService.getInstance();
