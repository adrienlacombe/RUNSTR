#!/usr/bin/env node
/**
 * Test LNURL Minimum Amounts
 *
 * Checks what minimum amounts different Lightning addresses accept.
 * The user correctly noted that 5-sat zaps work on Nostr...
 */

const https = require('https');
const http = require('http');

// Test addresses
const ADDRESSES = [
  { name: 'Coinos (RUNSTR)', address: 'RUNSTR@coinos.io' },
  { name: 'Bitcoin Bay', address: 'sats@donate.bitcoinbay.foundation' },
  { name: 'Primal', address: 'bitcoinekasi@primal.net' },
  { name: 'Strike', address: 'bdi@strike.me' },
  { name: 'Wallet of Satoshi', address: 'btchousebali@walletofsatoshi.com' },
  { name: 'Alby', address: 'businesscat@getalby.com' },
  { name: 'Blink', address: 'afribit@blink.sv' },
  { name: 'Geyser', address: 'bitcoinyucatancommunity@geyser.fund' },
];

function fetchLNURL(address) {
  return new Promise((resolve, reject) => {
    const [name, domain] = address.split('@');
    const url = `https://${domain}/.well-known/lnurlp/${name}`;

    const req = https.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${data.slice(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  console.log('🔍 LNURL Minimum Amount Analysis\n');
  console.log('='.repeat(70));
  console.log('Address'.padEnd(35) + 'Min (sats)'.padEnd(15) + 'Max (sats)');
  console.log('-'.repeat(70));

  const results = [];

  for (const { name, address } of ADDRESSES) {
    try {
      const data = await fetchLNURL(address);

      // LNURL returns amounts in millisatoshis
      const minSats = Math.ceil(data.minSendable / 1000);
      const maxSats = Math.floor(data.maxSendable / 1000);

      console.log(`${name.padEnd(35)}${minSats.toString().padEnd(15)}${maxSats.toLocaleString()}`);
      results.push({ name, address, minSats, maxSats, error: null });
    } catch (error) {
      console.log(`${name.padEnd(35)}❌ ${error.message.slice(0, 30)}`);
      results.push({ name, address, minSats: null, maxSats: null, error: error.message });
    }
  }

  console.log('='.repeat(70));

  // Analysis
  const working = results.filter(r => r.minSats !== null);
  if (working.length > 0) {
    const mins = working.map(r => r.minSats);
    const lowestMin = Math.min(...mins);
    const highestMin = Math.max(...mins);

    console.log(`\n📊 Analysis:`);
    console.log(`   Lowest minimum: ${lowestMin} sats`);
    console.log(`   Highest minimum: ${highestMin} sats`);
    console.log(`   Addresses accepting 1 sat: ${working.filter(r => r.minSats <= 1).length}/${working.length}`);
    console.log(`   Addresses accepting 5 sats: ${working.filter(r => r.minSats <= 5).length}/${working.length}`);
    console.log(`   Addresses accepting 10 sats: ${working.filter(r => r.minSats <= 10).length}/${working.length}`);
  }

  // Test specific amounts
  console.log(`\n📋 Which addresses accept specific amounts?`);
  for (const testAmount of [1, 2, 3, 5, 10]) {
    const accepting = working.filter(r => r.minSats <= testAmount).map(r => r.name);
    console.log(`   ${testAmount} sats: ${accepting.length > 0 ? accepting.join(', ') : 'None'}`);
  }

  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
