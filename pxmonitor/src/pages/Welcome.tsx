
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Welcome = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  
  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-darkPurple to-deepPurple relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:25px_25px] opacity-15"></div>
      
      {/* Animated glow effects */}
      <div className="absolute top-1/3 left-1/5 w-96 h-96 bg-accent/30 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-neonBlue/20 rounded-full blur-[150px] opacity-20"></div>
      
      {/* Content */}
      <div className="max-w-xl w-full text-center z-10 p-10">
        <div className="mb-8">
          <h1 className="gradient-text text-6xl font-bold mb-4 animate-[pulse-glow_3s_ease-in-out_infinite]">
            PXMonitor
          </h1>
          <p className="text-xl text-softWhite/80 mt-4">
            Keep your internet fast and reliable
          </p>
        </div>
        
        <div 
          className={cn(
            "relative w-full h-2 mb-16 transition-all duration-800 ease-in-out",
            isAnimating ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neonBlue/50 to-accent/50 rounded-full">
            <div className="h-full w-1/3 bg-gradient-to-r from-neonBlue to-accent rounded-full absolute animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
          </div>
        </div>
        
        <button 
          onClick={handleStart}
          className={cn(
            "glow-button flex items-center justify-center gap-2 mx-auto text-lg",
            "transition-all duration-300 hover:scale-105",
            isAnimating ? "scale-150 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <span>Let's Get Started</span>
          <ArrowRight size={20} />
        </button>
      </div>
      
      {/* Network circles */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] border border-accent/30 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[400px] h-[400px] border border-neonBlue/40 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[200px] h-[200px] border border-accent/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Random dots */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full pulse-dot" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
