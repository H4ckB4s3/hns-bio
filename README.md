# HNS.BIO
Fetches TXT records and displays them in a Linktree-style interface.

# TXT Record Prefix Documentation

This repository provides comprehensive documentation for TXT record prefixes used with Handshake (HNS) TLDs. These prefixes facilitate standardized data interpretation, enabling clients to easily recognize and interact with on-chain and off-chain records.

## Introduction

Handshake TLDs empower individuals and organizations with **total ownership** and **sovereign identity** by providing immutable, censorship-resistant on-chain records. This ensures that your data is securely published without the risk of alteration or suppression by centralized entities.

TXT record prefixes standardize how information is structured and interpreted, making it easier for services and applications to extract the intended data seamlessly.

---

## Setup Instructions

1. Navigate to your domain manager (e.g., [Shakestation](https://shakestation.io), [Namebase](https://namebase.io), ...).
2. Add a new TXT record with the following configuration:
   - **Type**: TXT  
   - **Name**: `@`  
   - **Value/Data**: `<prefix>:<value>` (e.g., `link:example.com`)  
   - **TTL**: 60 minutes  

3. After configuration, visit:  https://hackbase.hns.bio (Replace "hackbase" with your actual TLD or desired domain name.) or search for SLD's (ICANN/HNS) on the index page: https://hns.bio


---

## List of Prefixes

### Layout
| **Prefix**                   | **Purpose**                      | **Example**                |
|------------------------------|----------------------------------|----------------------------|
| `pfp:<url>`                  | Profile picture URL              | `pfp:example.com/img.png`  |
| `bgcolor:<hex>`              | Background color in HEX format   | `bgcolor:ffffff`           |
| `bg:<url>`                   | Background image URL             | `bg:example.com/bg_img.png`|

### Communication
| **Prefix**                   | **Purpose**                      | **Example**                |
|------------------------------|----------------------------------|----------------------------|
| `mail:<email>`               | Email address                    | `mail:example@example.com` |
| `tel:<number>`               | Phone number                     | `tel:+1234567890`          |
| `tb:<username>`              | Thunderbolt identifier           | `tb:username`              |
| `sx:<contactcode>`           | SimpleX Chat	                  | `sx:contactcode`           |
| `matrix:<username>`          | Matrix username                  | `matrix:username`          |
| `sn:<number>`                | Signal profile                   | `sn:+1234567890`           |
| `wa:<number>`                | WhatsApp                         | `wa:+1234567890`           |
| `tg:<username>`              | Telegram                         | `tg:username`              |
| `tel:<number>`               | Phone number                     | `tel:+1234567890`          |


### Web
| **Prefix**                   | **Purpose**                      | **Example**                |
|------------------------------|----------------------------------|----------------------------|
| `link:<url>`                 | Redirect to a webpage            | `link:example.com`         |
| `ens:<url>`                  | Ethereum Name Service            | `ens:vitalik.eth`          |
| `onion:<url>`                | Onion address                    | `onion:example`            |
| `ipfs:<url>`                 | IPFS content                     | `ipfs:QmExample`           |
| `pk:<url>`                   | pkdns page                       | `pk:example`               |

### Social
| **Prefix**                   | **Purpose**                      | **Example**                |
|------------------------------|----------------------------------|----------------------------|
| `x:<username>`               | X (formerly Twitter) profile     | `x:username`               |
| `nostr:<npub>`               | Nostr public key                 | `nostr:npub123`            |
| `gh:<username>`              | GitHub profile/repo              | `gh:username`              |
| `bsky:<username>`            | Bluesky profile                  | `bsky:username`            |
| `ig:<username>`              | Instagram profile                | `ig:username`              |
| `fb:<username>`              | Facebook profile                 | `fb:username`              |

### Media
| **Prefix**                   | **Purpose**                      | **Example**                |
|------------------------------|----------------------------------|----------------------------|
| `yt:<username>`              | YouTube channel/URL              | `yt:username`              |
| `rumble:<channelname>`       | Rumble channel/URL	            | `rumble:channelname`       |

### Wallet
| **Prefix**                   | **Purpose**                      | **Example**                |
|------------------------------|----------------------------------|----------------------------|
| `btc:<address>`              | Bitcoin wallet address           | `btc:btc_address`          |
| `hns:<address>`              | Handshake wallet address         | `hns:hns_address`          |
| `xmr:<address>`              | Monero wallet address            | `xmr:xmr_address`          |
| `eth:<address>`              | Ethereum wallet address          | `eth:eth_address`          |

#### Compatible wallet addresses:
btc, ln, hns, eth, xmr, zec, bat, aave, ada, algo, apt, atom, avax, bch, bgb, bnb, chainlink, cro, dai, doge, dot, ena, etc, fil, gt, hbar, hype, icp, jup, kas, leo, ltc, mnt, near, okb, om, ondo, op, pepe, pi, pol, render, shib, sol, sui, tao, tia, ton, trx, uni, usdc, usde, usdt, vet, xlm, xrp

### External Records
| **Prefix**                   | **Purpose**                      | **Example**                |
|------------------------------|----------------------------------|----------------------------|
| `ext:<url>`              | Fetch TXT records from an external TLD or SLD (HNS/ICANN)           | `ext:example.com`          |
---

# Note:
This is an experimental demo. It uses an HNS node (by [eskimo](https://github.com/eskimo)) to fetch the TXT records. When an NS is set up, it will fetch only off-chain TXT records.. It works with Handshake HNS TLDs, HNS SLDs, HNS dSLDs, and ICANN SLDs.

The primary goal of this demo is to establish a universal standard for TXT records and pave the way for APIs supporting wallets, socials, logins,...

## License

No license, no limits. Free to use, abuse and improve this code however you see fit.



