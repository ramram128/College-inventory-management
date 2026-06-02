import { ReactNode } from "react";
import { Link } from "react-router";
import { User, Settings, LogOut, ChevronRight, LucideIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAppContext } from "../context/AppContext";

interface SidebarProps {
    children: ReactNode;
    isOpen?: boolean;
    className?: string;
}

export function Sidebar({ children, isOpen = true, className = "" }: SidebarProps) {
    return (
        <aside
            className={`${isOpen ? "w-[280px]" : "w-0 overflow-hidden"
                } bg-white border-r border-gray-200 shrink-0 text-slate-700 flex flex-col h-full transition-all duration-300 ease-in-out z-40 relative shadow-sm ${className}`}
        >
            {children}
        </aside>
    );
}

Sidebar.Nav = ({ children }: { children: ReactNode }) => (
    <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar min-w-[280px]">
        {children}
    </div>
);

Sidebar.Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="flex flex-col gap-1 mb-6 last:mb-0">
        <div className="mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {title}
        </div>
        <div className="flex flex-col gap-1">
            {children}
        </div>
    </div>
);

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick?: () => void;
    to?: string;
    state?: any;
    badge?: number;
}

Sidebar.Item = ({ icon: Icon, label, isActive, onClick, to, state, badge }: SidebarItemProps) => {
    const content = (
        <>
            <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
            <span className="flex-1 text-left">{label}</span>
            {badge != null && badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {badge}
                </span>
            )}
        </>
    );

    const className = `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group w-full ${isActive
        ? "bg-blue-50 text-blue-700 font-medium"
        : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
        }`;

    if (to) {
        return (
            <Link to={to} state={state} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {content}
        </button>
    );
};

Sidebar.Profile = ({ onSettingsClick, onLogoutClick }: { onSettingsClick: () => void; onLogoutClick: () => void }) => {
    const { currentUser } = useAppContext();

    return (
        <div className="p-4 border-t border-gray-200 shrink-0 min-w-[280px]">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group text-left outline-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-white shadow-sm overflow-hidden group-hover:border-blue-200 transition-colors">
                                {currentUser?.name ? (
                                    currentUser.name.split(' ').map(n => n[0]).join('')
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                                    {currentUser?.name || "Guest"}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                    {currentUser ? (currentUser.role === 'admin' ? 'Plus' : 'Researcher') : "Not signed in"}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="top"
                    align="start"
                    sideOffset={12}
                    className="w-64 bg-white border border-slate-200 text-slate-900 rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50"
                >
                    <DropdownMenuLabel className="px-2 py-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : "G"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900">{currentUser ? currentUser.name : "Guest"}</span>
                                <span className="text-[11px] text-slate-500 font-medium">@{currentUser ? currentUser.name.toLowerCase().replace(' ', '') : "guest"}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="bg-slate-100 my-1 mx-1.5" />

                    <DropdownMenuGroup className="px-1">
                        <DropdownMenuItem
                            onClick={onSettingsClick}
                            className="rounded-lg py-2 px-2.5 focus:bg-slate-50 focus:text-slate-900 cursor-pointer group transition-colors"
                        >
                            <Settings className="mr-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            <span className="text-sm font-medium">Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onLogoutClick}
                            className="rounded-lg py-2 px-2.5 focus:bg-slate-50 focus:text-slate-900 cursor-pointer group transition-colors mt-0.5"
                        >
                            <LogOut className="mr-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            <span className="text-sm font-medium text-slate-900">Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
