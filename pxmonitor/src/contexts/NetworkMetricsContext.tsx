import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// This interface EXACTLY matches the 'latestMetrics' object in backend/index.js
interface MetricsData {
  latency: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  dnsDelay: number;
  healthScore: number;
  stability: string;
  congestion: string;
  protocolData: { name: string; value: number }[];
  topAppsData: { name: string; value: number }[];
  timestamp: string;
  packetsReceived: number;
}

interface NetworkMetricsContextType {
  metrics: MetricsData | null;
  isLoading: boolean;
  error: string | null;
}

const NetworkMetricsContext = createContext<NetworkMetricsContextType | undefined>(undefined);

export const NetworkMetricsProvider = ({ children }: { children: ReactNode }) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFetchingEnabled, setDataFetchingEnabled] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      if (!dataFetchingEnabled) return;
      
      try {
        // Fetching from the correct '/metrics' endpoint as defined in index.js
        const response = await fetch('/metrics');
        if (!response.ok) {
          // The backend sends 503 if data is not ready, which is expected.
          if (response.status === 503) {
            throw new Error('Metrics not available yet. Waiting for server...');
          }
          throw new Error(`API call failed: ${response.status}`);
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        console.error("Failed to fetch network metrics:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for data control changes
    const handleDataControlChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.type === 'dashboard-data') {
        setDataFetchingEnabled(customEvent.detail.enabled);
      }
    };

    window.addEventListener('dataControlChanged', handleDataControlChange);

    // Start fetching if enabled
    if (dataFetchingEnabled) {
      fetchData(); // Initial fetch
      intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('dataControlChanged', handleDataControlChange);
    };
  }, [dataFetchingEnabled]);

  return (
    <NetworkMetricsContext.Provider value={{ metrics, isLoading, error }}>
      {children}
    </NetworkMetricsContext.Provider>
  );
};

export const useNetworkMetrics = () => {
  const context = useContext(NetworkMetricsContext);
  if (context === undefined) {
    throw new Error('useNetworkMetrics must be used within a NetworkMetricsProvider');
  }
  return context;
};
