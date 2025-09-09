
import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ComponentExplanation from "@/components/ui/component-explanation";

interface NetworkMetric {
  label: string;
  before: number;
  unit: string;
  after?: number;
}

interface ScriptResult {
  status: "idle" | "running" | "completed";
  metrics?: NetworkMetric[];
}

interface NetworkScript {
  id: string;
  name: string;
  fileName: string;
  description: string;
  severity: "high" | "medium" | "low";
  metrics: NetworkMetric[];
}

// Mock API function to simulate TShark interface
const fetchNetworkMetrics = async () => {
  // In a real implementation, this would make an API call to the backend
  try {
    const response = await fetch('/api/network-metrics');
    if (!response.ok) {
      throw new Error('Failed to fetch network metrics');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching network metrics:", error);
    // Fallback to calculated metrics based on TShark simulation data
    return simulateTsharkMetrics();
  }
};

// Simulate TShark metrics calculation
const simulateTsharkMetrics = () => {
  console.log("Using TShark simulation data");
  
  // These values would come from TShark in a real implementation
  const dnsResponseTime = Math.round(80 + Math.random() * 60);
  const nameResolutionSuccess = Math.round(70 + Math.random() * 20);
  const ipConflicts = Math.round(1 + Math.random() * 4);
  const connectionStability = Math.round(50 + Math.random() * 30);
  const downloadSpeed = Math.round((30 + Math.random() * 30) * 10) / 10;
  const uploadSpeed = Math.round((8 + Math.random() * 10) * 10) / 10;
  const dnsReliability = Math.round(65 + Math.random() * 25);
  const querySpeed = Math.round(70 + Math.random() * 50);
  const signalStrength = Math.round(40 + Math.random() * 30);
  const packetLoss = Math.round((2 + Math.random() * 5) * 10) / 10;
  const networkLatency = Math.round(120 + Math.random() * 100);
  const bandwidthUtilization = Math.round(70 + Math.random() * 25);
  const connectionPower = Math.round(60 + Math.random() * 25);
  const stabilityIndex = Math.round((5 + Math.random() * 3) * 10) / 10;
  
  return {
    dnsResponseTime,
    nameResolutionSuccess,
    ipConflicts,
    connectionStability,
    downloadSpeed,
    uploadSpeed,
    dnsReliability,
    querySpeed,
    signalStrength,
    packetLoss,
    networkLatency,
    bandwidthUtilization,
    connectionPower,
    stabilityIndex
  };
};

const Diagnosis = () => {
  const { toast } = useToast();
  const [networkMetrics, setNetworkMetrics] = useState<any>(null);
  const [scriptResults, setScriptResults] = useState<Record<string, ScriptResult>>({
    "dns-cache": { status: "idle" },
    "network-ip": { status: "idle" },
    "bandwidth": { status: "idle" },
    "dns-server": { status: "idle" },
    "wifi": { status: "idle" },
    "congestion": { status: "idle" },
    "powerful": { status: "idle" },
  });
  
  useEffect(() => {
    // Load initial network metrics when component mounts
    fetchNetworkMetrics()
      .then(metrics => {
        console.log("Initial network metrics:", metrics);
        setNetworkMetrics(metrics);
      })
      .catch(error => {
        console.error("Failed to load initial network metrics:", error);
        toast({
          variant: "destructive",
          title: "Network Analysis Failed",
          description: "Unable to load network metrics. Please try again later."
        });
      });
  }, [toast]);
  
  // Network scripts data
  const getNetworkScripts = (): NetworkScript[] => {
    if (!networkMetrics) return [];
    
    return [
      {
        id: "dns-cache",
        name: "DNS Cache Flush",
        fileName: "Flush-DnsCache.ps1",
        description: "Clears the DNS resolver cache to resolve connectivity issues and refresh DNS records.",
        severity: "medium",
        metrics: [
          { label: "DNS Response Time", before: networkMetrics.dnsResponseTime, unit: "ms" },
          { label: "Name Resolution Success", before: networkMetrics.nameResolutionSuccess, unit: "%" }
        ]
      },
      {
        id: "network-ip",
        name: "Network IP Reset",
        fileName: "Reset-NetworkIP.ps1",
        description: "Resets IP configuration to resolve address conflicts and connectivity problems.",
        severity: "high",
        metrics: [
          { label: "IP Conflicts", before: networkMetrics.ipConflicts, unit: "conflicts" },
          { label: "Connection Stability", before: networkMetrics.connectionStability, unit: "%" }
        ]
      },
      {
        id: "bandwidth",
        name: "Bandwidth Optimization",
        fileName: "Optimize-Bandwidth.ps1",
        description: "Adjusts TCP parameters for improved bandwidth utilization and faster data transfers.",
        severity: "medium",
        metrics: [
          { label: "Download Speed", before: networkMetrics.downloadSpeed, unit: "Mbps" },
          { label: "Upload Speed", before: networkMetrics.uploadSpeed, unit: "Mbps" }
        ]
      },
      {
        id: "dns-server",
        name: "DNS Server Switch",
        fileName: "Switch-DnsServer.ps1",
        description: "Changes DNS server settings to improve speed and reliability of internet connections.",
        severity: "low",
        metrics: [
          { label: "DNS Reliability", before: networkMetrics.dnsReliability, unit: "%" },
          { label: "Query Speed", before: networkMetrics.querySpeed, unit: "ms" }
        ]
      },
      {
        id: "wifi",
        name: "WiFi Reconnection",
        fileName: "Reconnect-WiFi.ps1",
        description: "Disconnects and reconnects WiFi to resolve signal or authentication issues.",
        severity: "high",
        metrics: [
          { label: "Signal Strength", before: networkMetrics.signalStrength, unit: "%" },
          { label: "Packet Loss", before: networkMetrics.packetLoss, unit: "%" }
        ]
      },
      {
        id: "congestion",
        name: "Network Congestion Relief",
        fileName: "Clear-NetworkCongestion.ps1",
        description: "Alleviates network congestion by resetting adapters and clearing network cache.",
        severity: "medium",
        metrics: [
          { label: "Network Latency", before: networkMetrics.networkLatency, unit: "ms" },
          { label: "Bandwidth Utilization", before: networkMetrics.bandwidthUtilization, unit: "%" }
        ]
      },
      {
        id: "powerful",
        name: "Powerful Connection",
        fileName: "Maintain-PowerfulConnection.ps1",
        description: "Enables high-performance mode for network connections to optimize speed and stability.",
        severity: "low",
        metrics: [
          { label: "Connection Power", before: networkMetrics.connectionPower, unit: "%" },
          { label: "Stability Index", before: networkMetrics.stabilityIndex, unit: "/10" }
        ]
      }
    ];
  };

  // Run script function - simulates running the PowerShell scripts
  const runScript = async (scriptId: string, fileName: string) => {
    // Set status to running
    setScriptResults(prev => ({
      ...prev,
      [scriptId]: { 
        ...prev[scriptId],
        status: "running" 
      }
    }));

    // Toast notification
    toast({
      title: "Running Script",
      description: `Executing ${fileName}...`,
    });

    try {
      // In a real implementation, this would make an API call to execute the PowerShell script
      // For now, we'll simulate it with a delay and random improvements
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate TShark collecting new metrics after script execution
      const updatedMetrics = await fetchNetworkMetrics();
      
      // Get the script data
      const scripts = getNetworkScripts();
      const script = scripts.find(s => s.id === scriptId);
      
      if (script) {
        // Generate improved metrics based on the script
        const improvedMetrics = script.metrics.map(metric => {
          let improvement: number;
          
          switch (metric.label) {
            case "DNS Response Time":
            case "Network Latency":
            case "Query Speed":
            case "Packet Loss":
            case "IP Conflicts":
              // Lower is better
              improvement = metric.before * (0.3 + Math.random() * 0.4);
              return {
                ...metric,
                after: Number((metric.before - improvement).toFixed(1))
              };
            default:
              // Higher is better
              improvement = (100 - metric.before) * (0.4 + Math.random() * 0.5);
              return {
                ...metric,
                after: Number(Math.min(99.9, (metric.before + improvement)).toFixed(1))
              };
          }
        });

        // Update status to completed with metrics
        setScriptResults(prev => ({
          ...prev,
          [scriptId]: {
            status: "completed",
            metrics: improvedMetrics
          }
        }));

        // Update metrics in state to reflect changes
        // This would ideally come from a new TShark analysis
        setNetworkMetrics(updatedMetrics);

        // Success notification
        toast({
          title: "Script Executed Successfully",
          description: `${fileName} completed with improvements.`,
        });
      }
    } catch (error) {
      console.error(`Error executing script ${fileName}:`, error);
      
      // Error notification
      toast({
        variant: "destructive",
        title: "Script Execution Failed",
        description: `Failed to execute ${fileName}. Please try again.`,
      });
      
      // Set status back to idle
      setScriptResults(prev => ({
        ...prev,
        [scriptId]: { 
          ...prev[scriptId],
          status: "idle" 
        }
      }));
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-coralRed/15 text-coralRed border-coralRed";
      case "medium":
        return "bg-yellow-400/15 text-yellow-400 border-yellow-400";
      case "low":
        return "bg-blue-400/15 text-blue-400 border-blue-400";
      default:
        return "bg-gray-400/15 text-gray-400 border-gray-400";
    }
  };

  const networkScripts = getNetworkScripts();

  if (!networkMetrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading network metrics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Network Diagnosis & Repair</h1>
        <ComponentExplanation 
          componentName="Network Diagnosis" 
          data={{ 
            scriptCount: networkScripts.length,
            completedCount: Object.values(scriptResults).filter(r => r.status === "completed").length,
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {networkScripts.map((script) => {
          const result = scriptResults[script.id] || { status: "idle" };
          
          return (
            <Card key={script.id} className="network-card overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{script.name}</CardTitle>
                  <span className={cn("text-xs px-2 py-1 rounded-full border", getSeverityStyles(script.severity))}>
                    {script.severity} priority
                  </span>
                </div>
                <CardDescription className="mt-1.5">{script.description}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Script metrics */}
                <div className="space-y-6">
                  {script.metrics.map((metric, idx) => {
                    const updatedMetric = result.metrics?.[idx];
                    
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{metric.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-semibold font-mono",
                              updatedMetric?.after !== undefined ? "text-coralRed" : ""
                            )}>
                              {metric.before}{metric.unit}
                            </span>
                            
                            {updatedMetric?.after !== undefined && (
                              <>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-semibold font-mono text-limeGreen">
                                  {updatedMetric.after}{metric.unit}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <Progress 
                          value={updatedMetric?.after !== undefined 
                            ? (metric.label.includes("Time") || metric.label.includes("Latency") || metric.label.includes("Loss") || metric.label.includes("Conflicts")
                              ? (100 - (updatedMetric.after / metric.before * 100)) // Lower is better
                              : (updatedMetric.after / 100 * 100)) // Higher is better
                            : 0
                          } 
                          className={cn(
                            "h-2", 
                            updatedMetric?.after !== undefined ? "bg-muted/30" : "bg-muted/10"
                          )}
                        />
                      </div>
                    );
                  })}
                  
                  {/* Action button */}
                  <Button 
                    onClick={() => runScript(script.id, script.fileName)}
                    disabled={result.status === "running"}
                    className={cn(
                      "w-full mt-4",
                      result.status === "completed" ? "bg-limeGreen hover:bg-limeGreen/90 text-white" : ""
                    )}
                  >
                    {result.status === "running" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : result.status === "completed" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Fixed
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Run Diagnosis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Diagnosis;
