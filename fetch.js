document.getElementById('hns-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let query = document.getElementById('hns-input').value.trim();

    // Remove http://, https://, or leading dots from the input
    query = query.replace(/^https?:\/\//, '').replace(/^\./, '');

    // Replace spaces with dots
    query = query.replace(/\s+/g, '.');

    if (query) {
        const parts = query.split('/');
        let domain = parts.shift();
        const path = parts.join('/');

        // Check if it's an .eth domain
        const ethPattern = /\.eth$/;
        if (ethPattern.test(domain)) {
            domain += '.limo';
            const url = path ? `http://${domain}/${path}` : `http://${domain}`;
            window.open(url, '_blank');
            return;
        }

        // For Handshake domains, fetch TXT records and process them
        handleHandshakeDomain(domain, path);
    }
});

// Settings menu toggle
const settingsButton = document.querySelector('.settings-button');
const settingsMenu = document.querySelector('.settings-menu');

settingsButton.addEventListener('click', () => {
    settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (event) => {
    if (!settingsButton.contains(event.target) && !settingsMenu.contains(event.target)) {
        settingsMenu.style.display = 'none';
    }
});

document.getElementById('hns-input').focus();

// Function to handle Handshake domain TXT record lookup and redirection
async function handleHandshakeDomain(domain, path) {
    try {
        const txtRecords = await fetchTXTRecords(domain);
        
        if (!txtRecords || txtRecords.length === 0) {
            // Fallback to standard HNS resolution if no TXT records found
            const url = path ? `http://${domain}.hns.to/${path}` : `http://${domain}.hns.to`;
            window.open(url, '_blank');
            return;
        }

        // Process TXT records in order of priority
        let redirectPerformed = false;
        
        for (const record of txtRecords) {
            const [prefix, ...dataParts] = record.split(':');
            const data = dataParts.join(':');
            
            if (!prefix || !data) continue;
            
            switch (prefix.toLowerCase()) {
                case 'link':
                    // Redirect to https://<data>
                    const linkUrl = `https://${data}`;
                    window.open(linkUrl, '_blank');
                    redirectPerformed = true;
                    break;
                    
                case 'url':
                    // Redirect to https://<data>
                    const url = `https://${data}`;
                    window.open(url, '_blank');
                    redirectPerformed = true;
                    break;
                    
                case 'ipfs':
                    // Redirect to https://<data>ipfs.inbrowser.link
                    const ipfsUrl = `https://${data}ipfs.inbrowser.link`;
                    window.open(ipfsUrl, '_blank');
                    redirectPerformed = true;
                    break;
                    
                case 'onion':
                    // Redirect to http://<data>
                    const onionUrl = `http://${data}`;
                    window.open(onionUrl, '_blank');
                    redirectPerformed = true;
                    break;
                    
                case 'nostr':
                    // Redirect to nostr:<data>
                    window.open(`nostr:${data}`, '_blank');
                    redirectPerformed = true;
                    break;
                    
                case 'ens':
                    // Redirect to https://<data>.limo
                    const ensUrl = `https://${data}.limo`;
                    window.open(ensUrl, '_blank');
                    redirectPerformed = true;
                    break;
            }
            
            // Stop after first matching redirect
            if (redirectPerformed) break;
        }
        
        // If no redirect was performed, fallback to standard HNS resolution
        if (!redirectPerformed) {
            const url = path ? `http://${domain}.hns.to/${path}` : `http://${domain}.hns.to`;
            window.open(url, '_blank');
        }
        
    } catch (error) {
        console.error('Error fetching TXT records:', error);
        // Fallback to standard HNS resolution on error
        const url = path ? `http://${domain}.hns.to/${path}` : `http://${domain}.hns.to`;
        window.open(url, '_blank');
    }
}

// Function to fetch TXT records for a domain
async function fetchTXTRecords(domain) {
    const url = `https://resolve.shakestation.io/dns-query?name=${domain}&type=TXT`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/dns-json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("DNS Response for", domain, ":", data);

        if (data.Answer && data.Answer.length > 0) {
            return data.Answer
                .filter(record => record.type === 16)
                .map(record => record.data.replace(/"/g, ''));
        } else {
            console.log("No TXT records found for domain:", domain);
            return [];
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}
