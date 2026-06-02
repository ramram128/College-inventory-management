import { ReactNode } from "react";

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
    return (
        <div className={`flex flex-col w-full min-h-full ${className}`}>
            {children}
        </div>
    );
}

PageLayout.Hero = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <section className={`relative bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100/50 ${className}`}>
        <div className="max-w-8xl mx-auto">
            {children}
        </div>
    </section>
);

PageLayout.Content = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 bg-white ${className}`}>
        <div className="max-w-8xl mx-auto">
            {children}
        </div>
    </section>
);

PageLayout.Stats = ({ title, value, icon: Icon }: { title: string; value: string; icon: any }) => (
    <div className="flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm shadow-blue-500/5 group hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        </div>
        <div className="text-3xl font-black text-gray-900">{value}</div>
    </div>
);
