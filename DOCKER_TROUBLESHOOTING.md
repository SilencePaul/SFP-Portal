# Docker Desktop Troubleshooting - Stuck at Startup

## Quick Fix (Try These First)

### 1. **Force Quit and Restart**

```bash
# PowerShell (Run as Administrator)

# Kill all Docker processes
Get-Process docker* | Stop-Process -Force
Get-Process com.docker* | Stop-Process -Force

# Wait 10 seconds
Start-Sleep -Seconds 10

# Restart Docker Desktop
# Right-click Docker icon in system tray → Open
# OR
Start-Process "C:\Program Files\Docker\Docker\Docker.exe"

# Wait for it to start (2-3 minutes)
```

### 2. **Restart Windows Subsystem for Linux (WSL2)**

```bash
# PowerShell (Run as Administrator)

# Shutdown WSL2
wsl --shutdown

# Restart Docker Desktop
# System tray → Docker icon → Open
```

### 3. **Reset Docker to Factory Settings**

```bash
# Docker Menu → Preferences → Reset

# Select "Reset to factory defaults"
# WARNING: This will delete all containers and images
```

## Deeper Troubleshooting

### 4. **Check Docker Logs**

```bash
# Find Docker logs
C:\Users\[YourUsername]\AppData\Local\Docker\log.txt

# Or access via PowerShell:
Get-Content "$env:APPDATA\Docker\log.txt" -Tail 100
```

### 5. **Check System Resources**

```bash
# PowerShell - Check memory and disk space
Get-ComputerInfo | Select-Object CsSystemType, CsTotalPhysicalMemory

# Check available disk space
Get-Volume

# Docker needs:
# - At least 2 GB free disk space
# - 4 GB RAM minimum (8 GB recommended)
```

### 6. **Check Windows Hyper-V**

```bash
# PowerShell (Run as Administrator)

# Verify Hyper-V is enabled
Get-WindowsOptionalFeature -Online -FeatureName Hyper-V

# If not enabled, enable it:
Enable-WindowsOptionalFeature -Online -FeatureName Hyper-V

# RESTART YOUR COMPUTER
```

### 7. **Update/Reinstall Docker**

```bash
# Download latest Docker Desktop
# https://www.docker.com/products/docker-desktop

# Uninstall current version
# Settings → Apps → Apps & features → Docker Desktop → Uninstall

# Reinstall fresh version
```

## Alternative: Use Docker CLI Without Desktop

If Docker Desktop won't start, you can still use Docker via Windows Terminal:

```bash
# Install Docker CLI only (without the GUI):
winget install Docker.DockerCLI

# Or use Docker on WSL2 only:
wsl --install -d Ubuntu
# Then: wsl apt-get install -y docker.io
```

## Check If Docker is Running

```bash
# Test connection
docker version

# If successful, you'll see:
# Client: Docker Engine Community
# Server: Docker Engine Community

# Test by running a simple container
docker run hello-world
```

## Temporary Workaround - Manual Local Testing

While you fix Docker, you can still test locally without containerization:

```bash
# Terminal 1 - Start PostgreSQL (if installed locally)
pg_ctl -D "C:\Program Files\PostgreSQL\18\data" start

# Terminal 2 - Start Redis (if installed locally)
redis-server

# Terminal 3 - Start API
cd api
pnpm start

# Terminal 4 - Start Web
cd web
pnpm run dev
```

## If Nothing Works

### Last Resort: Fresh Install

1. **Backup your work** (git commit everything)
2. **Uninstall Docker completely:**
   - Settings → Apps → Apps & features → Docker Desktop → Uninstall
   - Restart computer
3. **Remove Docker data:**

   ```bash
   # PowerShell (Run as Administrator)
   Remove-Item -Recurse "$env:APPDATA\Docker"
   Remove-Item -Recurse "$env:ProgramData\Docker"
   ```

4. **Reinstall fresh:**
   - Download: https://www.docker.com/products/docker-desktop
   - Install with default settings
   - Restart computer
   - Open Docker Desktop and wait for full startup

## Still Stuck?

Try these resources:

- [Docker Troubleshooting on Windows](https://docs.docker.com/desktop/troubleshoot/topics/windows/)
- [Docker Community Forums](https://forums.docker.com/)
- [GitHub Issues - Docker Desktop](https://github.com/docker/for-win/issues)

## For Now - Proceed Without Docker

Since Docker is stuck, we can:

1. ✅ Continue development locally (you're already doing this)
2. ✅ Keep the Docker/K8s files ready for when Docker works
3. ✅ Test the full stack once Docker is back online
4. ✅ Move forward with other tasks (update todo list, etc.)

Let me know once Docker is back, and we can proceed with containerization!
