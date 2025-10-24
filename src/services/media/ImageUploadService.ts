/**
 * ImageUploadService - Upload images to nostr.build for NIP-94 hosting
 * Implements NIP-98 HTTP authentication manually for React Native compatibility
 */

import * as FileSystem from 'expo-file-system';
import type { NDKSigner } from '@nostr-dev-kit/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { GlobalNDKService } from '../nostr/GlobalNDKService';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  blurhash?: string;
  dimensions?: { width: number; height: number };
  error?: string;
}

export class ImageUploadService {
  private static instance: ImageUploadService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {}

  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  /**
   * Upload image to nostr.build with NIP-98 authentication
   * @param imageUri - Local file URI or base64 data URI
   * @param filename - Optional filename (defaults to workout-card.png)
   * @param signer - NDK signer for NIP-98 authentication (optional, but recommended)
   */
  async uploadImage(
    imageUri: string,
    filename: string = 'workout-card.png',
    signer?: NDKSigner
  ): Promise<ImageUploadResult> {
    let attempt = 0;

    while (attempt < this.MAX_RETRIES) {
      try {
        console.log(
          `📤 Uploading image to nostr.build with NIP-98 auth (attempt ${
            attempt + 1
          }/${this.MAX_RETRIES})...`,
          {
            hasSigner: !!signer,
            filename,
          }
        );

        if (!signer) {
          throw new Error(
            'NIP-98 authentication required - please provide a signer'
          );
        }

        // Create NIP-98 authorization event
        const uploadUrl = 'https://nostr.build/api/v2/upload/files';
        const authEvent = await this.createNIP98AuthEvent(
          'POST',
          uploadUrl,
          signer
        );

        console.log('🔐 NIP-98 auth event created:', {
          kind: authEvent.kind,
          tags: authEvent.tags.length,
        });

        // Create FormData with image file (React Native compatible)
        const formData = new FormData();
        formData.append('fileToUpload', {
          uri: imageUri,
          type: 'image/png',
          name: filename,
        } as any);

        console.log('📤 Uploading with NIP-98 authorization...');

        // Upload with NIP-98 authorization
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: `Nostr ${btoa(JSON.stringify(authEvent))}`,
            Accept: 'application/json',
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
          throw new Error(
            `Upload failed with status ${response.status}: ${errorText}`
          );
        }

        const data = await response.json();
        console.log('📦 nostr.build response:', data);

        // nostr.build returns { status: "success", data: [{ url, blurhash, dimensions }] }
        if (data.status === 'success' && data.data && data.data.length > 0) {
          const uploadedFile = data.data[0];

          console.log(`✅ Image uploaded successfully: ${uploadedFile.url}`);

          return {
            success: true,
            url: uploadedFile.url,
            blurhash: uploadedFile.blurhash,
            dimensions: uploadedFile.dimensions
              ? {
                  width: uploadedFile.dimensions.width,
                  height: uploadedFile.dimensions.height,
                }
              : undefined,
          };
        } else {
          throw new Error('Invalid response from nostr.build');
        }
      } catch (error) {
        attempt++;
        console.error(`❌ Upload attempt ${attempt} failed:`, error);

        if (attempt >= this.MAX_RETRIES) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
          };
        }

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, this.RETRY_DELAY * attempt)
        );
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
    };
  }

  /**
   * Create NIP-98 HTTP authorization event
   * @see https://github.com/nostr-protocol/nips/blob/master/98.md
   */
  private async createNIP98AuthEvent(
    method: string,
    url: string,
    signer: NDKSigner
  ): Promise<any> {
    const ndk = await GlobalNDKService.getInstance();
    const user = await signer.user();

    // Create kind 27235 HTTP Auth event
    const authEvent = new NDKEvent(ndk);
    authEvent.kind = 27235;
    authEvent.content = '';
    authEvent.tags = [
      ['u', url],
      ['method', method],
    ];
    authEvent.created_at = Math.floor(Date.now() / 1000);
    authEvent.pubkey = user.pubkey;

    // Sign the event
    await authEvent.sign(signer);

    // Return as plain object (for JSON.stringify)
    return {
      id: authEvent.id,
      pubkey: authEvent.pubkey,
      created_at: authEvent.created_at,
      kind: authEvent.kind,
      tags: authEvent.tags,
      content: authEvent.content,
      sig: authEvent.sig,
    };
  }

  /**
   * Upload multiple images in batch
   */
  async uploadBatch(
    imageUris: string[],
    signer?: NDKSigner,
    onProgress?: (completed: number, total: number) => void
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];

    for (let i = 0; i < imageUris.length; i++) {
      const result = await this.uploadImage(
        imageUris[i],
        `workout-card-${i}.png`,
        signer
      );
      results.push(result);
      onProgress?.(i + 1, imageUris.length);

      // Small delay between uploads to avoid rate limiting
      if (i < imageUris.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Validate image URI before upload
   */
  validateImageUri(uri: string): boolean {
    // Check if it's a valid file URI or data URI
    return uri.startsWith('file://') || uri.startsWith('data:image/');
  }

  /**
   * Get estimated upload size from URI
   * Returns size in bytes (approximate for data URIs)
   */
  async getImageSize(uri: string): Promise<number> {
    if (uri.startsWith('data:image/')) {
      // Base64 data URI - estimate size
      const base64Data = uri.split(',')[1];
      return Math.ceil((base64Data.length * 3) / 4);
    }

    // For file URIs, we'd need to use React Native's FileSystem API
    // For now, return 0 (unknown)
    return 0;
  }
}

export default ImageUploadService.getInstance();
