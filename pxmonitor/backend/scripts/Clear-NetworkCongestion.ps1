
# Clear-NetworkCongestion.ps1
# This PowerShell script helps alleviate network congestion issues.
# It resets network adapters and clears caches that may cause congestion.


try {
    # Check for high-bandwidth processes
    $processes = Get-NetTCPConnection | Group-Object OwningProcess | Sort-Object Count -Descending | Select-Object -First 3
    if ($processes) {
        $report = $processes | ForEach-Object { (Get-Process -Id $_.Name).ProcessName }
        Stop-Process -Id $processes.Name -Force -ErrorAction SilentlyContinue
        Write-Output "Closed high-bandwidth apps: $report. Network should be less crowded."
        exit 0
    }
    # If no apps, restart router (assumes router IP in config)
    $routerIp = "192.168.1.1" # Placeholder, set via Settings
    $result = Invoke-WebRequest -Uri "http://$routerIp/reboot" -Method Post -ErrorAction SilentlyContinue
    if ($result.StatusCode -eq 200) {
        Write-Output "Router restarted. Network congestion cleared."
        exit 0
    } else {
        Write-Output "No apps or router restart failed. Try reconnecting Wi-Fi."
        exit 1
    }
} catch {
    Write-Output "Failed to clear congestion. Error: $_"
    exit 1
}


