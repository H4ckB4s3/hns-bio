# Setting Up Ubuntu VPS for Nginx with Let's Encrypt Wildcard SSL

This guide provides step-by-step instructions to set up an Ubuntu VPS with Nginx and a Let's Encrypt wildcard SSL certificate for `hns.bio` and `*.hns.bio`.

## 1. Initial Server Setup

Update the system and install required packages.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx git
```

## 2. Create Website Directory

Set up the directory for your website and configure permissions.

```bash
sudo mkdir -p /var/www/hns.bio
sudo chown -R $USER:$USER /var/www/hns.bio
sudo chmod -R 755 /var/www
```

## 3. Set Up DNS Records

Ensure the following DNS records are configured for your domain:

- **A record**: `hns.bio` pointing to your server's IP address.
- **Wildcard A record**: `*.hns.bio` pointing to your server's IP address.

## 4. Obtain Let's Encrypt Wildcard Certificate

Run the following command to obtain a wildcard SSL certificate.

```bash
sudo certbot certonly --manual --preferred-challenges=dns --agree-tos --no-eff-email -d hns.bio -d *.hns.bio --register-unsafely-without-email
```

Letsencrypt renewal:
```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d "*.hns.bio" -d hns.bio
```

Follow the prompts to add a TXT records to your DNS when requested.

## 5. Create Nginx Configuration

Create a new Nginx configuration file.

```bash
sudo nano /etc/nginx/sites-available/hns.bio
```

Paste the following configuration:

```# Redirect all HTTP traffic to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name hns.bio *.hns.bio;
    return 301 https://$host$request_uri;
}

# HTTPS for main domain (hns.bio) -> search.html
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name hns.bio;

    ssl_certificate /etc/letsencrypt/live/hns.bio/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hns.bio/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    root /var/www/hns.bio;
    index search.html;

    location / {
        try_files $uri $uri/ @htmlext;
    }

    location ~ \.html$ {
        try_files $uri =404;
    }

    location @htmlext {
        rewrite ^(.*)$ $1.html last;
    }

    error_page 404 /404.html;
    location = /404.html { internal; }
}

# HTTPS for subdomains (*.hns.bio) -> index.html
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name *.hns.bio;

    ssl_certificate /etc/letsencrypt/live/hns.bio/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hns.bio/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    root /var/www/hns.bio;
    index index.html;

    location / {
        try_files $uri $uri/ @htmlext;
    }

    location ~ \.html$ {
        try_files $uri =404;
    }

    location @htmlext {
        rewrite ^(.*)$ $1.html last;
    }

    error_page 404 /404.html;
    location = /404.html { internal; }
}
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

## 6. Enable the Site

Enable the Nginx configuration and restart the server.

```bash
sudo ln -s /etc/nginx/sites-available/hns.bio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Create a Test HTML File

Create a simple test page to verify the setup.

```bash
echo "<html><body><h1>Welcome to hns.bio!</h1></body></html>" > /var/www/hns.bio/index.html
```

## 8. Verify Setup

- Visit `https://hns.bio` in your browser to confirm the test page loads with SSL.
- Test a subdomain like `https://test.hns.bio` to ensure the wildcard SSL works.

## Important Files and Locations

- **Nginx config**: `/etc/nginx/sites-available/hns.bio`
- **Website files**: `/var/www/hns.bio`
- **SSL certificates**: `/etc/letsencrypt/live/hns.bio/`
- **Nginx logs**: `/var/log/nginx/`
