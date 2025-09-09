
# Flush-DnsCache.ps1
# This PowerShell script clears the DNS resolver cache on the local machine.
# It helps resolve DNS-related connectivity issues.

try {
    # Clear DNS cache
    Clear-DnsClientCache
    # Verify DNS resolution
    $test = Resolve-DnsName google.com -ErrorAction Stop
    if ($test) {
        # Log success
        Write-Output "DNS cache cleared successfully. Websites should load faster."
        exit 0
    }
} catch {
    # Log error and suggest alternative
    Write-Output "Failed to clear DNS cache. Try reconnecting Wi-Fi. Error: $_"
    exit 1
}

