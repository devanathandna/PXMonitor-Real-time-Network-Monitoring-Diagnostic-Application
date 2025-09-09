
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-darkNavy text-softWhite p-6">
      <div className="text-center max-w-md">
        <div className="text-neonBlue text-8xl font-bold mb-4">404</div>
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="glow-button inline-flex items-center justify-center"
        >
          Return to Dashboard
        </Link>
      </div>
      
      {/* Background network lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        {/* Random dots */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-neonBlue rounded-full" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `pulse ${2 + Math.random() * 4}s infinite alternate`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotFound;
