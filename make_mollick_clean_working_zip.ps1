param(
    [string]$OutputName = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$projectName = Split-Path $projectRoot -Leaf

if ([string]::IsNullOrWhiteSpace($OutputName)) {
    $stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $OutputName = "$projectName-WORKING-$stamp.zip"
}

$outputPath = Join-Path $projectRoot $OutputName
$tempRoot = Join-Path $env:TEMP ("mollick_zip_" + [guid]::NewGuid().ToString("N"))
$tempProject = Join-Path $tempRoot $projectName

Write-Host ""
Write-Host "Creating clean working ZIP..." -ForegroundColor Cyan
Write-Host "Project: $projectRoot"
Write-Host "Output : $outputPath"
Write-Host ""

# Things we do NOT want inside the working source ZIP
$excludeDirs = @(
    "node_modules",
    "dist",
    ".git",
    ".github",
    ".bright-health-backups",
    ".mollick-backups",
    "RECOVERY_CHECK",
    ".vite",
    ".cache"
)

# Root-only helper/patch scripts that were used during development
$excludeRootPatterns = @(
    "*.zip",
    "add_*.cjs",
    "clean_*.cjs",
    "cleanup_*.cjs",
    "fix_*.cjs",
    "make_*.ps1",
    "remove_*.cjs",
    "repair_*.cjs",
    "reorder_*.cjs",
    "step*.cjs",
    "unify_*.cjs",
    "update_*.cjs",
    "change_*.cjs"
)

New-Item -ItemType Directory -Path $tempProject -Force | Out-Null

function Should-SkipDirectory([string]$name) {
    return $excludeDirs -contains $name
}

# Copy project files manually so we can control exclusions safely
Get-ChildItem -Path $projectRoot -Force | ForEach-Object {
    $item = $_

    if ($item.FullName -eq $outputPath) {
        return
    }

    if ($item.PSIsContainer) {
        if (Should-SkipDirectory $item.Name) {
            Write-Host "Skip dir : $($item.Name)" -ForegroundColor DarkGray
            return
        }

        Copy-Item -Path $item.FullName `
                  -Destination (Join-Path $tempProject $item.Name) `
                  -Recurse -Force
    }
    else {
        $skip = $false

        foreach ($pattern in $excludeRootPatterns) {
            if ($item.Name -like $pattern) {
                $skip = $true
                break
            }
        }

        if ($skip) {
            Write-Host "Skip file: $($item.Name)" -ForegroundColor DarkGray
            return
        }

        Copy-Item -Path $item.FullName `
                  -Destination (Join-Path $tempProject $item.Name) `
                  -Force
    }
}

# Extra safety: remove excluded folders if any were nested/copied unexpectedly
Get-ChildItem -Path $tempProject -Directory -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $excludeDirs -contains $_.Name } |
    Sort-Object FullName -Descending |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

if (Test-Path $outputPath) {
    Remove-Item $outputPath -Force
}

Compress-Archive -Path (Join-Path $tempProject "*") `
                 -DestinationPath $outputPath `
                 -CompressionLevel Optimal `
                 -Force

$zip = Get-Item $outputPath
$sizeMB = [math]::Round($zip.Length / 1MB, 2)

Remove-Item $tempRoot -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "ZIP: $($zip.FullName)"
Write-Host "Size: $sizeMB MB"
Write-Host ""
Write-Host "Included: source code, public assets, package files, Vite config, index.html, README, etc."
Write-Host "Excluded: node_modules, dist, git data, backups, recovery folders, old ZIPs, and root patch/helper scripts."
