# hns.bio

A simple decentralized hns.bio page built from TXT records on your domain (HNS, DNS, or ENS).

No code required. Add TXT records and your hns.bio appears at `https://yourdomain.hns.bio` or via the search page at [https://hns.bio](https://hns.bio). (Use HNS resolver)

## Setup

1. Open your domain manager (Namebase.io/wallet, bobwallet.org, etc.).
2. Add a TXT record:
   - **Type**: TXT
   - **Name**: `@` (or leave blank)
   - **Value**: `prefix:value` or `prefix=value`

Both `:` and `=` work. Long names are the recommended form; short names work as alternatives.

After saving, visit `https://yourdomain.hns.bio` (replace with your domain) or search for it on [https://hns.bio](https://hns.bio). (Use HNS Resolver)

## Layout

| Prefix   | Alternative | Purpose                  | Example                      |
|----------|-------------|--------------------------|------------------------------|
| `pfp`    |             | hns.bio picture          | `pfp:example.com/pic.png`    |
| `bgcolor`|             | Background color (hex)   | `bgcolor:121212`             |
| `bg`     |             | Background image         | `bg:example.com/bg.png`      |
| `fav`    |             | Favicon                  | `fav:example.com/icon.ico`   |
| `css`    |             | Custom CSS file          | `css:mytheme`                |

## Communication

| Prefix     | Alternatives | Purpose     | Example                          |
|------------|--------------|-------------|----------------------------------|
| `mail`     |              | Email       | `mail:user@example.com`          |
| `tel`      |              | Phone       | `tel:+1234567890`                |
| `simplex`  | `sx`         | SimpleX     | `simplex:your-link`     |
| `signal`   | `sn`         | Signal      | `signal:+1234567890`             |
| `whatsapp` | `wa`         | WhatsApp    | `whatsapp:+1234567890`           |
| `telegram` | `tg`         | Telegram    | `telegram:username`              |
| `matrix`   |              | Matrix      | `matrix:username`                |

**Signal notes**:  
- Phone number (E.164 style, optional `+`) → links to the phone hns.bio.  
- Encrypted username (8–64 chars, letters + numbers/`_-`) → links to the encrypted username hns.bio.

**SimpleX**: The value is used directly as `https://<value>`.

## Web

| Prefix  | Alternatives | Purpose          | Example                |
|---------|--------------|------------------|------------------------|
| `url`   | `link`       | Website          | `url:example.com`      |
| `ens`   |              | ENS name         | `ens:name.eth`         |
| `onion` |              | Onion address    | `onion:example.onion`  |
| `ipfs`  |              | IPFS content     | `ipfs:QmExample`       |
| `pkdns` | `pk`         | PKDNS            | `pkdns:example`        |

## Social

| Prefix     | Alternatives     | Purpose   | Example                          |
|------------|------------------|-----------|----------------------------------|
| `x`        |                  | X         | `x:username`                     |
| `nostr`    |                  | Nostr     | `nostr:npub1...`                 |
| `github`   | `gh`             | GitHub    | `github:username`                |
| `bluesky`  | `bsky`           | Bluesky   | `bluesky:username`               |
| `instagram`| `ig`, `insta`    | Instagram | `instagram:username`             |
| `facebook` | `fb`             | Facebook  | `facebook:username`              |
| `opensea`  |                  | OpenSea   | `opensea:username`               |

**Nostr**: You can also put a bare `npub1...` as the entire TXT record (no prefix needed).

## Media

| Prefix    | Alternatives | Purpose  | Example                  |
|-----------|--------------|----------|--------------------------|
| `youtube` | `yt`         | YouTube  | `youtube:@channelname`   |
| `rumble`  |              | Rumble   | `rumble:channelname`     |

## Wallets

Clicking a wallet button copies the address.

Use the short code as the prefix (both `:` and `=` work):

```
btc:bc1q...
eth:0x...
hns:hs1q...
ln:lnbc...
```

Supported:  
`btc`, `ln`, `hns`, `eth`, `xmr`, `zec`, `bat`, `aave`, `ada`, `algo`, `apt`, `atom`, `avax`, `bch`, `bgb`, `bnb`, `chainlink`, `cro`, `dai`, `doge`, `dot`, `ena`, `etc`, `fil`, `gt`, `hbar`, `hype`, `icp`, `jup`, `kas`, `leo`, `ltc`, `mnt`, `near`, `okb`, `om`, `ondo`, `op`, `pepe`, `pi`, `pol`, `render`, `shib`, `sol`, `sui`, `tao`, `tia`, `ton`, `trx`, `uni`, `usdc`, `usde`, `usdt`, `vet`, `xlm`, `xrp`

**HIP-002**: Wallet addresses are also available at:  
`https://yourdomain.hns.bio/.well-known/wallets/BTC` (uppercase symbol).

**NIP-05** Nostr identifier available at:
`https://yourdomain.hns.bio.well-known/nostr.json`


## Chaining

| Prefix | Purpose                              | Example              |
|--------|--------------------------------------|----------------------|
| `ext`  | Pull TXT records from another domain | `ext:otherdomain.com`|

## Notes

- Works with HNS TLDs/SLDs, ENS names, and regular DNS domains.
- Uses public HNS resolver to fetch the records.
- This is a demo project. Free to use, modify, and improve.

More details and source: [github.com/H4ckB4s3/hns.bio](https://github.com/H4ckB4s3/hns.bio)
