## Recommended Workflow


# 1. Test configuration
```bash
sudo nginx -t
```
# 2. If test passes, reload (preserves active connections)
```bash
sudo systemctl reload nginx
```
# 3. Check status to ensure it's running properly
```bash
sudo systemctl status nginx
```
## Additional Useful Commands
# Check nginx error logs if issues occur
```bash
sudo tail -f /var/log/nginx/error.log
```
# Check nginx access logs
```bash
sudo tail -f /var/log/nginx/access.log
```
# View full nginx status
```bash
sudo systemctl status nginx -l
```
