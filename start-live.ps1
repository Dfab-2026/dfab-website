$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root "frontend"

Write-Host "Starting DFAB backend on port 8000 (localhost + LAN)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; python -m uvicorn --app-dir backend server:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "Starting DFAB frontend on port 3000 (localhost + LAN)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontend'; `$env:HOST='0.0.0.0'; npm start"

Write-Host "Both services were launched in new PowerShell windows."
Write-Host "Local: http://localhost:3000"
Write-Host "LAN:   open http://YOUR-PC-IP:3000 from devices on the same network"
