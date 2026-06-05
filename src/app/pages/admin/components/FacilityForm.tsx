import { Building2, Plus, X } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { cn } from "../../../components/ui/utils";

export const facCats = ["CHEMISTRY_LAB", "BIOMEDICAL_LAB", "EEE_LAB", "ECE_LAB", "PHYSICS_LAB", "COMPUTER_LAB", "MECHANICAL_LAB", "Other"];
export const facAvails = ["Available", "Limited", "Unavailable"];

interface FacilityFormProps {
    isEditMode: boolean;
    fac: {
        facilityName: string; facilityCategory: string; spaceDescription: string; capacity: number; roomLocation: string;
        availabilityStatus: "Available" | "Limited" | "Unavailable";
    };
    handleFacChange: (field: string, value: any) => void;
    facErrors: Record<string, string>;
    featInput: string;
    setFeatInput: (val: string) => void;
    features: string[];
    addFeat: () => void;
    removeFeat: (feat: string) => void;
}

export function FacilityForm({
    isEditMode,
    fac,
    handleFacChange,
    facErrors,
    featInput,
    setFeatInput,
    features,
    addFeat,
    removeFeat
}: FacilityFormProps) {

    return (
        <section className="w-1/2 flex flex-col overflow-hidden">
            <div className="flex flex-col h-full">
                <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Facility Details</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">Core information and specifications</p>
                    </div>
                    {isEditMode && <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 shadow-sm">Editing Mode</Badge>}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fac-name" className="text-slate-600 font-bold uppercase text-[10px]">Facility Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="fac-name"
                                placeholder="e.g., Advanced Chemistry Laboratory"
                                value={fac.facilityName}
                                onChange={(e) => handleFacChange("facilityName", e.target.value)}
                                className={cn("bg-slate-50/50 focus:bg-white border-slate-200 h-11", facErrors.facilityName && "border-red-400")}
                            />
                            {facErrors.facilityName && <p className="text-[10px] text-red-500 font-medium px-1 uppercase tracking-tight">Required</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px]">Category <span className="text-red-500">*</span></Label>
                                <Select value={fac.facilityCategory} onValueChange={(v) => handleFacChange("facilityCategory", v)}>
                                    <SelectTrigger className={cn("bg-slate-50/50 border-slate-200 h-11", facErrors.facilityCategory && "border-red-400")}>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facCats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px]">Availability Status</Label>
                                <Select value={fac.availabilityStatus} onValueChange={(v: "Available" | "Limited" | "Unavailable") => handleFacChange("availabilityStatus", v)}>
                                    <SelectTrigger className="bg-slate-50/50 border-slate-200 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facAvails.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px]">Capacity <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 20"
                                    value={fac.capacity || ""}
                                    onChange={(e) => handleFacChange("capacity", parseInt(e.target.value) || 0)}
                                    className={cn("bg-slate-50/50 border-slate-200 h-11", facErrors.capacity && "border-red-400")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px]">Room / Location <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="e.g., Block A, 101"
                                    value={fac.roomLocation}
                                    onChange={(e) => handleFacChange("roomLocation", e.target.value)}
                                    className={cn("bg-slate-50/50 border-slate-200 h-11", facErrors.roomLocation && "border-red-400")}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600 font-bold uppercase text-[10px]">Space Description <span className="text-red-500">*</span></Label>
                        <Textarea
                            placeholder="Purpose, safety levels, and general information..."
                            value={fac.spaceDescription}
                            onChange={(e) => handleFacChange("spaceDescription", e.target.value)}
                            className={cn("bg-slate-50/50 border-slate-200 min-h-[100px]", facErrors.spaceDescription && "border-red-400")}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-slate-600 font-bold uppercase text-[10px]">Key Facility Features</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g., Fume Hoods"
                                value={featInput}
                                onChange={(e) => setFeatInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeat())}
                                className="bg-slate-50/50 border-slate-200 h-11"
                            />
                            <Button type="button" variant="outline" onClick={addFeat} className="h-11 border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                        {features.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {features.map(f => (
                                    <Badge key={f} variant="secondary" className="bg-slate-100 text-slate-700 border-none px-3 py-1 font-medium group flex items-center gap-1.5">
                                        {f}
                                        <button onClick={() => removeFeat(f)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
