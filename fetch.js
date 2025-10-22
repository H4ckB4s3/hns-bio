async function fetchTXTRecords() {
    const fullHostname = window.location.hostname;
    let rootDomain = "";

    if (fullHostname.includes('.hns.bio')) {
        rootDomain = fullHostname.split('.hns.bio')[0];
    } else {
        rootDomain = fullHostname;
    }

    document.title = rootDomain;

    // Fetch and process the root domain's records
    const txtRecords = await fetchAndProcessTXTRecords(rootDomain);

    if (txtRecords) {
        // Apply dynamic favicon and CSS
        await setDynamicFavicon(txtRecords);
        await setDynamicCSS(txtRecords);

        // Process and display the fetched records
        processTXTRecords(txtRecords);

        // Process any external records asynchronously
        txtRecords.forEach(record => {
            if (record.startsWith("ext:")) {
                const externalDomain = record.split("ext:")[1];
                fetchAndProcessTXTRecords(externalDomain).then(processTXTRecords);
            }
        });
    }
}

// Function to set dynamic favicon based on TXT record with "fav:" prefix
async function setDynamicFavicon(txtRecords) {
    if (!txtRecords) return;

    const faviconRecord = txtRecords.find(record => record.startsWith("fav:"));
    if (faviconRecord) {
        const faviconValue = faviconRecord.split("fav:")[1];
        const faviconUrl = `https://${faviconValue}`;
        
        // Update existing favicon link or create new one
        let faviconLink = document.querySelector('link[rel="shortcut icon"]');
        if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'shortcut icon';
            faviconLink.type = 'image/x-icon';
            document.head.appendChild(faviconLink);
        }
        faviconLink.href = faviconUrl;
    }
    // If no "fav:" record exists, default favicon "/img/hns.ico" remains
}

// Function to set dynamic CSS based on TXT record with "css:" prefix
async function setDynamicCSS(txtRecords) {
    if (!txtRecords) return;

    const cssRecord = txtRecords.find(record => record.startsWith("css:"));
    if (cssRecord) {
        const cssValue = cssRecord.split("css:")[1];
        const cssUrl = `/css/${cssValue}.css`; // Self-hosted CSS file path
        
        // Update existing stylesheet link or create new one
        let cssLink = document.querySelector('link[rel="stylesheet"]');
        if (!cssLink) {
            cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            document.head.appendChild(cssLink);
        }
        cssLink.href = cssUrl;
    }
    // If no "css:" record exists, default "style.css?version=1" remains
}

async function fetchAndProcessTXTRecords(domain) {
    const url = `https://resolve.shakestation.io/dns-query?name=${domain}&type=TXT`;
        // alternative node: const url = `https://api.web3dns.net/?name=${domain}&type=TXT`;
        
    console.log("Fetch URL:", url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/dns-json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("DNS Response:", data);

        if (data.Answer && data.Answer.length > 0) {
            return data.Answer
                .filter(record => record.type === 16)
                .map(record => record.data.replace(/"/g, ''));
        } else {
            console.error("No TXT records found in DNS response.");
            document.body.innerHTML = `<p>No TXT records found for this domain.</p><br><a style="color: #fff; text-decoration: none;" href="https://github.com/H4ckB4s3/hns-bio">Do you need help seting up your DID? Check the full documentation</a>`;
            return null;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        document.body.innerHTML = `<p>An error occurred while fetching TXT records: ${error.message}</p><br><a style="color: #fff; text-decoration: none;" href="https://github.com/H4ckB4s3/hns-bio">Do you need help seting up your DID? Check the full documentation</a>`;
        return null;
    }
}


// Helper function to format phone numbers
function formatPhoneNumber(phone) {
    if (phone.startsWith('+')) {
        // Keep the + if it already exists
        return phone;
    } else if (phone.startsWith('00')) {
        // Replace 00 with +
        return '+' + phone.slice(2);
    } else if (/^\d/.test(phone)) {
        // Prepend + if it starts with a digit
        return '+' + phone;
    }
    return phone; // Return unchanged if none of the conditions apply
}

function processTXTRecords(txtRecords) {
    const profileDiv = document.getElementById('profile');
    const linksDiv = document.getElementById('links');
    const currencyButtonsDiv = document.getElementById('currency-buttons');
    let bgSet = false;
    const currencies = { 
        btc: null, ln: null, hns: null, eth: null, xmr: null, zec: null, bat: null,
        aave: null, ada: null, algo: null, apt: null, atom: null, avax: null, 
        bch: null, bgb: null, bnb: null, chainlink: null, cro: null, dai: null, 
        doge: null, dot: null, ena: null, etc: null, fil: null, gt: null, 
        hbar: null, hype: null, icp: null, jup: null, kas: null, leo: null, 
        ltc: null, mnt: null, near: null, okb: null, om: null, ondo: null, 
        op: null, pepe: null, pi: null, pol: null, render: null, shib: null, 
        sol: null, sui: null, tao: null, tia: null, ton: null, trx: null, 
        uni: null, usdc: null, usde: null, usdt: null, vet: null, xlm: null, xrp: null 
    };

    txtRecords.forEach(record => {
        const [key, value] = record.split(':');
        let formattedValue = value;

        // Format phone number for 'tel' key
        if (key === 'tel') {
            formattedValue = formatPhoneNumber(value);
        }

        switch (key) {
            case 'pfp':
                profileDiv.innerHTML = `<img src="https://${value}" alt="Profile Picture">`;
                break;
            case 'bg':
                if (!bgSet) {
                    document.body.style.backgroundImage = `url(https://${value})`;
                    bgSet = true;
                }
                break;
            case 'bgcolor':
                if (!bgSet) {
                    document.body.style.backgroundColor = `#${value}`;
                    bgSet = true;
                }
                break;
            case 'tb':
                linksDiv.innerHTML += `<button class="link" onclick="copyToClipboard('${value}')"><img src="img/${key}.png" alt="${key.toUpperCase()} Icon"></button>`;
                break;
            case 'onion':
		linksDiv.innerHTML += `<a class="link" href="http://${value}" target="_blank"><img src="img/onion.png" alt="Onion Icon"></a>`;
		break;
            case 'x':
                linksDiv.innerHTML += `<a class="link" href="https://x.com/${value}" target="_blank"><img src="img/x.png" alt="X Icon"></a>`;
                break;
            case 'tg':
                linksDiv.innerHTML += `<a class="link" href="https://t.me/${value}" target="_blank"><img src="img/tg.png" alt="Telegram Icon"></a>`;
                break;
            case 'wa':
                linksDiv.innerHTML += `<a class="link" href="https://wa.me/${value}" target="_blank"><img src="img/wa.png" alt="WhatsApp Icon"></a>`;
                break;
            case 'sn':
                linksDiv.innerHTML += `<a class="link" href="https://signal.me/#p/${value}" target="_blank"><img src="img/sn.png" alt="Signal Icon"></a>`;
                break;
            case 'tel':
                linksDiv.innerHTML += `<a class="link" href="tel:${formattedValue}" target="_blank"><img src="img/tel.png" alt="Phone Icon"></a>`;
                break;
            case 'mail':
                linksDiv.innerHTML += `<a class="link" href="mailto:${value}" target="_blank"><img src="img/mail.png" alt="Mail Icon"></a>`;
                break;
            case 'gh':
                linksDiv.innerHTML += `<a class="link" href="https://github.com/${value}" target="_blank"><img src="img/gh.png" alt="GitHub Icon"></a>`;
                break;
            case 'link':
                linksDiv.innerHTML += `<a class="link" href="http://${value}" target="_blank"><img src="img/link.png" alt="Link Icon"></a>`;
                break;
            case 'ig':
                linksDiv.innerHTML += `<a class="link" href="https://www.instagram.com/${value}/" target="_blank"><img src="img/ig.png" alt="Instagram Icon"></a>`;
                break;
            case 'fb':
                linksDiv.innerHTML += `<a class="link" href="https://www.facebook.com/${value}" target="_blank"><img src="img/fb.png" alt="Facebook Icon"></a>`;
                break;
            case 'yt':
                linksDiv.innerHTML += `<a class="link" href="https://www.youtube.com/@${value}" target="_blank"><img src="img/yt.png" alt="Youtube Icon"></a>`;
                break;
            case 'rumble':
                linksDiv.innerHTML += `<a class="link" href="https://rumble.com/${value}" target="_blank"><img src="img/rumble.png" alt="Rumble Icon"></a>`;
                break;  
            case 'ens':
                linksDiv.innerHTML += `<a class="link" href="http://${value}.limo" target="_blank"><img src="img/ens.png" alt="ENS Icon"></a>`;
                break;  
            case 'ipfs':
                linksDiv.innerHTML += `<a class="link" href="http://${value}.ipfs.dweb.link" target="_blank"><img src="img/ipfs.png" alt="IPFS Icon"></a>`;
                break;
            case 'nostr':
                linksDiv.innerHTML += `<a class="link" href="nostr:${value}" target="_blank"><img src="img/nostr.png" alt="Nostr Icon"></a>`;
                break;                                          
            case 'pk':
                linksDiv.innerHTML += `<a class="link" href="http://${value}./" target="_blank"><img src="img/pkdns.png" alt="pkdns Icon"></a>`;
                break;
            case 'matrix':
                linksDiv.innerHTML += `<a class="link" href="https://matrix.to/#/@${value}:matrix.org" target="_blank"><img src="img/matrix.png" alt="Matrix Icon"></a>`;
                break;
            case 'sx':
                linksDiv.innerHTML += `<a class="link" href="https://simplex.chat/contact#/${value.replace(/\s+/g, '')}.onion" target="_blank"><img src="img/simplex.png" alt="SimpleX Icon"></a>`;
                break;
            case 'bsky':
                const bskyURL = value.includes('.') ? `https://bsky.app/profile/${value}` : `https://bsky.app/profile/${value}.bsky.social`;
                linksDiv.innerHTML += `<a class="link" href="${bskyURL}" target="_blank"><img src="img/bsky.png" alt="Bluesky Icon"></a>`;
                break;
            case 'btc':
            case 'ln':
            case 'hns':
            case 'eth':
            case 'xmr':
            case 'zec':
            case 'bat':
            case 'aave':
            case 'ada':
            case 'algo':
            case 'apt':
            case 'atom':
            case 'avax':
            case 'bch':
            case 'bgb':
            case 'bnb':
            case 'chainlink':
            case 'cro':
            case 'dai':
            case 'doge':
            case 'dot':
            case 'ena':
            case 'etc':
            case 'fil':
            case 'gt':
            case 'hbar':
            case 'hype':
            case 'icp':
            case 'jup':
            case 'kas':
            case 'leo':
            case 'ltc':
            case 'mnt':
            case 'near':
            case 'okb':
            case 'om':
            case 'ondo':
            case 'op':
            case 'pepe':
            case 'pi':
            case 'pol':
            case 'render':
            case 'shib':
            case 'sol':
            case 'sui':
            case 'tao':
            case 'tia':
            case 'ton':
            case 'trx':
            case 'uni':
            case 'usdc':
            case 'usde':
            case 'usdt':
            case 'vet':
            case 'xlm':
            case 'xrp':
                currencies[key] = `<button class="currency-button" onclick="copyToClipboard('${value}')"><img src="img/${key}.png" alt="${key.toUpperCase()} Icon"></button>`;
                break;
            default:
                console.warn(`Unhandled record type: ${key}`);
        }
    });

    Object.values(currencies).forEach(button => {
        if (button) {
            currencyButtonsDiv.innerHTML += button;
        }
    });
}


function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            alert(`Copied to clipboard: ${text}`);
        }).catch(err => {
            console.error('Clipboard API failed, using fallback: ', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        alert(`Copied to clipboard: ${text}`);
    } catch (err) {
        console.error('Fallback: Copy failed', err);
    }

    document.body.removeChild(textArea);
}

window.onload = fetchTXTRecords;
