
# Switch-DnsServer.ps1
# This PowerShell script changes the system's DNS server settings.
# It can switch between public DNS providers like Google DNS, Cloudflare, etc.

try {
    # Clear DNS cache
    Clear-DnsClientCache
    # Switch to Google DNS (8.8.8.8)
    $adapter = Get-NetAdapter -Name "Wi-Fi" -ErrorAction Stop
    Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses ("8.8.8.8", "8.8.4.4")
    # Verify resolution
    $test = Resolve-DnsName google.com -ErrorAction Stop
    if ($test) {
        Write-Output "Switched to faster DNS server. Websites should load quicker."
        exit 0
    } else {
        Write-Output "DNS switch failed. Try reconnecting Wi-Fi."
        exit 1
    }
} catch {
    Write-Output "Failed to switch DNS server. Error: $_"
    exit 1
}
