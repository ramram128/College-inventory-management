import { Navbar } from "./Navbar";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Microscope, Shield, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "../context/AppContext";
import { UserMenu } from "./UserMenu";

const navLinks: { path: string; label: string }[] = [];

interface NavigationProps {
  onMenuClick?: () => void;
  onLogoutClick?: () => void;
}

export function Navigation({ onMenuClick, onLogoutClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAppContext();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);


  return (
    <Navbar>
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Navbar.Brand
          to="/"
          icon={Microscope}
          title="Mahendra R&D Hub"
          subtitle="Research & Development"
        />
      </div>

      {/* Desktop Nav */}
      <Navbar.Nav>
        {navLinks.map((link) => (
          <Navbar.Link
            key={link.path}
            to={link.path}
            label={link.label}
            isActive={isActive(link.path)}
          />
        ))}
      </Navbar.Nav>

      {/* Desktop Right Actions */}
      <Navbar.Actions className="hidden md:flex items-center gap-3">
        {currentUser ? (
          <>
            {currentUser.role === "admin" && (
              <Button variant="ghost" size="sm" asChild className="text-slate-700 gap-1.5">
                <Link to="/admin"><Shield className="h-4 w-4" />Admin</Link>
              </Button>
            )}
            <UserMenu
              variant="navbar"
              onLogoutClick={onLogoutClick!}
            />
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link to="/login"><LogIn className="h-4 w-4" />Sign In</Link>
            </Button>
          </>
        )}
      </Navbar.Actions>

      {/* Mobile menu button */}
      <Navbar.MobileToggle
        isOpen={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Mobile Nav overlay - Simplified integration */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl md:hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-6 py-3 transition-colors text-sm font-medium ${isActive(link.path)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 space-y-2 mt-2 px-4 pb-2">
              {currentUser ? (
                <>
                  {currentUser.role === "admin" && (
                    <Link to="/admin" className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      onClick={() => setIsMenuOpen(false)}>
                      <Shield className="h-4 w-4 text-blue-600" />Admin Portal
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="h-4 w-4 text-gray-400" />Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
}
