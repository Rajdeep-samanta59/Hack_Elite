# PowerShell helper to setup and run the Face Detection Python service on Windows
# Usage: Open PowerShell (as normal user) and run:
#   cd "<repo>/Face Detection"
#   .\start_face_service.ps1
# This script will create a venv, install requirements (if needed) and run the face stream server.

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

Write-Host "Working directory: $scriptDir"

# Ensure python is available
try {
    $py = Get-Command python -ErrorAction Stop
} catch {
    Write-Error "Python executable not found in PATH. Please install Python 3.8+ and add it to PATH."; exit 1
}

# Create virtualenv if missing
$venvPy = Join-Path $scriptDir ".venv\Scripts\python.exe"
if (!(Test-Path $venvPy)) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

# Upgrade pip and install requirements
Write-Host "Installing/upgrading pip and requirements (this may take a minute)..."
& $venvPy -m pip install --upgrade pip
try {
    & $venvPy -m pip install -r .\requirements.txt
} catch {
    Write-Warning "Failed to install some packages from requirements.txt. Trying with a pinned opencv-contrib wheel..."
    & $venvPy -m pip install --upgrade pip
    & $venvPy -m pip install flask flask-cors numpy
    # Try a compatible opencv-contrib version
    & $venvPy -m pip install opencv-contrib-python==4.5.5.64
}

Write-Host "Starting Face Detection service (facedetector.py) on port 8001..."
# Run the server (will block). Use -NoNewWindow to preserve console output in same terminal.
& $venvPy .\facedetector.py
