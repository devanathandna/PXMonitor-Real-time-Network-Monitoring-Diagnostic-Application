
import { useState } from "react";
import { cn } from "@/lib/utils";

const SystemMode = () => {
  const [powerMode, setPowerMode] = useState(false);
  
  const handleTogglePowerMode = () => {
    const newMode = !powerMode;
    setPowerMode(newMode);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Mode</h1>
        <p className="text-muted-foreground">Optimize your network for specific tasks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <div className="network-card">
            <h2 className="text-lg font-medium mb-4">Powerful Mode</h2>
            
            <div className="flex flex-col items-center">
              <div className="mb-4 text-center">
                <div 
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    powerMode ? "bg-neonBlue text-black" : "bg-muted/30 text-muted-foreground"
                  )}
                >
                  <span className="text-2xl font-bold">{powerMode ? "ON" : "OFF"}</span>
                </div>
              </div>
              
              <button 
                className={cn(
                  "w-full py-2 rounded-md transition-colors font-medium",
                  powerMode 
                    ? "bg-neonBlue text-black hover:bg-neonBlue/80" 
                    : "bg-muted/20 text-white hover:bg-muted/30 border border-muted"
                )}
                onClick={handleTogglePowerMode}
              >
                {powerMode ? "Disable" : "Enable"}
              </button>
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Powerful Mode prioritizes your network traffic for video calls, gaming, or streaming.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Reduced latency for real-time applications</li>
                  <li>Increased bandwidth allocation</li>
                  <li>Prioritized DNS resolution</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1 lg:col-span-2">
          <div className="network-card h-full">
            <h2 className="text-lg font-medium mb-4">Mode Description</h2>
            <div className="space-y-4">
              <p>
                The Powerful Mode optimizes your network settings for maximum performance during 
                high-demand activities. When enabled, PXMonitor will:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/10 p-4 rounded-lg border border-border">
                  <h3 className="font-medium mb-2">Traffic Prioritization</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzes network packets and prioritizes real-time applications
                    over background services to ensure smooth performance.
                  </p>
                </div>
                
                <div className="bg-muted/10 p-4 rounded-lg border border-border">
                  <h3 className="font-medium mb-2">Connection Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduces connection overhead and optimizes TCP parameters
                    for lower latency and faster response times.
                  </p>
                </div>
                
                <div className="bg-muted/10 p-4 rounded-lg border border-border">
                  <h3 className="font-medium mb-2">Bandwidth Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Allocates more bandwidth to the primary application
                    while throttling background processes.
                  </p>
                </div>
                
                <div className="bg-muted/10 p-4 rounded-lg border border-border">
                  <h3 className="font-medium mb-2">DNS Acceleration</h3>
                  <p className="text-sm text-muted-foreground">
                    Uses faster DNS servers and caching to improve
                    website and service loading times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMode;
