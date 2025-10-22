const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 🔹 Keep-alive HTTPS agent
const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

// Cache storage
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

// --- Bech32 & hex conversion for Nostr ---
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const ALPHABET_MAP = {};
for (let z = 0; z < ALPHABET.length; z++) {
    ALPHABET_MAP[ALPHABET.charAt(z)] = z;
}

function polymodStep(pre) {
    const b = pre >> 25;
    return (((pre & 0x1ffffff) << 5) ^
        (-((b >> 0) & 1) & 0x3b6a57b2) ^
        (-((b >> 1) & 1) & 0x26508e6d) ^
        (-((b >> 2) & 1) & 0x1ea119fa) ^
        (-((b >> 3) & 1) & 0x3d4233dd) ^
        (-((b >> 4) & 1) & 0x2a1462b3));
}

function prefixChk(prefix) {
    let chk = 1;
    for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ (c >> 5);
    }
    chk = polymodStep(chk);
    for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ (v & 0x1f);
    }
    return chk;
}

function convertbits(data, inBits, outBits, pad) {
    let value = 0;
    let bits = 0;
    const maxV = (1 << outBits) - 1;
    const result = [];
    for (let i = 0; i < data.length; ++i) {
        value = (value << inBits) | data[i];
        bits += inBits;
        while (bits >= outBits) {
            bits -= outBits;
            result.push((value >> bits) & maxV);
        }
    }
    if (pad) {
        if (bits > 0) {
            result.push((value << (outBits - bits)) & maxV);
        }
    } else {
        if (bits >= inBits) return 'Excess padding';
        if ((value << (outBits - bits)) & maxV) return 'Non-zero padding';
    }
    return result;
}

function fromWords(words) {
    const res = convertbits(words, 5, 8, false);
    if (Array.isArray(res)) return res;
    throw new Error(res);
}

function getLibraryFromEncoding(encoding) {
    const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;
    function decode(str, LIMIT) {
        LIMIT = LIMIT || 90;
        const lowered = str.toLowerCase();
        str = lowered;
        const split = str.lastIndexOf('1');
        const prefix = str.slice(0, split);
        const wordChars = str.slice(split + 1);
        let chk = prefixChk(prefix);
        const words = [];
        for (let i = 0; i < wordChars.length; ++i) {
            const c = wordChars.charAt(i);
            const v = ALPHABET_MAP[c];
            chk = polymodStep(chk) ^ v;
            if (i + 6 >= wordChars.length) continue;
            words.push(v);
        }
        return { prefix, words };
    }
    return { decode };
}

const bech32 = getLibraryFromEncoding('bech32');

function hex_encode(buf) {
    let str = "";
    for (let i = 0; i < buf.length; i++) {
        str += buf[i].toString(16).padStart(2, '0');
    }
    return str;
}

function bech32ToHex(bech) {
    try {
        const decoded = bech32.decode(bech);
        const bytes = fromWords(decoded.words);
        return hex_encode(bytes);
    } catch (e) {
        return bech; // fallback: return as is if invalid
    }
}

// Supported currencies for HIP-0002 (with uppercase symbols)
const currencies = {
    btc: { name: "Bitcoin", decimals: 8, symbol: "BTC" },
    ln: { name: "Lightning Network", decimals: 0, symbol: "LN" },
    hns: { name: "Handshake", decimals: 6, symbol: "HNS" },
    eth: { name: "Ethereum", decimals: 18, symbol: "ETH" },
    xmr: { name: "Monero", decimals: 12, symbol: "XMR" },
    zec: { name: "Zcash", decimals: 8, symbol: "ZEC" },
    bat: { name: "Basic Attention Token", decimals: 18, symbol: "BAT" },
    aave: { name: "Aave", decimals: 18, symbol: "AAVE" },
    ada: { name: "Cardano", decimals: 6, symbol: "ADA" },
    algo: { name: "Algorand", decimals: 6, symbol: "ALGO" },
    apt: { name: "Aptos", decimals: 8, symbol: "APT" },
    atom: { name: "Cosmos", decimals: 6, symbol: "ATOM" },
    avax: { name: "Avalanche", decimals: 18, symbol: "AVAX" },
    bch: { name: "Bitcoin Cash", decimals: 8, symbol: "BCH" },
    bgb: { name: "Bitget Token", decimals: 18, symbol: "BGB" },
    bnb: { name: "Binance Coin", decimals: 18, symbol: "BNB" },
    cro: { name: "Crypto.com Coin", decimals: 8, symbol: "CRO" },
    dai: { name: "Dai", decimals: 18, symbol: "DAI" },
    doge: { name: "Dogecoin", decimals: 8, symbol: "DOGE" },
    dot: { name: "Polkadot", decimals: 10, symbol: "DOT" },
    ena: { name: "Ethena", decimals: 18, symbol: "ENA" },
    etc: { name: "Ethereum Classic", decimals: 18, symbol: "ETC" },
    fil: { name: "Filecoin", decimals: 18, symbol: "FIL" },
    gt: { name: "GateToken", decimals: 18, symbol: "GT" },
    hbar: { name: "Hedera", decimals: 8, symbol: "HBAR" },
    hype: { name: "Hyperliquid", decimals: 18, symbol: "HYPE" },
    icp: { name: "Internet Computer", decimals: 8, symbol: "ICP" },
    jup: { name: "Jupiter", decimals: 6, symbol: "JUP" },
    kas: { name: "Kaspa", decimals: 8, symbol: "KAS" },
    leo: { name: "LEO Token", decimals: 18, symbol: "LEO" },
    ltc: { name: "Litecoin", decimals: 8, symbol: "LTC" },
    mnt: { name: "Mantle", decimals: 18, symbol: "MNT" },
    near: { name: "NEAR Protocol", decimals: 24, symbol: "NEAR" },
    okb: { name: "OKB", decimals: 18, symbol: "OKB" },
    om: { name: "MANTRA", decimals: 18, symbol: "OM" },
    ondo: { name: "Ondo Finance", decimals: 18, symbol: "ONDO" },
    op: { name: "Optimism", decimals: 18, symbol: "OP" },
    pepe: { name: "Pepe", decimals: 18, symbol: "PEPE" },
    pi: { name: "Pi Network", decimals: 0, symbol: "PI" },
    pol: { name: "Polygon", decimals: 18, symbol: "MATIC" },
    render: { name: "Render Token", decimals: 18, symbol: "RENDER" },
    shib: { name: "Shiba Inu", decimals: 18, symbol: "SHIB" },
    sol: { name: "Solana", decimals: 9, symbol: "SOL" },
    sui: { name: "Sui", decimals: 9, symbol: "SUI" },
    tao: { name: "Bittensor", decimals: 9, symbol: "TAO" },
    tia: { name: "Celestia", decimals: 6, symbol: "TIA" },
    ton: { name: "Toncoin", decimals: 9, symbol: "TON" },
    trx: { name: "TRON", decimals: 6, symbol: "TRX" },
    uni: { name: "Uniswap", decimals: 18, symbol: "UNI" },
    usdc: { name: "USD Coin", decimals: 6, symbol: "USDC" },
    usde: { name: "Ethena USDe", decimals: 18, symbol: "USDE" },
    usdt: { name: "Tether", decimals: 6, symbol: "USDT" },
    vet: { name: "VeChain", decimals: 18, symbol: "VET" },
    xlm: { name: "Stellar", decimals: 7, symbol: "XLM" },
    xrp: { name: "Ripple", decimals: 6, symbol: "XRP" }
};

// --- Combined DNS fetch for both wallets and Nostr ---
async function fetchCombinedData(subdomain) {
    const queryDomain = `${subdomain}`;
    const dnsUrl = `https://resolve.shakestation.io/dns-query?name=${encodeURIComponent(queryDomain)}&type=TXT`;

    return new Promise((resolve, reject) => {
        https.get(
            dnsUrl,
            {
                headers: { 'Accept': 'application/dns-json' },
                agent: keepAliveAgent
            },
            (dnsRes) => {
                let data = '';
                dnsRes.on('data', chunk => data += chunk);
                dnsRes.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        const wallets = {};
                        const nostrData = {
                            pubkeys: {},
                            aliases: {}
                        };

                        if (result.Answer) {
                            for (const record of result.Answer) {
                                if (record.type === 16) {
                                    const txt = record.data.replace(/^"|"$/g, '');
                                    
                                    // Check for wallet addresses in format: currency:address (case insensitive)
                                    for (const [currencyKey, currencyInfo] of Object.entries(currencies)) {
                                        const prefixes = [
                                            `${currencyKey}:`,  // lowercase
                                            `${currencyKey.toUpperCase()}:`,  // uppercase
                                            `${currencyInfo.symbol.toLowerCase()}:`,  // symbol lowercase
                                            `${currencyInfo.symbol}:`  // symbol uppercase
                                        ];
                                        
                                        for (const prefix of prefixes) {
                                            if (txt.startsWith(prefix)) {
                                                const address = txt.slice(prefix.length).trim();
                                                // Store with uppercase symbol as key
                                                wallets[currencyInfo.symbol] = {
                                                    symbol: currencyInfo.symbol,
                                                    name: currencyInfo.name,
                                                    address: address,
                                                    decimals: currencyInfo.decimals,
                                                    currencyKey: currencyKey
                                                };
                                                break;
                                            }
                                        }
                                    }

                                    // Check for Nostr records (from original script)
                                    // Match nostr: to nostr12:
                                    for (let i = 0; i <= 12; i++) {
                                        const keyPrefix = i === 0 ? 'nostr:' : `nostr${i}:`;
                                        if (txt.startsWith(keyPrefix)) {
                                            nostrData.pubkeys[i] = txt.slice(keyPrefix.length);
                                        }
                                    }

                                    // Match nostrname: to nostrname12:
                                    for (let i = 0; i <= 12; i++) {
                                        const namePrefix = i === 0 ? 'nostrname:' : `nostrname${i}:`;
                                        if (txt.startsWith(namePrefix)) {
                                            if (!nostrData.aliases[i]) nostrData.aliases[i] = [];
                                            nostrData.aliases[i].push(txt.slice(namePrefix.length));
                                        }
                                    }
                                }
                            }
                        }

                        resolve({ wallets, nostrData });
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        ).on('error', reject);
    });
}

// --- HTTP server ---
const server = http.createServer(async (req, res) => {
    const { pathname, query } = url.parse(req.url, true);
    
    // Extract subdomain from host header for wildcard domains
    const host = req.headers.host;
    let subdomain = query.subdomain;
    
    if (!subdomain && host && host.endsWith('.hns.bio')) {
        subdomain = host.replace('.hns.bio', '');
    }

    // Handle NIP-05 requests (backward compatibility)
    if (pathname === '/nostr.json' && subdomain) {
        await handleNostrRequest(req, res, subdomain);
        return;
    }

    // Handle HIP-0002 wallet requests with UPPERCASE symbols
    if (pathname.startsWith('/.well-known/wallets/') && subdomain) {
        await handleWalletRequest(req, res, subdomain, pathname);
        return;
    }

    // Handle root wallet directory
    if (pathname === '/.well-known/wallets' && subdomain) {
        await handleWalletDirectory(req, res, subdomain);
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

async function handleNostrRequest(req, res, subdomain) {
    const cacheKey = `nostr:${subdomain}`;
    let cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT'
        });
        res.end(JSON.stringify(cached.data));
        return;
    }

    try {
        const { nostrData } = await fetchCombinedData(subdomain);
        const names = {};

        // Process Nostr data (from original script)
        for (let i = 0; i <= 12; i++) {
            const pubkey = nostrData.pubkeys[i] ? bech32ToHex(nostrData.pubkeys[i]) : null;
            if (nostrData.aliases[i]) {
                nostrData.aliases[i].forEach(alias => {
                    names[alias] = pubkey;
                });
            } else if (pubkey) {
                names[subdomain] = pubkey; // fallback to subdomain
            }
        }

        const responseData = Object.keys(names).length
            ? { names }
            : { names: {} };

        cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
        });

        res.writeHead(Object.keys(names).length ? 200 : 404, {
            'Content-Type': 'application/json',
            'X-Cache': 'MISS'
        });
        res.end(JSON.stringify(responseData));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

async function handleWalletRequest(req, res, subdomain, pathname) {
    // Extract symbol from path and convert to uppercase
    const requestedSymbol = pathname.split('/').pop().toUpperCase();
    const cacheKey = `wallet:${subdomain}:${requestedSymbol}`;
    
    let cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'X-Cache': 'HIT',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(cached.data); // Return plain text address
        return;
    }

    try {
        const { wallets } = await fetchCombinedData(subdomain);
        const wallet = wallets[requestedSymbol];

        if (!wallet) {
            res.writeHead(404, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(`No ${requestedSymbol} wallet found for ${subdomain}.hns.bio`);
            return;
        }

        const address = wallet.address;

        cache.set(cacheKey, {
            data: address, // Store only the address string for cache
            timestamp: Date.now()
        });

        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'X-Cache': 'MISS'
        });
        res.end(address); // Return just the address as plain text
    } catch (error) {
        res.writeHead(500, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        res.end('Internal server error');
    }
}

async function handleWalletDirectory(req, res, subdomain) {
    const cacheKey = `walletdir:${subdomain}`;
    
    let cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(cached.data));
        return;
    }

    try {
        const { wallets } = await fetchCombinedData(subdomain);
        const walletList = Object.values(wallets).map(wallet => ({
            symbol: wallet.symbol,
            name: wallet.name,
            address: wallet.address,
            decimals: wallet.decimals,
            endpoint: `/.well-known/wallets/${wallet.symbol}`
        }));

        const responseData = {
            domain: `${subdomain}.hns.bio`,
            wallets: walletList,
            count: walletList.length,
            timestamp: new Date().toISOString()
        };

        cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
        });

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Cache': 'MISS'
        });
        res.end(JSON.stringify(responseData));
    } catch (error) {
        res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

server.listen(3001, '127.0.0.1', () => {
    console.log('HIP-0002 Wallet Server running on http://127.0.0.1:3001');
    console.log('Wallet endpoints now served in UPPERCASE as plain text:');
    console.log('  https://domain.hns.bio/.well-known/wallets/BTC');
    console.log('  https://domain.hns.bio/.well-known/wallets/ETH');
    console.log('  https://domain.hns.bio/.well-known/wallets/HNS');
    console.log('Nostr endpoints:');
    console.log('  https://domain.hns.bio/.well-known/nostr.json');
});
