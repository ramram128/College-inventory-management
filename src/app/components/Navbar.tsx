import { ReactNode, useState } from "react";
import { Link } from "react-router";
import { Menu, X, LucideIcon } from "lucide-react";

interface NavbarProps {
    children: ReactNode;
    className?: string;
}

export function Navbar({ children, className = "" }: NavbarProps) {
    return (
        <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center shrink-0 ${className}`}>
            <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
                {children}
            </div>
        </header>
    );
}

Navbar.Brand = ({ to = "/", icon: Icon, title, subtitle, onClick }: { to?: string; icon: LucideIcon; title: string; subtitle?: string; onClick?: () => void }) => {
    const content = (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
                <div className="font-bold text-gray-900 leading-tight">{title}</div>
                {subtitle && <div className="text-[11px] text-gray-500 font-medium">{subtitle}</div>}
            </div>
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="flex items-center gap-2 group text-left focus:outline-hidden">
                {content}
            </button>
        );
    }

    return (
        <Link to={to} className="flex items-center gap-2 group text-left focus:outline-hidden">
            {content}
        </Link>
    );
};

Navbar.Nav = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <nav className={`hidden md:flex items-center space-x-1 ${className}`}>
        {children}
    </nav>
);

Navbar.Link = ({ to, label, isActive }: { to: string; label: string; isActive: boolean }) => (
    <Link
        to={to}
        className={`px-4 py-2 rounded-md transition-colors text-sm ${isActive
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
    >
        {label}
    </Link>
);

Navbar.Actions = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        {children}
    </div>
);

Navbar.UserPill = ({ name, avatarText }: { name: string; avatarText: string }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200 shadow-xs">
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {avatarText}
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-28 truncate">{name}</span>
    </div>
);

Navbar.MobileToggle = ({ isOpen, onClick, className = "" }: { isOpen: boolean; onClick: () => void; className?: string }) => (
    <button
        onClick={onClick}
        className={`md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${className}`}
    >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
);

Navbar.SidebarToggle = ({ onClick, className = "" }: { onClick?: () => void; className?: string }) => (
    <button
        onClick={onClick}
        className={`p-2 mr-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-hidden ${className}`}
        title="Toggle Sidebar"
    >
        <Menu className="h-6 w-6" />
    </button>
);
