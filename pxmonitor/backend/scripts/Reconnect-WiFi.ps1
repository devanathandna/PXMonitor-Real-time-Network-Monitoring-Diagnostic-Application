
# Reconnect-WiFi.ps1
# This PowerShell script disconnects and then reconnects to the current WiFi network.
# It can help resolve connectivity issues with wireless networks.

try {
    # Get current Wi-Fi SSID
    $ssid = (netsh wlan show interfaces | Select-String "SSID").Line.Split(":")[1].Trim()
    if (-not $ssid) { throw "No Wi-Fi connected." }
    # Disconnect and reconnect
    netsh wlan disconnect
    Start-Sleep -Seconds 2
    $result = netsh wlan connect name=$ssid
    if ($result -match "Connection request was completed successfully") {
        Write-Output "Wi-Fi reconnected successfully. Connection should be stable."
        exit 0
    } else {
        Write-Output "Wi-Fi reconnection failed. Try restarting router."
        exit 1
    }
} catch {
    Write-Output "Failed to reconnect Wi-Fi. Error: $_"
    exit 1
}
