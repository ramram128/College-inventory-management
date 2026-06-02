import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { useAppContext } from "../context/AppContext";
import { Button } from "./ui/button";

interface LogoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function LogoutModal({ open, onOpenChange, onConfirm }: LogoutModalProps) {
    const { currentUser } = useAppContext();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[340px] p-6 border border-gray-100 bg-white rounded-2xl shadow-xl items-center text-center gap-5 sm:rounded-2xl sm:max-w-[340px]">
                <div className="flex flex-col gap-2">
                    <DialogTitle className="text-lg font-semibold text-gray-900 tracking-normal leading-tight">
                        Are you sure you<br />want to log out?
                    </DialogTitle>
                </div>

                <DialogDescription className="text-sm font-normal text-gray-500">
                    Log out of MCE R&D Center as
                    <br />
                    <span className="font-medium text-gray-900">{currentUser?.email || "Academic Researcher"}</span>?
                </DialogDescription>

                <div className="flex flex-col w-full gap-2 mt-2">
                    <Button
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors text-sm shadow-sm"
                    >
                        Log out
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-full border border-gray-200 transition-colors text-sm shadow-sm"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
