import { User, Settings, LogOut, ChevronRight, CalendarCheck } from "lucide-react";
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
import { useNavigate } from "react-router";

interface UserMenuProps {
    onLogoutClick: () => void;
    variant?: "sidebar" | "navbar";
    isSidebarOpen?: boolean;
}

export function UserMenu({ onLogoutClick, variant = "sidebar", isSidebarOpen = true }: UserMenuProps) {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();
    const initials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('') : "G";

    const MenuContent = (
        <DropdownMenuContent
            side={variant === "sidebar" ? "top" : "bottom"}
            align={variant === "sidebar" ? "start" : "end"}
            sideOffset={12}
            className="w-64 bg-white border border-slate-200 text-slate-900 rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50"
        >
            <DropdownMenuLabel className="px-2 py-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden relative group/menu-avatar shrink-0">
                        {currentUser?.profilePic ? (
                            <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-slate-600">{initials}</span>
                        )}
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
                    onClick={() => navigate('/settings')}
                    className="rounded-lg py-2 px-2.5 focus:bg-slate-50 focus:text-slate-900 cursor-pointer group transition-colors"
                >
                    <Settings className="mr-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    <span className="text-sm font-medium">Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => navigate('/my-bookings')}
                    className="rounded-lg py-2 px-2.5 focus:bg-slate-50 focus:text-slate-900 cursor-pointer group transition-colors mt-0.5"
                >
                    <CalendarCheck className="mr-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium">My Bookings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onLogoutClick}
                    className="rounded-lg py-2 px-2.5 focus:bg-slate-100 focus:text-slate-900 cursor-pointer group transition-colors mt-0.5"
                >
                    <LogOut className="mr-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    <span className="text-sm font-medium text-slate-900">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    );

    if (variant === "sidebar") {
        return (
            <div className={`p-4 mt-auto border-t border-gray-100 shrink-0 ${!isSidebarOpen && "flex justify-center"}`}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group text-left outline-hidden ${!isSidebarOpen && "justify-center"}`}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm transition-colors bg-blue-50 text-blue-500 overflow-hidden text-center object-cover">
                                {currentUser ? (
                                    currentUser.profilePic ? (
                                        <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-xs uppercase text-blue-600">
                                            {initials}
                                        </span>
                                    )
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </div>

                            {isSidebarOpen && (
                                <>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="text-sm font-bold text-slate-800 truncate leading-tight">
                                            {currentUser ? currentUser.name : "Guest"}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium truncate">
                                            {currentUser ? (currentUser.role === 'admin' ? 'Administrator' : 'Researcher') : "Not signed in"}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                                </>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    {MenuContent}
                </DropdownMenu>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-all outline-hidden group border border-transparent hover:border-slate-200 shadow-sm sm:pr-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs border border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative object-cover">
                        {currentUser?.profilePic ? (
                            <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {currentUser?.name.split(' ')[0]}
                    </span>
                </button>
            </DropdownMenuTrigger>
            {MenuContent}
        </DropdownMenu>
    );
}
