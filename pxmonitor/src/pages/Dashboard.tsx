import { useState, useEffect, useCallback } from "react";
import NetworkHealthGauge from "@/components/dashboard/NetworkHealthGauge";
import MetricCard from "@/components/dashboard/MetricCard";
import StatusCard from "@/components/dashboard/StatusCard";
import AlertBanner from "@/components/dashboard/AlertBanner";
import ProtocolDistribution from "@/components/dashboard/ProtocolDistribution";
import MultiLineChart from "@/components/dashboard/MultiLineChart";
import NetworkAnalysis from "@/components/dashboard/NetworkAnalysis";
import { Clock, Wifi, FileTerminal, Database, Activity, AlertCircle, CheckCircle, WifiOff, Loader2 } from "lucide-react";

interface MetricsData {
  latency: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  dnsDelay: number;
  healthScore: number;
  stability: "stable" | "unstable" | "critical";
  congestion: "stable" | "unstable" | "critical";
  protocolData: { name: string; value: number }[];
  topAppsData: { name: string; value: number }[];
  timestamp: number;
  packetsReceived: number;
  isStale?: boolean;
  dataAge?: number;
}

interface ChartDataPoint {
  timestamp: number;
  [key: string]: number;
}

const Dashboard = () => {
  // Core metrics state
  const [metrics, setMetrics] = useState<MetricsData>({
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    bandwidth: 0,
    dnsDelay: 0,
    healthScore: 50,
    stability: "stable",
    congestion: "stable",
    protocolData: [],
    topAppsData: [],
    timestamp: Date.now(),
    packetsReceived: 0
  });

  // Chart data states
  const [latencyData, setLatencyData] = useState<ChartDataPoint[]>([]);
  const [bandwidthData, setBandwidthData] = useState<ChartDataPoint[]>([]);
  const [jitterData, setJitterData] = useState<ChartDataPoint[]>([]);

  // UI states
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'no-data'>('connecting');
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const [fetchError, setFetchError] = useState<string>('');
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to format numbers to 4 decimal places
  const formatToFourDecimals = (value: number): string => {
    return value.toFixed(4);
  };

  // Robust data validation and parsing
  const validateAndParseMetrics = useCallback((data: any): MetricsData | null => {
    try {
      if (!data || typeof data !== 'object') {
        console.warn('Invalid metrics data received:', data);
        return null;
      }

      // Helper function to safely parse numbers
      const safeNumber = (value: any, defaultValue: number = 0, min: number = 0, max: number = Infinity): number => {
        const num = Number(value);
        if (isNaN(num)) return defaultValue;
        return Math.max(min, Math.min(max, num));
      };

      // Helper function to safely parse strings
      const safeString = (value: any, validValues: string[], defaultValue: string): string => {
        const str = String(value || '').toLowerCase();
        return validValues.includes(str) ? str : defaultValue;
      };

      // Helper function to parse protocol data
      const parseProtocolData = (protocolData: any): { name: string; value: number }[] => {
        if (Array.isArray(protocolData)) {
          return protocolData
            .map(item => ({
              name: String(item.name || item.protocol || 'Unknown'),
              value: safeNumber(item.value || item.count, 0, 0)
            }))
            .filter(item => item.value > 0);
        }
        return [];
      };

      // Helper function to parse top apps data
      const parseTopAppsData = (topAppsData: any): { name: string; value: number }[] => {
        if (Array.isArray(topAppsData)) {
          return topAppsData
            .map(app => ({
              name: String(app.name || app.application || 'Unknown'),
              value: safeNumber(app.value || app['frame.len'] || app.bytes, 0, 0)
            }))
            .filter(app => app.value > 0);
        }
        return [];
      };

      // Parse timestamp - handle both Unix timestamps and ISO strings
      let timestamp = Date.now();
      if (data.timestamp) {
        if (typeof data.timestamp === 'number') {
          timestamp = data.timestamp;
        } else if (typeof data.timestamp === 'string') {
          const parsedTime = new Date(data.timestamp).getTime();
          if (!isNaN(parsedTime)) {
            timestamp = parsedTime;
          }
        }
      }

      const parsedMetrics: MetricsData = {
        latency: safeNumber(data.latency, 0, 0, 2000),
        jitter: safeNumber(data.jitter, 0, 0, 500),
        packetLoss: safeNumber(data.packetLoss || data.packet_loss, 0, 0, 100),
        bandwidth: safeNumber(data.bandwidth, 0, 0, 1000),
        dnsDelay: safeNumber(data.dnsDelay || data.dns_delay, 0, 0, 1000),
        healthScore: safeNumber(data.healthScore || data.health_score, 50, 0, 100),
        stability: safeString(data.stability, ['stable', 'unstable', 'critical'], 'stable') as any,
        congestion: safeString(data.congestion || data.congestion_level, ['stable', 'unstable', 'critical'], 'stable') as any,
        protocolData: parseProtocolData(data.protocolData),
        topAppsData: parseTopAppsData(data.topAppsData),
        timestamp,
        packetsReceived: safeNumber(data.packetsReceived || data.packet_count, 0, 0),
        isStale: Boolean(data.isStale),
        dataAge: safeNumber(data.dataAge, 0, 0)
      };

      console.log('Successfully parsed metrics:', parsedMetrics);
      return parsedMetrics;
    } catch (error) {
      console.error('Error parsing metrics:', error);
      return null;
    }
  }, []);

  // Fetch metrics with robust error handling
  const fetchMetrics = useCallback(async () => {
    try {
      console.log('Fetching metrics from backend...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('http://localhost:3001/metrics', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 503) {
          // Service unavailable - no data yet
          setConnectionStatus('no-data');
          setFetchError('Waiting for network data collection to start');
          setConsecutiveErrors(0);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw data received:', data);

      // If this is an error response, handle it
      if (data.error) {
        setConnectionStatus('no-data');
        setFetchError(data.message || data.error);
        setConsecutiveErrors(0);
        return;
      }

      // Parse and validate the metrics
      const parsedMetrics = validateAndParseMetrics(data);
      if (!parsedMetrics) {
        throw new Error('Failed to parse metrics data');
      }

      // Update state with new metrics
      setMetrics(parsedMetrics);
      setConnectionStatus(parsedMetrics.isStale ? 'no-data' : 'connected');
      setFetchError('');
      setConsecutiveErrors(0);
      setLastFetchTime(new Date().toLocaleTimeString());
      setIsLoading(false);

      // Update chart data
      const now = parsedMetrics.timestamp;
      
      setLatencyData(prev => [
        ...prev.slice(-59),
        { timestamp: now, latency: parsedMetrics.latency, baseline: 50 }
      ]);

      setBandwidthData(prev => [
        ...prev.slice(-59),
        { timestamp: now, bandwidth: parsedMetrics.bandwidth, target: 80 }
      ]);

      setJitterData(prev => [
        ...prev.slice(-59),
        { 
          timestamp: now, 
          jitter: parsedMetrics.jitter, 
          packetLoss: parsedMetrics.packetLoss * 2 // Scale for visibility
        }
      ]);

      // Check for alerts
      if (showNotifications && parsedMetrics.healthScore < 40) {
        setShowAlert(true);
      }

    } catch (err: any) {
      console.error('Fetch error:', err);
      setConsecutiveErrors(prev => prev + 1);
      
      if (err.name === 'AbortError') {
        setFetchError('Request timeout - backend may be slow');
      } else if (err.message.includes('fetch')) {
        setFetchError('Cannot connect to backend server');
      } else {
        setFetchError(err.message);
      }

      // Only set error status after multiple failures
      if (consecutiveErrors >= 2) {
        setConnectionStatus('error');
      }
    }
  }, [validateAndParseMetrics, showNotifications, consecutiveErrors]);

  // Initialize dashboard
  useEffect(() => {
    // Load notification settings
    const loadSettings = () => {
      try {
        const savedSettings = localStorage?.getItem('pxmonitor-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          const notificationsSetting = parsedSettings
            .find((group: any) => group.id === "general")
            ?.settings.find((setting: any) => setting.id === "notifications")?.value;
          if (notificationsSetting !== undefined) {
            setShowNotifications(notificationsSetting);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
    
    // Initial fetch
    fetchMetrics();
    
    // Set up polling interval
    const interval = setInterval(fetchMetrics, 3000);
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchMetrics]);

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = (event: any) => {
      if (event.detail?.showNotifications !== undefined) {
        setShowNotifications(event.detail.showNotifications);
      }
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  // Handle network fix action
  const handleFixNetwork = useCallback(async () => {
    try {
      setShowAlert(false);
      // In a real implementation, this would trigger network optimization
      console.log('Network fix requested');
    } catch (error) {
      console.error('Error fixing network:', error);
    }
  }, []);

  // Get connection status display
  const getConnectionDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <CheckCircle size={16} className="text-green-500" />,
          text: `Updated ${lastFetchTime}`,
          className: "text-green-700"
        };
      case 'no-data':
        return {
          icon: <Clock size={16} className="text-yellow-500" />,
          text: 'Waiting for data...',
          className: "text-yellow-700"
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} className="text-red-500" />,
          text: 'Connection issues',
          className: "text-red-700"
        };
      default:
        return {
          icon: <Loader2 size={16} className="text-blue-500 animate-spin" />,
          text: 'Connecting...',
          className: "text-blue-700"
        };
    }
  };

  const connectionDisplay = getConnectionDisplay();

  // Loading state
  if (isLoading && connectionStatus === 'connecting') {
    return (
      <div className="grid-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Initializing Network Monitor</p>
          <p className="text-muted-foreground">Connecting to backend services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-montserrat">Network Dashboard</h1>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 text-sm">
            {connectionDisplay.icon}
            <span className={connectionDisplay.className}>
              {connectionDisplay.text}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {connectionStatus === 'error' && consecutiveErrors > 3 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} className="text-red-600" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Connection Issues</h3>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mb-2">
              {fetchError || 'Unable to connect to backend'}
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs">
              Make sure the backend server is running on http://localhost:3001
            </p>
          </div>
        )}

        {/* No Data Banner */}
        {connectionStatus === 'no-data' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <WifiOff size={20} className="text-yellow-600" />
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Waiting for Network Data</h3>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              {fetchError || 'The system is starting up and collecting network information...'}
            </p>
          </div>
        )}

        {/* Alert Banner */}
        {showAlert && (
          <AlertBanner
            message="Network performance is degraded!"
            type="error"
            actionText="Acknowledge"
            onAction={handleFixNetwork}
            className="mb-6"
          />
        )}

        {/* Main Dashboard Content */}
        <div className="space-y-6">
          {/* Health and Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NetworkHealthGauge score={metrics.healthScore} />
            <StatusCard 
              title="Connection Stability" 
              status={metrics.stability}
              description={
                metrics.stability === "stable" 
                  ? "Your connection is reliable and stable" 
                  : metrics.stability === "unstable"
                  ? "Your connection is experiencing some issues"
                  : "Your connection has critical stability issues"
              }
            />
            <StatusCard 
              title="Network Congestion" 
              status={metrics.congestion}
              description={
                metrics.congestion === "stable" 
                  ? "Network traffic is flowing smoothly" 
                  : metrics.congestion === "unstable"
                  ? "Network traffic is moderately congested"
                  : "Network traffic is heavily congested"
              }
            />
          </div>

          {/* Metric Cards with 4 decimal places for specific metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard
              title="Latency"
              value={formatToFourDecimals(metrics.latency)}
              unit="ms"
              icon={<Activity size={18} />}
              status={metrics.latency < 50 ? "success" : metrics.latency < 100 ? "warning" : "danger"}
            />
            <MetricCard
              title="Jitter"
              value={formatToFourDecimals(metrics.jitter)}
              unit="ms"
              icon={<Activity size={18} />}
              status={metrics.jitter < 10 ? "success" : metrics.jitter < 20 ? "warning" : "danger"}
            />
            <MetricCard
              title="Packet Loss"
              value={formatToFourDecimals(metrics.packetLoss)}
              unit="%"
              icon={<FileTerminal size={18} />}
              status={metrics.packetLoss < 1 ? "success" : metrics.packetLoss < 3 ? "warning" : "danger"}
            />
            <MetricCard
              title="DNS Delay"
              value={formatToFourDecimals(metrics.dnsDelay)}
              unit="ms"
              icon={<Database size={18} />}
              status={metrics.dnsDelay < 30 ? "success" : metrics.dnsDelay < 70 ? "warning" : "danger"}
            />
            <MetricCard
              title="Bandwidth"
              value={formatToFourDecimals(metrics.bandwidth)}
              unit="Mbps"
              icon={<Wifi size={18} />}
              status={metrics.bandwidth > 50 ? "success" : metrics.bandwidth > 20 ? "warning" : "danger"}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MultiLineChart
              title="Network Latency & Baseline"
              description="Real-time latency compared to target baseline"
              data={latencyData}
              lines={[
                { id: 'latency', name: 'Latency', color: '#F87171' },
                { id: 'baseline', name: 'Target', color: '#22C55E' }
              ]}
              yAxisLabel="ms"
              height={280}
            />
            <MultiLineChart
              title="Bandwidth Usage"
              description="Available bandwidth over time"
              data={bandwidthData}
              lines={[
                { id: 'bandwidth', name: 'Bandwidth', color: '#3B82F6' },
                { id: 'target', name: 'Target', color: '#8B5CF6' }
              ]}
              yAxisLabel="Mbps"
              height={280}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics.protocolData.length > 0 ? (
              <ProtocolDistribution data={metrics.protocolData} />
            ) : (
              <div className="bg-card rounded-lg border p-6 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileTerminal size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No protocol data available</p>
                  <p className="text-sm">Waiting for network analysis...</p>
                </div>
              </div>
            )}
            
            <MultiLineChart
              title="Connection Quality Metrics"
              description="Jitter and packet loss affecting connection quality"
              data={jitterData}
              lines={[
                { id: 'jitter', name: 'Jitter', color: '#F59E0B' },
                { id: 'packetLoss', name: 'Packet Loss (×2)', color: '#EF4444' }
              ]}
              yAxisLabel="Value"
              height={280}
            />
          </div>

          {/* Network Analysis */}
          <NetworkAnalysis metrics={metrics} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;