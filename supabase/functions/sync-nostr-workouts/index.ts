/**
 * Supabase Edge Function: sync-nostr-workouts
 *
 * Scheduled function that queries Nostr relays for kind 1301 workout events
 * and syncs them to the workout_submissions table.
 *
 * Called by pg_cron every 2 minutes.
 *
 * Architecture:
 * 1. Get participant list from competition_participants table
 * 2. Connect to Nostr relays via WebSocket
 * 3. Query kind 1301 events from last 10 minutes (overlapping window)
 * 4. Submit each event through validation pipeline
 * 5. Deduplication handles any overlap
 *
 * Benefits:
 * - Decouples user-facing "Compete" button from Supabase submission
 * - Catches ALL workouts regardless of app version or publish method
 * - Centralized validation in one place
 * - Near real-time updates (2-minute sync)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =============================================
// CONSTANTS & CONFIGURATION
// =============================================

const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nos.lol',
  'wss://relay.nostr.band',
]

// Query events from last 10 minutes (overlapping window for reliability)
const SYNC_WINDOW_SECONDS = 600

// Season II start (Jan 1, 2026)
const SEASON_2_START = new Date('2026-01-01T00:00:00Z').getTime() / 1000

// Season II participants (hex pubkeys) - full list
const SEASON_2_PUBKEYS = [
  '30ceb64e73197a05958c8bd92ab079c815bb44fbfbb3eb5d9766c5207f08bdf5', // TheWildHustle
  '745eb529d0e42d2fa6c904bbc2c10702deae964b4dd3079803ab8b43536dda12', // guy
  'dae73fdd90d98db1a8405bcecac60cd6ce8d10896a6a2c5e04011125e16cd432', // Lhasa Sensei
  '43256bc0859462cf14fa7de594a48babdf189b91abe27f88d824abf69b2343c9', // LOPES
  'e7df627c638d934b37548d8408b43dc5d4762fa270c26abec5916bff62aac80d', // KjetilR
  '9358c67695d9e78bde2bf3ce1eb0a5059553687632a177e7d25deeff9f2912fc', // Kamo Weasel
  'c9943d8f8e9c2aa9facb6e579af6ec38b7205c0570de1b0fb8f99f65dc5f786e', // Zed
  '6b42a3b227b086e850ff659a151863ce070eb60d32bae8a4618928655effc3f6', // JokerHasse
  '0c252c138ee446b6f9c0964ff609380fc82e52c8d318529607f293fcdf828bea', // Busch21
  'c8b22b81877eaa54e1ab21e39824f85a29e61f71da9fbabbef8930b171b98da8', // Hoov
  '8ce975f57dd070c4293ff8f978b869e20b2cdf4c81f277b46f3676b262c5e823', // clemsy
  '9fce3aea32b35637838fb45b75be32595742e16bb3e4742cc82bb3d50f9087e6', // MAKE SONGS LONGER
  'e5237023a5c0929e7ae0e5128d41a8213138400ec110dbe9d8a29278f22b7c13', // Helen Yrmom
  '02734f19cae7850e7bca6c0a2bb6a534f152d5acbd86eece1d2bfbd5d6502003', // bitcoin_rene
  '939ffb4e552ed5c0fa780985ab7163f441798409ae7ed81c62c07ac4683b4222', // Johan
  '5a654b6394bb83ecc1b95f848d6bc44e6d21120de5d832040704d9823b2c0af4', // Drew
  '5d405752c1b4ddd0714baf3ce415db52e5506036f345ff575ee16e2b4cf189bf', // Heiunter
  '14ca97caaea1565dc3f8277394a8f7d03364745a8d18536d8423dbac3f363b7f', // Satty
  'de7ab932ca17278b2144a6628c3531a0628fcc7b58074111d6e5b949ecb0e377', // Harambe's last Bitcoin
  'a80fc4a78634ee26aabcac951b4cfd7b56ae18babd33c5afdcf6bed6dc80ebd1', // Uno
  'a723805cda67251191c8786f4da58f797e6977582301354ba8e91bcb0342dc9c', // Seth
  '0ae9dc5f42febd11c5c895b0af0bbabbe02261591b0f24eefe22c0d9ca8d0286', // MoonKaptain
  'fad80b7451b03f686fd9e487b05b69c04c808e26a1db655e59e0e296a5c9f4dd', // means
  'a9046cc9175dc5a45fb93a2c890f9a8b18c707fa6d695771aab9300081d3e21a', // Ben Cousens
  '20d29810d6a5f92b045ade02ebbadc9036d741cc686b00415c42b4236fe4ad2f', // negr0
  'ea28488b659ab6433167cd024eb72e01a375ac17ce54a1cdc6e5dce2f6d93923', // johnny9
  'c6f0f4279f12200f77e1943cd26aaedf6081fda8585695f9a923b4723686da12', // Tumbleweed
  '661305095522a18a1095b7b86874ef618da9c5d1ba5f4af375688e2129c07317', // Ajax
  '933a52008116743cd652eca47209f57e4ca4c439d8c2526d8c48a47bf7072ec7', // Nell
  '312f54da0da1cf0cdcf1d6385fa8d6e5d8218f7122297d30b22482edada44649', // HumbleStacker
  '9416112efa3cdc0675156e4cb6ae46b2cca51973065c61bcbc002ca99e5dcdf2', // Lat51_Training
  '0f563fe2cfdf180cb104586b95873379a0c1fdcfbc301a80c8255f33d15f039d', // Patrick
  'd84517802a434757c56ae8642bffb4d26e5ade0712053750215680f5896e579b', // ObjectiF MooN
  'eeb11961b25442b16389fe6c7ebea9adf0ac36dd596816ea7119e521b8821b9e', // OpenMike
  '81b91540daeee031df309460a9bcf5866a54c70217ff173bcdefd1982f12b0ba', // Aaron Tomac
  '7ebbce1843a17cd778a5e169e3d2f679f5ac7b5125d1c43d265e190f7b27538c', // Adrien Lacombe
  '179154c2b30226578a14ac5a01f50a3efde8d14032df96371550e1210fffd892', // Awakening Mind
  '1f698bd4b5dda804316f09773f903ca699cf5b2a0fcd5b3fe6e0709668d58e60', // Dani
  '86f7eea066dd4dc574d01b0f9317a03508887f815fb58d8ef66873cc42fe3431', // Taljarn
  '0418ca2d6cd6c7fbc4e0391bb745027023a7edbc38f2a60fc3b68f006efb85eb', // saiy2k
  '556329e4245ec4889c33b29262c85335a082c2e25cd08b69ff46e17e70b785ec', // OrangePillosophy
  'a2603c88443af5152585f3f836832a67551e3ecad0e47a435c8d6510aa31c843', // Carol
  '24b45900a92fbc4527ccf975bd416988e444c6e4d9f364c5158667f077623fe2', // Jose Sammut
]

// Anti-cheat limits (same as submit-workout)
const VALIDATION_LIMITS: Record<string, {
  minPaceSecondsPerKm: number
  maxPaceSecondsPerKm: number
  maxDistanceKm: number
  maxDurationSeconds: number
}> = {
  running: {
    minPaceSecondsPerKm: 120,
    maxPaceSecondsPerKm: 1800,
    maxDistanceKm: 200,
    maxDurationSeconds: 172800,
  },
  walking: {
    minPaceSecondsPerKm: 180,
    maxPaceSecondsPerKm: 3600,
    maxDistanceKm: 100,
    maxDurationSeconds: 86400,
  },
  cycling: {
    minPaceSecondsPerKm: 30,
    maxPaceSecondsPerKm: 600,
    maxDistanceKm: 500,
    maxDurationSeconds: 172800,
  },
}

// =============================================
// NOSTR WEBSOCKET CLIENT
// =============================================

interface NostrEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

interface NostrFilter {
  kinds?: number[]
  authors?: string[]
  since?: number
  until?: number
}

/**
 * Query Nostr relay for events matching filter
 * Uses raw WebSocket with NIP-01 protocol
 */
async function queryRelay(
  relayUrl: string,
  filter: NostrFilter,
  timeoutMs: number = 8000
): Promise<NostrEvent[]> {
  return new Promise((resolve) => {
    const events: NostrEvent[] = []
    const subscriptionId = crypto.randomUUID().slice(0, 8)
    let socket: WebSocket | null = null
    let resolved = false

    const cleanup = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          socket.close()
        } catch {
          // Ignore close errors
        }
      }
    }

    const finish = () => {
      if (!resolved) {
        resolved = true
        cleanup()
        resolve(events)
      }
    }

    // Timeout protection
    const timer = setTimeout(() => {
      console.log(`  ${relayUrl}: timeout (${events.length} events)`)
      finish()
    }, timeoutMs)

    try {
      socket = new WebSocket(relayUrl)

      socket.onopen = () => {
        // Send REQ message: ["REQ", subscription_id, filter]
        const req = JSON.stringify(['REQ', subscriptionId, filter])
        socket!.send(req)
      }

      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data)
          const msgType = data[0]

          if (msgType === 'EVENT' && data[2]) {
            events.push(data[2] as NostrEvent)
          } else if (msgType === 'EOSE') {
            // End of stored events
            clearTimeout(timer)
            console.log(`  ${relayUrl}: EOSE (${events.length} events)`)
            finish()
          }
        } catch {
          // Ignore parse errors
        }
      }

      socket.onerror = () => {
        clearTimeout(timer)
        console.log(`  ${relayUrl}: error`)
        finish()
      }

      socket.onclose = () => {
        clearTimeout(timer)
        finish()
      }
    } catch (err) {
      clearTimeout(timer)
      console.log(`  ${relayUrl}: connection failed`)
      finish()
    }
  })
}

/**
 * Query multiple relays in parallel, deduplicate by event ID
 */
async function queryRelays(
  relays: string[],
  filter: NostrFilter
): Promise<NostrEvent[]> {
  console.log(`Querying ${relays.length} relays...`)

  const results = await Promise.all(
    relays.map((relay) => queryRelay(relay, filter))
  )

  // Deduplicate by event ID
  const eventMap = new Map<string, NostrEvent>()
  for (const events of results) {
    for (const event of events) {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event)
      }
    }
  }

  const uniqueEvents = Array.from(eventMap.values())
  console.log(`Total unique events: ${uniqueEvents.length}`)

  return uniqueEvents
}

// =============================================
// WORKOUT PARSING & VALIDATION
// =============================================

interface ParsedWorkout {
  activityType: string
  distanceMeters: number | null
  durationSeconds: number | null
  calories: number | null
}

function parseWorkoutEvent(event: NostrEvent): ParsedWorkout {
  const tags = event.tags || []
  const getTag = (name: string) => tags.find((t) => t[0] === name)?.[1]

  const activityType = getTag('exercise') || 'other'

  // Distance with unit conversion
  const distanceTag = tags.find((t) => t[0] === 'distance')
  let distanceMeters: number | null = null
  if (distanceTag) {
    const value = parseFloat(distanceTag[1])
    const unit = distanceTag[2]?.toLowerCase()
    if (!isNaN(value)) {
      switch (unit) {
        case 'km':
          distanceMeters = value * 1000
          break
        case 'mi':
          distanceMeters = value * 1609.34
          break
        default:
          distanceMeters = value
          break
      }
    }
  }

  // Duration (HH:MM:SS format)
  const durationStr = getTag('duration')
  let durationSeconds: number | null = null
  if (durationStr) {
    const parts = durationStr.split(':').map(Number)
    if (parts.length === 3) {
      durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
    } else if (parts.length === 2) {
      durationSeconds = parts[0] * 60 + parts[1]
    }
  }

  // Calories
  const caloriesStr = getTag('calories')
  const calories = caloriesStr ? parseInt(caloriesStr, 10) || null : null

  return { activityType, distanceMeters, durationSeconds, calories }
}

/**
 * Parse splits from event tags for daily leaderboard
 */
function parseSplitsFromTags(event: NostrEvent): Record<number, number> {
  const splits: Record<number, number> = {}
  const tags = event.tags || []

  for (const tag of tags) {
    if (tag[0] === 'split' && tag.length >= 3) {
      const km = parseInt(tag[1])
      const timeStr = tag[2]

      if (!isNaN(km) && timeStr && km > 0) {
        const seconds = parseTimeToSeconds(timeStr)
        if (seconds > 0) {
          splits[km] = seconds
        }
      }
    }
  }

  return splits
}

function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}

function parseStepCount(event: NostrEvent): number | null {
  const tags = event.tags || []
  for (const tag of tags) {
    if (tag[0] === 'steps' && tag[1]) {
      const steps = parseInt(tag[1])
      return !isNaN(steps) && steps > 0 ? steps : null
    }
  }
  return null
}

/**
 * Calculate target times for leaderboard
 */
function calculateTargetTime(
  splits: Record<number, number>,
  totalDistanceKm: number,
  totalDurationSeconds: number,
  targetKm: number
): number | null {
  if (totalDistanceKm < targetKm) return null

  const exactSplit = splits[targetKm]
  if (exactSplit !== undefined && exactSplit > 0) return exactSplit

  // Interpolation from closest split
  const sortedKms = Object.keys(splits).map(Number).sort((a, b) => a - b)
  let closestKm = 0
  let closestTime = 0

  for (const km of sortedKms) {
    if (km <= targetKm && km > closestKm) {
      closestKm = km
      closestTime = splits[km]
    }
  }

  if (closestKm > 0 && closestTime > 0) {
    const remainingDistance = targetKm - closestKm
    const avgPacePerKm = closestTime / closestKm
    const estimatedTime = closestTime + remainingDistance * avgPacePerKm
    return Math.round(Math.min(estimatedTime, totalDurationSeconds))
  }

  // Fallback: average pace
  if (totalDistanceKm > 0 && totalDurationSeconds > 0) {
    const avgPacePerKm = totalDurationSeconds / totalDistanceKm
    return Math.round(avgPacePerKm * targetKm)
  }

  return null
}

function calculateAllTargetTimes(
  splits: Record<number, number>,
  totalDistanceKm: number,
  totalDurationSeconds: number
) {
  return {
    time_5k_seconds: calculateTargetTime(splits, totalDistanceKm, totalDurationSeconds, 5),
    time_10k_seconds: calculateTargetTime(splits, totalDistanceKm, totalDurationSeconds, 10),
    time_half_seconds: calculateTargetTime(splits, totalDistanceKm, totalDurationSeconds, 21.1),
    time_marathon_seconds: calculateTargetTime(splits, totalDistanceKm, totalDurationSeconds, 42.2),
  }
}

/**
 * Auto-classify "other" workouts based on pace
 */
function classifyOtherWorkout(
  activityType: string,
  distanceMeters: number | null,
  durationSeconds: number | null
): string {
  if (activityType !== 'other') return activityType

  const distanceKm = (distanceMeters || 0) / 1000
  const duration = durationSeconds || 0

  if (distanceKm <= 0 || duration <= 0) return 'other'

  const paceSecondsPerKm = duration / distanceKm

  if (paceSecondsPerKm < 480) return 'running' // < 8:00/km
  if (paceSecondsPerKm > 720) return 'walking' // > 12:00/km
  if (distanceKm >= 1) return 'running' // Ambiguous but significant distance

  return 'other'
}

interface ValidationResult {
  valid: boolean
  reason?: string
}

function validateWorkout(
  activityType: string,
  distanceMeters: number | null,
  durationSeconds: number | null
): ValidationResult {
  const limits = VALIDATION_LIMITS[activityType]
  if (!limits) return { valid: true }

  const distanceKm = (distanceMeters || 0) / 1000
  const duration = durationSeconds || 0

  // Zero distance with significant duration
  if (distanceKm === 0 && duration > 1800) {
    return {
      valid: false,
      reason: `Zero distance with ${Math.round(duration / 60)} min duration`,
    }
  }

  // Distance without duration
  if (distanceKm > 0 && duration === 0) {
    return {
      valid: false,
      reason: `${distanceKm.toFixed(2)} km with 0 duration`,
    }
  }

  // Max distance
  if (distanceKm > limits.maxDistanceKm) {
    return {
      valid: false,
      reason: `Distance ${distanceKm.toFixed(1)} km exceeds max ${limits.maxDistanceKm} km`,
    }
  }

  // Max duration
  if (duration > limits.maxDurationSeconds) {
    return {
      valid: false,
      reason: `Duration exceeds max for ${activityType}`,
    }
  }

  // Pace validation
  if (distanceKm > 0 && duration > 0) {
    const paceSecondsPerKm = duration / distanceKm

    if (paceSecondsPerKm < limits.minPaceSecondsPerKm) {
      return {
        valid: false,
        reason: `Pace too fast for ${activityType}`,
      }
    }

    if (paceSecondsPerKm > limits.maxPaceSecondsPerKm) {
      return {
        valid: false,
        reason: `Pace too slow for ${activityType}`,
      }
    }
  }

  return { valid: true }
}

// =============================================
// NIP-19 UTILITIES
// =============================================

const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

function bech32Encode(prefix: string, words: number[]): string {
  const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

  function polymod(values: number[]): number {
    let chk = 1
    for (const v of values) {
      const top = chk >> 25
      chk = ((chk & 0x1ffffff) << 5) ^ v
      for (let i = 0; i < 5; i++) {
        if ((top >> i) & 1) {
          chk ^= GENERATOR[i]
        }
      }
    }
    return chk
  }

  function hrpExpand(hrp: string): number[] {
    const ret = []
    for (let i = 0; i < hrp.length; i++) {
      ret.push(hrp.charCodeAt(i) >> 5)
    }
    ret.push(0)
    for (let i = 0; i < hrp.length; i++) {
      ret.push(hrp.charCodeAt(i) & 31)
    }
    return ret
  }

  function createChecksum(hrp: string, data: number[]): number[] {
    const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0])
    const mod = polymod(values) ^ 1
    const ret = []
    for (let i = 0; i < 6; i++) {
      ret.push((mod >> (5 * (5 - i))) & 31)
    }
    return ret
  }

  const combined = words.concat(createChecksum(prefix, words))
  let result = prefix + '1'
  for (const w of combined) {
    result += BECH32_ALPHABET[w]
  }
  return result
}

function hexToWords(hex: string): number[] {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16))
  }

  // Convert 8-bit bytes to 5-bit words
  const words = []
  let acc = 0
  let bits = 0

  for (const b of bytes) {
    acc = (acc << 8) | b
    bits += 8
    while (bits >= 5) {
      bits -= 5
      words.push((acc >> bits) & 31)
    }
  }

  if (bits > 0) {
    words.push((acc << (5 - bits)) & 31)
  }

  return words
}

function npubEncode(hexPubkey: string): string {
  const words = hexToWords(hexPubkey)
  return bech32Encode('npub', words)
}

/**
 * Decode npub (bech32) to hex pubkey
 */
function npubDecode(npub: string): string | null {
  if (!npub.startsWith('npub1')) return null

  try {
    const BECH32_REVERSE: Record<string, number> = {}
    for (let i = 0; i < BECH32_ALPHABET.length; i++) {
      BECH32_REVERSE[BECH32_ALPHABET[i]] = i
    }

    // Remove prefix and separator
    const data = npub.slice(5) // Remove 'npub1'

    // Decode bech32 to 5-bit words
    const words: number[] = []
    for (let i = 0; i < data.length - 6; i++) {
      // Exclude 6-char checksum
      const char = data[i]
      const value = BECH32_REVERSE[char]
      if (value === undefined) return null
      words.push(value)
    }

    // Convert 5-bit words to 8-bit bytes
    const bytes: number[] = []
    let acc = 0
    let bits = 0

    for (const word of words) {
      acc = (acc << 5) | word
      bits += 5
      while (bits >= 8) {
        bits -= 8
        bytes.push((acc >> bits) & 0xff)
      }
    }

    // Convert bytes to hex
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

// =============================================
// MAIN SYNC LOGIC
// =============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('=== sync-nostr-workouts started ===')

    // 1. Build participant list: Start with Season II, add competition participants
    const pubkeySet = new Set(SEASON_2_PUBKEYS)

    try {
      // Fetch additional participants from competition_participants table
      const { data: participants, error } = await supabase
        .from('competition_participants')
        .select('npub')

      if (error) {
        console.warn('Failed to fetch competition participants:', error.message)
      } else if (participants) {
        let added = 0
        for (const p of participants) {
          if (p.npub && p.npub.startsWith('npub1')) {
            const hexPubkey = npubDecode(p.npub)
            if (hexPubkey && hexPubkey.length === 64 && !pubkeySet.has(hexPubkey)) {
              pubkeySet.add(hexPubkey)
              added++
            }
          }
        }
        if (added > 0) {
          console.log(`Added ${added} competition participants to sync list`)
        }
      }
    } catch (err) {
      console.warn('Error fetching competition participants:', err)
    }

    const participantPubkeys = Array.from(pubkeySet)
    console.log(`Syncing ${participantPubkeys.length} participants (${SEASON_2_PUBKEYS.length} Season II + extras)`)

    // 2. Query Nostr relays for recent kind 1301 events
    const now = Math.floor(Date.now() / 1000)
    const sincestamp = Math.max(now - SYNC_WINDOW_SECONDS, SEASON_2_START)

    const filter: NostrFilter = {
      kinds: [1301],
      authors: participantPubkeys,
      since: sincestamp,
    }

    console.log(`Query window: last ${SYNC_WINDOW_SECONDS}s (since ${sincestamp})`)

    const events = await queryRelays(RELAYS, filter)

    // 3. Process each event
    const stats = {
      total: events.length,
      submitted: 0,
      duplicates: 0,
      flagged: 0,
      errors: 0,
    }

    for (const event of events) {
      try {
        const npub = npubEncode(event.pubkey)
        const workout = parseWorkoutEvent(event)

        // Check for existing event
        const { data: existing } = await supabase
          .from('workout_submissions')
          .select('id')
          .eq('event_id', event.id)
          .single()

        if (existing) {
          stats.duplicates++
          continue
        }

        // Check flagged
        const { data: flagged } = await supabase
          .from('flagged_workouts')
          .select('id')
          .eq('event_id', event.id)
          .single()

        if (flagged) {
          stats.duplicates++
          continue
        }

        // Classify and validate
        const classifiedType = classifyOtherWorkout(
          workout.activityType,
          workout.distanceMeters,
          workout.durationSeconds
        )

        const validation = validateWorkout(
          classifiedType,
          workout.distanceMeters,
          workout.durationSeconds
        )

        if (validation.valid) {
          // Calculate leaderboard data
          const distanceKm = (workout.distanceMeters || 0) / 1000
          const durationSeconds = workout.durationSeconds || 0
          const splits = parseSplitsFromTags(event)
          const targetTimes = calculateAllTargetTimes(splits, distanceKm, durationSeconds)
          const stepCount = parseStepCount(event)
          const leaderboardDate = new Date(event.created_at * 1000).toISOString().split('T')[0]

          // Insert workout
          const { error: insertError } = await supabase.from('workout_submissions').insert({
            event_id: event.id,
            npub,
            activity_type: classifiedType,
            distance_meters: workout.distanceMeters,
            duration_seconds: workout.durationSeconds,
            calories: workout.calories,
            created_at: new Date(event.created_at * 1000).toISOString(),
            raw_event: event,
            verified: true,
            source: 'nostr_scan',
            splits_json: Object.keys(splits).length > 0 ? splits : null,
            time_5k_seconds: targetTimes.time_5k_seconds,
            time_10k_seconds: targetTimes.time_10k_seconds,
            time_half_seconds: targetTimes.time_half_seconds,
            time_marathon_seconds: targetTimes.time_marathon_seconds,
            step_count: stepCount,
            leaderboard_date: leaderboardDate,
          })

          if (insertError) {
            console.error(`Insert error for ${event.id}:`, insertError.message)
            stats.errors++
          } else {
            console.log(`✅ ${event.id.slice(0, 8)}: ${classifiedType} ${distanceKm.toFixed(1)}km`)
            stats.submitted++
          }
        } else {
          // Insert into flagged_workouts
          await supabase.from('flagged_workouts').insert({
            event_id: event.id,
            npub,
            activity_type: workout.activityType,
            distance_meters: workout.distanceMeters,
            duration_seconds: workout.durationSeconds,
            created_at: new Date(event.created_at * 1000).toISOString(),
            reason: validation.reason,
            raw_event: event,
          })

          console.log(`🚫 ${event.id.slice(0, 8)}: ${validation.reason}`)
          stats.flagged++
        }
      } catch (err) {
        console.error(`Error processing ${event.id}:`, err)
        stats.errors++
      }
    }

    const duration = Date.now() - startTime
    console.log(`\n=== Sync complete in ${duration}ms ===`)
    console.log(`Total: ${stats.total}, New: ${stats.submitted}, Dups: ${stats.duplicates}, Flagged: ${stats.flagged}, Errors: ${stats.errors}`)

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
