
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User, BarChart, Video, History, LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const routes = [
    { name: "Dashboard", path: "/dashboard", icon: <BarChart className="h-5 w-5" /> },
    { name: "Register Face", path: "/face-register", icon: <User className="h-5 w-5" /> },
    { name: "Take Attendance", path: "/attendance", icon: <Video className="h-5 w-5" /> },
    { name: "Reports", path: "/reports", icon: <History className="h-5 w-5" /> },
  ];

  const NavLinks = () => (
    <>
      {routes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
            location.pathname === route.path
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-secondary"
          }`}
        >
          {route.icon}
          <span>{route.name}</span>
        </Link>
      ))}
    </>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 backdrop-blur-md ${
        isScrolled ? "border-b glass-morphism" : ""
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">FacePresence</span>
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <Button 
                    variant="destructive" 
                    className="mt-4 flex items-center gap-2"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>
        )}

        {!isMobile && (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="flex flex-col gap-1 p-2">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
