import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { X, LucideIcon } from "lucide-react";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    className?: string;
}

export function Modal({ open, onOpenChange, children, className = "" }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`max-w-xl p-0 overflow-hidden border border-slate-200 bg-white rounded-3xl shadow-2xl ${className}`}>
                {children}
            </DialogContent>
        </Dialog>
    );
}

Modal.Header = ({
    title,
    subtitle,
    icon: Icon,
    showClose = true,
    onClose
}: {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    showClose?: boolean;
    onClose?: () => void
}) => (
    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
        <div className="flex items-center gap-5">
            {Icon && (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <div>
                <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">{title}</DialogTitle>
                {subtitle && <DialogDescription className="text-sm text-gray-500 font-normal mt-0.5">{subtitle}</DialogDescription>}
            </div>
        </div>
        {showClose && onClose && (
            <button
                onClick={onClose}
                className="p-2.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-90"
            >
                <X className="h-5 w-5" />
            </button>
        )}
    </div>
);

Modal.Content = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`p-8 ${className}`}>
        {children}
    </div>
);

Modal.Footer = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 ${className}`}>
        {children}
    </div>
);
