import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="flex-none sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
                <Navigation />
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
