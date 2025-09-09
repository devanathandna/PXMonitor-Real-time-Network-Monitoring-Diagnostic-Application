
# Reset-NetworkIP.ps1
# This PowerShell script resets the network adapter's IP configuration.
# It can help resolve IP conflict issues and connectivity problems.

try {
    # Release and renew IP
    $adapter = Get-NetAdapter -Name "Wi-Fi" -ErrorAction Stop
    Disable-NetAdapter -Name $adapter.Name -Confirm:$false
    Start-Sleep -Seconds 2
    Enable-NetAdapter -Name $adapter.Name -Confirm:$false
    $result = Invoke-Command -ScriptBlock { ipconfig /renew }
    if ($result -match "IP address successfully renewed") {
        Write-Output "IP reset successfully. Video calls should be smoother."
        exit 0
    } else {
        Write-Output "IP reset failed. Try closing background apps."
        exit 1
    }
} catch {
    Write-Output "Failed to reset IP. Error: $_"
    exit 1
}
