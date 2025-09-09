
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-darkPurple to-deepPurple relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:25px_25px] opacity-15"></div>
      
      {/* Animated glow effects */}
      <div className="absolute top-1/3 left-1/5 w-96 h-96 bg-accent/30 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-neonBlue/20 rounded-full blur-[150px] opacity-20"></div>
      
      {/* Content */}
      <div className="max-w-4xl w-full text-center z-10 p-10">
        <div className="mb-12">
          <h1 className="gradient-text text-6xl font-bold mb-6 animate-[pulse-glow_3s_ease-in-out_infinite]">
            PXMonitor
          </h1>
          <p className="text-2xl text-softWhite/90 mb-8">
            Advanced Network Monitoring & Optimization
          </p>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-softWhite/80 mb-6">
              Keep your internet fast and reliable with real-time network diagnostics, 
              smart insights, and automatic optimization. PXMonitor gives you complete 
              visibility into your network's health and performance.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-lg">
                <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="text-accent text-lg font-bold">1</span>
                </div>
                <p className="text-left">Real-time monitoring</p>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-lg">
                <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="text-accent text-lg font-bold">2</span>
                </div>
                <p className="text-left">Smart diagnostics</p>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-lg">
                <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="text-accent text-lg font-bold">3</span>
                </div>
                <p className="text-left">Automatic optimization</p>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/dashboard')}
          className="glow-button flex items-center justify-center gap-2 mx-auto text-lg"
        >
          <span>Get Started</span>
          <ArrowRight size={20} />
        </Button>
      </div>
      
      {/* Network circles in background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] border border-accent/30 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[400px] h-[400px] border border-neonBlue/40 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[200px] h-[200px] border border-accent/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};

export default Home;
