
import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    // Check for theme when component mounts
    const checkTheme = () => {
      setIsDarkMode(!document.documentElement.classList.contains('light'));
    };
    
    // Check theme initially
    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'class'
        ) {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Listen for settings updates
    const handleSettingsUpdate = () => {
      checkTheme();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none z-0"></div>
      
      {/* Glow effects - different colors based on theme */}
      {isDarkMode ? (
        <>
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-neonBlue/20 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
          <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-neonBlue/10 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        </>
      )}
      
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 z-10">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
