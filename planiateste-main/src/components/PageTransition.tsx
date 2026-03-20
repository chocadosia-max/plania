import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setTransitioning(false);
    }, 150);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      {displayChildren}
    </div>
  );
}
