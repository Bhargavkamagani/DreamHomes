$backendRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPython = Join-Path $backendRoot "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
  Write-Error "Backend virtual environment was not found at $venvPython"
  exit 1
}

Set-Location $backendRoot
& $venvPython -m uvicorn app.main:app --reload
