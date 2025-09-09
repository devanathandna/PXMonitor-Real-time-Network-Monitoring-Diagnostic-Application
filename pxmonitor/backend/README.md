
# PXMonitor Backend

This directory contains the backend services for the PXMonitor application. The backend handles network data collection, processing, and provides system utilities to enhance network performance.

## Structure

- `index.js` - Main entry point that exports core metrics generation functions
- `scripts/` - PowerShell scripts for network operations
  - `Flush-DnsCache.ps1` - Clears the DNS resolver cache
  - `Reset-NetworkIP.ps1` - Resets network adapter IP configuration
  - `Reconnect-WiFi.ps1` - Reconnects to wireless network
  - `Optimize-Bandwidth.ps1` - Optimizes bandwidth usage
  - `Switch-DnsServer.ps1` - Changes DNS server settings
  - `Clear-NetworkCongestion.ps1` - Improves network congestion
  - `Maintain-PowerfulConnection.ps1` - Enhances connection stability

## Data Collection

In a production environment, the backend would use TShark/Wireshark libraries to collect real network data. For development and demonstration purposes, mock data generation functions are provided:

- `generateMockMetrics()` - Creates realistic network metrics
- `generateChartData()` - Generates time-series data for charts
- `collectSystemNetworkData()` - Simulates system-level data collection

## Integration

The frontend communicates with this backend through API calls to fetch real-time network metrics and perform maintenance operations.

