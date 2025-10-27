// Global data control state
class DataControlStore {
  private dashboardEnabled = true;
  private systemMonitorEnabled = true;
  private listeners: Array<(state: DataControlState) => void> = [];

  constructor() {
    // Load from localStorage on init
    const saved = localStorage.getItem('pxmonitor-data-control');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.dashboardEnabled = state.dashboardEnabled ?? true;
        this.systemMonitorEnabled = state.systemMonitorEnabled ?? true;
      } catch (error) {
        console.error('Error loading data control state:', error);
      }
    }
  }

  getState(): DataControlState {
    return {
      dashboardEnabled: this.dashboardEnabled,
      systemMonitorEnabled: this.systemMonitorEnabled
    };
  }

  setDashboardEnabled(enabled: boolean) {
    this.dashboardEnabled = enabled;
    this.save();
    this.notifyListeners();
  }

  setSystemMonitorEnabled(enabled: boolean) {
    this.systemMonitorEnabled = enabled;
    this.save();
    this.notifyListeners();
  }

  subscribe(listener: (state: DataControlState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private save() {
    localStorage.setItem('pxmonitor-data-control', JSON.stringify(this.getState()));
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }
}

export interface DataControlState {
  dashboardEnabled: boolean;
  systemMonitorEnabled: boolean;
}

// Global instance
export const dataControlStore = new DataControlStore();