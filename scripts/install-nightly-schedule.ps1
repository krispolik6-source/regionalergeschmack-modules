# Instaluje zadanie Windows: nocne testy codziennie o 03:03 (czas lokalny systemu).
# Uruchom w PowerShell (najlepiej jako Administrator):
#   powershell -ExecutionPolicy Bypass -File scripts/install-nightly-schedule.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Node = (Get-Command node -ErrorAction SilentlyContinue)?.Source
if (-not $Node) { throw 'Nie znaleziono node w PATH' }

$TaskName = 'RegionalerGeschmack-NightlyTest'
$Script = Join-Path $Root 'scripts\nightly-test.mjs'
$Action = New-ScheduledTaskAction -Execute $Node -Argument "`"$Script`"" -WorkingDirectory $Root
$Trigger = New-ScheduledTaskTrigger -Daily -At '03:03'
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description 'Regionaler Geschmack – nocne testy 03:03 + raport e-mail' | Out-Null
Write-Host "OK: zadanie '$TaskName' codziennie 03:03 → $Script"
Write-Host 'Ręcznie: npm run nightly-test'
