
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { AdminNavLink } from "./AdminNavLink";

export function Navbar() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MobileSidebar />
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold inline-block">CarTrade</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/value-my-car"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Value My Car
            </Link>
            <AdminNavLink />
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center">
            {loading ? (
              <Button variant="ghost" size="sm" disabled>
                Loading...
              </Button>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link to="/add-listing">
                  <Button size="sm" className="px-4">
                    Add Listing
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4"
                  onClick={() => signOut()}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" variant="default">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Need to add a default export to match the import in Index.tsx
export default Navbar;
