import { Link } from "react-router";
import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

interface SuccessModalProps {
    isEditMode: boolean;
    savedName: string;
    savedCount: number;
    onReset: () => void;
}

export function SuccessModal({ isEditMode, savedName, savedCount, onReset }: SuccessModalProps) {
    return (
        <div className="flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
                <div className="h-1.5 bg-emerald-500" />
                <CardHeader className="text-center pt-8 px-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                        {isEditMode ? "Changes Saved!" : "Item Added!"}
                    </CardTitle>
                    <CardDescription className="text-sm mt-3 px-2">
                        <span className="font-semibold text-emerald-700 block mb-1">"{savedName}"</span>
                        {savedCount > 0
                            ? `with ${savedCount} equipment items has been successfully ${isEditMode ? "updated" : "added"}.`
                            : `has been successfully ${isEditMode ? "updated" : "added"}.`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-8 pt-4 px-8">
                    {!isEditMode && (
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11" onClick={onReset}>
                            <Plus className="h-4 w-4 mr-2" /> Add Another
                        </Button>
                    )}
                    <Button variant="outline" className="w-full h-11 border-slate-200" asChild>
                        <Link to="/admin">Back to Admin Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full text-slate-500 hover:text-emerald-600" asChild>
                        <Link to="/facilities">View All Facilities</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
