import { Button } from "@/components/ui/button";
import { dataControlStore } from "@/utils/dataControlStore";

interface DataDisabledOverlayProps {
  type: 'dashboard' | 'system-monitor';
  onEnable: () => void;
}

export const DataDisabledOverlay = ({ type, onEnable }: DataDisabledOverlayProps) => {
  const handleEnable = () => {
    if (type === 'dashboard') {
      dataControlStore.setDashboardEnabled(true);
    } else {
      dataControlStore.setSystemMonitorEnabled(true);
    }
    
    // Update backend
    const updateBackend = async () => {
      try {
        const state = dataControlStore.getState();
        await fetch('/api/data-control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(state),
        });
      } catch (error) {
        console.error('Error updating backend data control:', error);
      }
    };
    
    updateBackend();
    onEnable();
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg text-center max-w-md">
        <h3 className="text-lg font-semibold mb-2">
          {type === 'dashboard' ? 'Dashboard Data Disabled' : 'System Monitor Data Disabled'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Data collection for this {type === 'dashboard' ? 'dashboard' : 'system monitor'} is currently disabled. 
          Enable it to start receiving real-time data.
        </p>
        <Button onClick={handleEnable} className="glow-button">
          Enable Data Collection
        </Button>
      </div>
    </div>
  );
};