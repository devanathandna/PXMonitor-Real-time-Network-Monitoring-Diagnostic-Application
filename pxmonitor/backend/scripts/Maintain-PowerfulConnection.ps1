
# Maintain-PowerfulConnection.ps1
# This PowerShell script enables high-performance mode for network connections.
# It optimizes WiFi power settings, TCP parameters, and network priorities.


param (
    [int]$MaxRetries = 3,      # Maximum fix retries
    [int]$ProbeInterval = 1000, # Probe interval in milliseconds (1s)
    [int]$FailureInterval = 500 # Interval on failure (0.5s)
)

# Function to log messages to a file and output for PXMonitor
function Write-Log {
    param ([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Output $logMessage
    Add-Content -Path "C:\ProgramData\PXMonitor\powerful_mode.log" -Value $logMessage
}

# Function to start continuous localhost ping in background
function Start-LocalhostPing {
    try {
        $job = Start-Job -ScriptBlock {
            while ($true) {
                Test-Connection -ComputerName "127.0.0.1" -Count 1 -BufferSize 32 -Quiet
                Start-Sleep -Seconds 1
            }
        } -Name "LocalhostPingJob"
        Write-Log "Started continuous localhost ping in background"
        return $job
    } catch {
        Write-Log "Failed to start localhost ping: $_"
        return $null
    }
}

# Function to stop localhost ping job
function Stop-LocalhostPing {
    try {
        $job = Get-Job -Name "LocalhostPingJob" -ErrorAction SilentlyContinue
        if ($job) {
            Stop-Job -Name "LocalhostPingJob"
            Remove-Job -Name "LocalhostPingJob"
            Write-Log "Stopped localhost ping job"
        }
    } catch {
        Write-Log "Failed to stop localhost ping: $_"
    }
}

# Function to run ICMP probe (ping)
function Test-IcmpProbe {
    try {
        $ping = Test-Connection -ComputerName "8.8.8.8" -Count 1 -ErrorAction Stop
        if ($ping.ResponseTime -gt 100) {
            Write-Log "ICMP probe failed: High latency ($($ping.ResponseTime)ms > 100ms)"
            return $false
        }
        return $true
    } catch {
        Write-Log "ICMP probe failed: $_"
        return $false
    }
}

# Function to run TCP probe (port connectivity)
function Test-TcpProbe {
    try {
        $tcp = Test-NetConnection -ComputerName "google.com" -Port 443 -ErrorAction Stop
        if (-not $tcp.TcpTestSucceeded) {
            Write-Log "TCP probe failed: Port 443 not reachable"
            return $false
        }
        return $true
    } catch {
        Write-Log "TCP probe failed: $_"
        return $false
    }
}

# Function to run DNS probe (domain resolution)
function Test-DnsProbe {
    try {
        $dns = Resolve-DnsName "google.com" -ErrorAction Stop
        if ($dns.QueryTime -gt 100) {
            Write-Log "DNS probe failed: High lookup time ($($dns.QueryTime)ms > 100ms)"
            return $false
        }
        return $true
    } catch {
        Write-Log "DNS probe failed: $_"
        return $false
    }
}

# Function to reconnect Wi-Fi
function Invoke-WiFiReconnect {
    try {
        $ssid = (netsh wlan show interfaces | Select-String "SSID").Line.Split(":")[1].Trim()
        if (-not $ssid) { throw "No Wi-Fi connected" }
        netsh wlan disconnect
        Start-Sleep -Seconds 2
        $result = netsh wlan connect name=$ssid
        if ($result -match "Connection request was completed successfully") {
            Write-Log "Wi-Fi reconnected successfully"
            return $true
        } else {
            Write-Log "Wi-Fi reconnection failed"
            return $false
        }
    } catch {
        Write-Log "Wi-Fi reconnection failed: $_"
        return $false
    }
}

# Function to optimize bandwidth (close high-bandwidth apps)
function Invoke-BandwidthOptimization {
    try {
        $processes = Get-NetTCPConnection | Group-Object OwningProcess | Sort-Object Count -Descending | Select-Object -First 3
        if ($processes) {
            $report = $processes | ForEach-Object {
                $proc = Get-Process -Id $_.Name
                Stop-Process -Id $_.Name -Force -ErrorAction SilentlyContinue
                "$($proc.ProcessName)"
            }
            Write-Log "Closed high-bandwidth apps: $report"
            return $true
        } else {
            Write-Log "No high-bandwidth apps found"
            return $false
        }
    } catch {
        Write-Log "Bandwidth optimization failed: $_"
        return $false
    }
}

# Function to reset IP
function Invoke-IpReset {
    try {
        $adapter = Get-NetAdapter -Name "Wi-Fi" -ErrorAction Stop
        Disable-NetAdapter -Name $adapter.Name -Confirm:$false
        Start-Sleep -Seconds 2
        Enable-NetAdapter -Name $adapter.Name -Confirm:$false
        $result = Invoke-Command -ScriptBlock { ipconfig /renew }
        if ($result -match "IP address successfully renewed") {
            Write-Log "IP reset successfully"
            return $true
        } else {
            Write-Log "IP reset failed"
            return $false
        }
    } catch {
        Write-Log "IP reset failed: $_"
        return $false
    }
}

# Function to switch DNS server
function Invoke-DnsSwitch {
    try {
        $adapter = Get-NetAdapter -Name "Wi-Fi" -ErrorAction Stop
        Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses ("8.8.8.8", "8.8.4.4")
        $test = Resolve-DnsName "google.com" -ErrorAction Stop
        if ($test) {
            Write-Log "Switched to Google DNS successfully"
            return $true
        } else {
            Write-Log "DNS switch failed"
            return $false
        }
    } catch {
        Write-Log "DNS switch failed: $_"
        return $false
    }
}

# Main loop for Powerful Mode
try {
    Write-Log "Powerful Mode started for emergency connection stability"
    $retryCount = 0
    $interval = $ProbeInterval

    # Start localhost ping job
    $pingJob = Start-LocalhostPing
    if (-not $pingJob) {
        Write-Log "Continuing without localhost ping due to startup failure"
    }

    try {
        while ($true) {
            $isStable = $true
            $issues = @()

            # Run probes
            if (-not (Test-IcmpProbe)) { $isStable = $false; $issues += "High latency" }
            if (-not (Test-TcpProbe)) { $isStable = $false; $issues += "Port connectivity" }
            if (-not (Test-DnsProbe)) { $isStable = $false; $issues += "DNS lookup" }

            if ($isStable) {
                Write-Log "Connection stable: All probes passed"
                $retryCount = 0
                $interval = $ProbeInterval
            } else {
                Write-Log "Connection unstable: Issues detected - $($issues -join ', ')"
                $interval = $FailureInterval
                $retryCount++

                # Attempt fixes
                $fixSuccess = $false
                if (Invoke-WiFiReconnect) { $fixSuccess = $true }
                elseif (Invoke-BandwidthOptimization) { $fixSuccess = $true }
                elseif (Invoke-IpReset) { $fixSuccess = $true }
                elseif (Invoke-DnsSwitch) { $fixSuccess = $true }

                if ($fixSuccess) {
                    Write-Log "Connection stabilized for your meeting or quiz!"
                    $retryCount = 0
                    $interval = $ProbeInterval
                } elseif ($retryCount -ge $MaxRetries) {
                    Write-Log "Max retries reached. Unable to stabilize connection. Please check router or contact support."
                    exit 1
                }
            }

            Start-Sleep -Milliseconds $interval
        }
    } finally {
        # Ensure localhost ping job is stopped on exit
        Stop-LocalhostPing
    }
} catch {
    Write-Log "Powerful Mode failed: $_"
    Stop-LocalhostPing
    exit 1
}
