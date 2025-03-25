
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, LayoutDashboard, Plus, Menu, X, Guitar, Star, Music, PlaySquare, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@/api/entities";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userData = await User.me();
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Musical notes background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-repeat z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 16.5c0 4.142-3.358 7.5-7.5 7.5S11 20.642 11 16.5c0-4.142 3.358-7.5 7.5-7.5 4.142 0 7.5 3.358 7.5 7.5zm15 0c0 4.142-3.358 7.5-7.5 7.5S26 20.642 26 16.5c0-4.142 3.358-7.5 7.5-7.5 4.142 0 7.5 3.358 7.5 7.5z' fill='%23000000' fill-opacity='0.4'/%3E%3C/svg%3E")`
        }}
      ></div>

      {/* Mobile sidebar backdrop - improved with better animation */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in-0 duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header - improved with logo */}
      <header className="fixed top-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-md border-b px-4 py-3 z-30 flex justify-between items-center">
        <Link to={createPageUrl("Home")} className="text-lg font-bold flex items-center gap-1.5">
          <Guitar className="w-5 h-5 text-blue-600" />
          <span className="text-blue-900">מלווה מלכה</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="text-blue-700"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Sidebar - enhanced for mobile */}
      <aside className={cn(
        "fixed top-0 right-0 z-50 h-full w-[85%] max-w-[320px] bg-white/95 backdrop-blur-md border-l transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none",
        sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0 md:w-64"
      )}>
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <Link to={createPageUrl("Home")} className="text-xl font-bold flex items-center gap-2 text-blue-900">
            <Guitar className="w-6 h-6 text-blue-600" />
            מלווה מלכה
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          <Link
            to={createPageUrl("Home")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors",
              currentPageName === "Home" 
                ? "bg-blue-100 text-blue-900" 
                : "text-gray-700 hover:bg-blue-50"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard className="w-5 h-5" />
            דף הבית
          </Link>
          <Link
            to={createPageUrl("EditSong")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors",
              currentPageName === "EditSong" 
                ? "bg-blue-100 text-blue-900" 
                : "text-gray-700 hover:bg-blue-50"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Plus className="w-5 h-5" />
            הוסף שיר חדש
          </Link>
          
          <Link
            to={createPageUrl("Favorites")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors",
              currentPageName === "Favorites" 
                ? "bg-blue-100 text-blue-900" 
                : "text-gray-700 hover:bg-blue-50"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Star className="w-5 h-5" />
            מועדפים
          </Link>
          
          <Link
            to={createPageUrl("Playlists")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors",
              currentPageName === "Playlists" 
                ? "bg-blue-100 text-blue-900" 
                : "text-gray-700 hover:bg-blue-50"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <PlaySquare className="w-5 h-5" />
            פלייליסטים
          </Link>

          {/* Google login button - improved touch target */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                className="w-full justify-start py-3 text-base"
                onClick={handleLogout}
              >
                <LogIn className="w-5 h-5 mr-2 rotate-180" />
                התנתק
              </Button>
            ) : (
              <Button 
                className="w-full justify-start py-3 text-base bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                onClick={handleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                התחבר עם Google
              </Button>
            )}
          </div>
        </nav>
      </aside>

      {/* Main content with safe area for iPhone */}
      <div className="md:mr-64 pb-20"> {/* Added bottom padding for mobile */}
        {/* Main content area with improved spacing */}
        <main className="relative z-10 pt-16 md:pt-2 px-3 md:px-0">
          {children}
        </main>
      </div>
    </div>
  );
}
