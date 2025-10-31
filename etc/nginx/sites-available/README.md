## Recommended Workflow

```bash
# 1. Test configuration
sudo nginx -t
```
# 2. If test passes, reload (preserves active connections)
sudo systemctl reload nginx

# 3. Check status to ensure it's running properly
sudo systemctl status nginx

## Additional Useful Commands
# Check nginx error logs if issues occur
sudo tail -f /var/log/nginx/error.log

# Check nginx access logs
sudo tail -f /var/log/nginx/access.log

# View full nginx status
sudo systemctl status nginx -l
