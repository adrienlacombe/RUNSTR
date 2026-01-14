/**
 * Supabase Edge Function: process-donations
 *
 * Cron job that processes pending donations:
 * 1. Checks for settled invoices
 * 2. Forwards payments to charities
 * 3. Updates donation status
 *
 * Run via Supabase cron: every 60 seconds
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as secp from 'https://esm.sh/@noble/secp256k1@1.7.1'
import { bytesToHex } from 'https://esm.sh/@noble/hashes@1.3.2/utils'
import { sha256 } from 'https://esm.sh/@noble/hashes@1.3.2/sha256'

// Constants
const NWC_TIMEOUT_MS = 30000
const MAX_RETRIES = 5
const BATCH_SIZE = 10

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// LNURL Functions
// ============================================

interface LNURLPayDetails {
  callback: string
  minSendable: number
  maxSendable: number
  tag: string
}

async function fetchLNURLPayDetails(lightningAddress: string): Promise<LNURLPayDetails> {
  const [name, domain] = lightningAddress.split('@')
  if (!name || !domain) throw new Error('Invalid Lightning address format')

  const lnurlUrl = `https://${domain}/.well-known/lnurlp/${name}`
  const response = await fetch(lnurlUrl, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`LNURL fetch failed: ${response.status}`)

  const data = await response.json()
  if (data.status === 'ERROR') throw new Error(data.reason || 'LNURL error')
  return data as LNURLPayDetails
}

async function requestInvoice(callbackUrl: string, amountSats: number): Promise<string> {
  const url = new URL(callbackUrl)
  url.searchParams.set('amount', (amountSats * 1000).toString())

  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Invoice request failed: ${response.status}`)

  const data = await response.json()
  if (data.status === 'ERROR') throw new Error(data.reason || 'Invoice request error')
  if (!data.pr) throw new Error('No invoice returned')
  return data.pr
}

async function getInvoiceFromLightningAddress(
  lightningAddress: string,
  amountSats: number
): Promise<string> {
  const details = await fetchLNURLPayDetails(lightningAddress)
  const amountMillisats = amountSats * 1000

  if (amountMillisats < details.minSendable) {
    throw new Error(`Amount too small. Min: ${details.minSendable / 1000} sats`)
  }
  if (amountMillisats > details.maxSendable) {
    throw new Error(`Amount too large. Max: ${details.maxSendable / 1000} sats`)
  }

  return requestInvoice(details.callback, amountSats)
}

// ============================================
// NWC Implementation
// ============================================

function parseNWCUrl(nwcUrl: string): { walletPubkey: string; relay: string; secret: string } {
  const urlStr = nwcUrl.replace('nostr+walletconnect://', 'https://')
  const url = new URL(urlStr)
  const walletPubkey = url.hostname || url.pathname.replace('//', '')
  const relay = url.searchParams.get('relay')
  const secret = url.searchParams.get('secret')

  if (!walletPubkey || !relay || !secret) {
    throw new Error('Invalid NWC URL: missing required parameters')
  }
  if (!/^[0-9a-f]{64}$/i.test(secret)) {
    throw new Error('Invalid NWC secret format')
  }

  return { walletPubkey, relay, secret }
}

function generateEventId(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

function now(): number {
  return Math.floor(Date.now() / 1000)
}

function serializeEvent(event: {
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
}): string {
  return JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content])
}

function calculateEventId(event: {
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
}): string {
  const serialized = serializeEvent(event)
  const hash = sha256(new TextEncoder().encode(serialized))
  return bytesToHex(hash)
}

async function signEventId(eventIdHex: string, privateKeyHex: string): Promise<string> {
  const sig = await secp.schnorr.sign(eventIdHex, privateKeyHex)
  return bytesToHex(sig)
}

function getPublicKey(privateKeyHex: string): string {
  const pubkeyBytes = secp.schnorr.getPublicKey(privateKeyHex)
  return bytesToHex(pubkeyBytes)
}

async function nip04Encrypt(
  plaintext: string,
  privateKeyHex: string,
  recipientPubkey: string
): Promise<string> {
  const sharedPoint = secp.getSharedSecret(privateKeyHex, '02' + recipientPubkey)
  const sharedX = sharedPoint.slice(1, 33)
  const iv = new Uint8Array(16)
  crypto.getRandomValues(iv)

  const key = await crypto.subtle.importKey('raw', sharedX, { name: 'AES-CBC' }, false, ['encrypt'])
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    new TextEncoder().encode(plaintext)
  )

  const ciphertextB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  const ivB64 = btoa(String.fromCharCode(...iv))
  return `${ciphertextB64}?iv=${ivB64}`
}

async function nip04Decrypt(
  ciphertext: string,
  privateKeyHex: string,
  senderPubkey: string
): Promise<string> {
  const [encryptedB64, ivPart] = ciphertext.split('?iv=')
  if (!ivPart) throw new Error('Invalid NIP-04 format: missing IV')

  const sharedPoint = secp.getSharedSecret(privateKeyHex, '02' + senderPubkey)
  const sharedX = sharedPoint.slice(1, 33)
  const encrypted = Uint8Array.from(atob(encryptedB64), (c) => c.charCodeAt(0))
  const iv = Uint8Array.from(atob(ivPart), (c) => c.charCodeAt(0))

  const key = await crypto.subtle.importKey('raw', sharedX, { name: 'AES-CBC' }, false, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, encrypted)
  return new TextDecoder().decode(decrypted)
}

async function sendNWCRequest(
  nwcUrl: string,
  method: string,
  params: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const { walletPubkey, relay, secret } = parseNWCUrl(nwcUrl)
  const clientPubkey = getPublicKey(secret)

  return new Promise((resolve) => {
    const ws = new WebSocket(relay)
    const timeout = setTimeout(() => {
      ws.close()
      resolve({ success: false, error: 'NWC timeout' })
    }, NWC_TIMEOUT_MS)

    ws.onopen = async () => {
      const subscriptionId = generateEventId().slice(0, 16)
      ws.send(
        JSON.stringify([
          'REQ',
          subscriptionId,
          { kinds: [23195], '#p': [clientPubkey], since: now() - 60 },
        ])
      )

      const request = JSON.stringify({ method, params })
      const encryptedContent = await nip04Encrypt(request, secret, walletPubkey)

      const event = {
        pubkey: clientPubkey,
        created_at: now(),
        kind: 23194,
        tags: [['p', walletPubkey]],
        content: encryptedContent,
      }

      const eventId = calculateEventId(event)
      const sig = await signEventId(eventId, secret)
      ws.send(JSON.stringify(['EVENT', { id: eventId, ...event, sig }]))
    }

    ws.onmessage = async (msg) => {
      try {
        const data = JSON.parse(msg.data)
        if (data[0] === 'EVENT' && data[2]?.kind === 23195) {
          const decrypted = await nip04Decrypt(data[2].content, secret, walletPubkey)
          const response = JSON.parse(decrypted)

          clearTimeout(timeout)
          ws.close()

          if (response.error) {
            resolve({
              success: false,
              error: response.error.message || response.error.code || 'NWC error',
            })
          } else {
            resolve({ success: true, result: response.result })
          }
        }
      } catch {
        // Ignore parse errors for non-response messages
      }
    }

    ws.onerror = () => {
      clearTimeout(timeout)
      resolve({ success: false, error: 'WebSocket error' })
    }
  })
}

async function lookupInvoice(
  nwcUrl: string,
  paymentHash: string
): Promise<{ success: boolean; settled?: boolean; error?: string }> {
  const result = await sendNWCRequest(nwcUrl, 'lookup_invoice', { payment_hash: paymentHash })
  if (result.success && result.result) {
    const r = result.result as { settled_at?: number }
    return { success: true, settled: !!r.settled_at && r.settled_at > 0 }
  }
  return { success: false, error: result.error }
}

async function payInvoice(
  nwcUrl: string,
  invoice: string
): Promise<{ success: boolean; preimage?: string; error?: string }> {
  const result = await sendNWCRequest(nwcUrl, 'pay_invoice', { invoice })
  if (result.success && result.result) {
    const r = result.result as { preimage?: string }
    return { success: true, preimage: r.preimage }
  }
  return { success: false, error: result.error }
}

// ============================================
// Donation Processing
// ============================================

interface PendingDonation {
  id: string
  payment_hash: string
  charity_id: string
  charity_lightning_address: string
  amount_sats: number
  status: string
  retry_count: number
}

async function processPendingDonations(
  supabase: ReturnType<typeof createClient>,
  nwcUrl: string
): Promise<{ processed: number; forwarded: number; errors: number }> {
  const stats = { processed: 0, forwarded: 0, errors: 0 }

  // Fetch pending donations (not yet settled)
  const { data: pendingDonations, error: fetchError } = await supabase
    .from('pending_donations')
    .select('*')
    .eq('status', 'pending')
    .lt('retry_count', MAX_RETRIES)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    console.error('[process-donations] Error fetching pending:', fetchError)
    return stats
  }

  for (const donation of (pendingDonations || []) as PendingDonation[]) {
    stats.processed++
    console.log('[process-donations] Checking:', donation.payment_hash.slice(0, 16), donation.charity_id)

    try {
      // Check if invoice is settled
      const lookupResult = await lookupInvoice(nwcUrl, donation.payment_hash)

      if (!lookupResult.success) {
        console.log('[process-donations] Lookup failed:', lookupResult.error)
        continue
      }

      if (lookupResult.settled) {
        console.log('[process-donations] Invoice settled! Updating status...')
        await supabase
          .from('pending_donations')
          .update({ status: 'settled', settled_at: new Date().toISOString() })
          .eq('id', donation.id)
      }
    } catch (error) {
      console.error('[process-donations] Error checking donation:', error)
      stats.errors++
    }
  }

  return stats
}

async function processSettledDonations(
  supabase: ReturnType<typeof createClient>,
  nwcUrl: string
): Promise<{ processed: number; forwarded: number; errors: number }> {
  const stats = { processed: 0, forwarded: 0, errors: 0 }

  // Fetch settled donations (need to forward)
  const { data: settledDonations, error: fetchError } = await supabase
    .from('pending_donations')
    .select('*')
    .eq('status', 'settled')
    .lt('retry_count', MAX_RETRIES)
    .order('settled_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    console.error('[process-donations] Error fetching settled:', fetchError)
    return stats
  }

  for (const donation of (settledDonations || []) as PendingDonation[]) {
    stats.processed++
    console.log('[process-donations] Forwarding:', donation.amount_sats, 'sats to', donation.charity_id)

    try {
      // Get invoice from charity's lightning address
      const charityInvoice = await getInvoiceFromLightningAddress(
        donation.charity_lightning_address,
        donation.amount_sats
      )

      // Pay the charity
      const payResult = await payInvoice(nwcUrl, charityInvoice)

      if (payResult.success) {
        console.log('[process-donations] Successfully forwarded to', donation.charity_id)
        await supabase
          .from('pending_donations')
          .update({
            status: 'forwarded',
            forwarded_at: new Date().toISOString(),
            forward_preimage: payResult.preimage,
          })
          .eq('id', donation.id)
        stats.forwarded++
      } else {
        console.error('[process-donations] Payment failed:', payResult.error)
        await supabase
          .from('pending_donations')
          .update({
            retry_count: donation.retry_count + 1,
            error_message: payResult.error,
          })
          .eq('id', donation.id)
        stats.errors++
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[process-donations] Error forwarding:', errorMessage)

      // Check if it's a rate error (charity server issue) vs permanent failure
      const isPermanentFailure = errorMessage.includes('Invalid Lightning address')
      await supabase
        .from('pending_donations')
        .update({
          retry_count: donation.retry_count + 1,
          error_message: errorMessage,
          status: isPermanentFailure ? 'failed' : 'settled',
        })
        .eq('id', donation.id)
      stats.errors++
    }
  }

  return stats
}

// ============================================
// Main Handler
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const nwcUrl = Deno.env.get('REWARD_NWC_URL')
    if (!nwcUrl) {
      return new Response(
        JSON.stringify({ success: false, reason: 'nwc_not_configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('[process-donations] Starting cron run...')

    // Process pending donations (check for settlements)
    const pendingStats = await processPendingDonations(supabase, nwcUrl)
    console.log('[process-donations] Pending check:', pendingStats)

    // Process settled donations (forward to charities)
    const settledStats = await processSettledDonations(supabase, nwcUrl)
    console.log('[process-donations] Forwarding:', settledStats)

    const totalStats = {
      pending_checked: pendingStats.processed,
      settled_processed: settledStats.processed,
      forwarded: settledStats.forwarded,
      errors: pendingStats.errors + settledStats.errors,
    }

    console.log('[process-donations] Cron complete:', totalStats)

    return new Response(JSON.stringify({ success: true, stats: totalStats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[process-donations] Fatal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        reason: error instanceof Error ? error.message : 'internal_error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
