param(
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$AdminDatabase = "postgres",
    [string]$UserName = "postgres"
)

$schemaPath = Join-Path $PSScriptRoot "schema.sql"
$tablesPath = Join-Path $PSScriptRoot "tables.sql"
$pgAdminPsql = "C:\Users\akiil\AppData\Local\Programs\pgAdmin 4\runtime\psql.exe"

if (Get-Command psql -ErrorAction SilentlyContinue) {
    $psql = "psql"
} elseif (Test-Path -LiteralPath $pgAdminPsql) {
    $psql = $pgAdminPsql
} else {
    Write-Error "psql was not found. Install PostgreSQL, add PostgreSQL bin to PATH, or install pgAdmin 4 with bundled psql."
    exit 1
}

$databaseExists = & $psql -h $HostName -p $Port -U $UserName -d $AdminDatabase -tAc "SELECT 1 FROM pg_database WHERE datname = 'gharbano';"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Could not connect to PostgreSQL at ${HostName}:${Port}. Make sure the server is running and credentials are correct."
    exit 1
}

if ($databaseExists.Trim() -ne "1") {
    & $psql -h $HostName -p $Port -U $UserName -d $AdminDatabase -c "CREATE DATABASE gharbano;"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Could not create gharbano database."
        exit 1
    }
}

& $psql -h $HostName -p $Port -U $UserName -d "gharbano" -f $tablesPath
