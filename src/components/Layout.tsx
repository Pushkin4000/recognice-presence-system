
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAuthPage && <Navbar />}
      <main className={`flex-1 ${isAuthPage ? "" : "container py-6 md:py-10"}`}>
        <div 
          className="w-full h-full animate-fade-in"
          style={{
            animation: "fade-in 0.3s ease-out, slide-in 0.4s ease-out"
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
