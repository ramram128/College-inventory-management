import { Plus, X, Trash2, ChevronDown, PackagePlus, PlusCircle } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { cn } from "../../../components/ui/utils";

export const eqCats = ["Analytical Instruments", "Microscopy & Imaging", "Molecular Biology", "Cell Culture & Preparation", "Electronics & Prototyping", "Computing & AI", "Other"];
export const eqStatuses = ["Available", "In Use", "Maintenance"];

export interface EquipmentState {
    id: string | number;
    equipmentName: string;
    equipmentCategory: string;
    manufacturer: string;
    modelNumber: string;
    initialStatus: "Available" | "In Use" | "Maintenance";
    instrumentDescription: string;
    specInput: string;
    technicalSpecifications: string[];
    appInput: string;
    researchApplications: string[];
    expanded: boolean;
    errors: Record<string, string>;
    dbId?: string;
}

export const createBlankEq = (): EquipmentState => ({
    id: Date.now() + Math.random(),
    equipmentName: "",
    equipmentCategory: "",
    manufacturer: "",
    modelNumber: "",
    initialStatus: "Available",
    instrumentDescription: "",
    specInput: "",
    technicalSpecifications: [],
    appInput: "",
    researchApplications: [],
    expanded: true,
    errors: {},
});

interface EquipmentFormProps {
    equipments: EquipmentState[];
    updateEq: (id: string | number, field: string, value: any) => void;
    removeEq: (id: string | number) => void;
    addEq: () => void;
    availableEqCats: string[];
}

export function EquipmentForm({
    equipments,
    updateEq,
    removeEq,
    addEq,
    availableEqCats
}: EquipmentFormProps) {
    return (
        <section className="w-1/2 flex flex-col bg-slate-50/50 overflow-hidden text-sm">
            <div className="flex flex-col h-full">
                <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Facility Equipment</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">Add high-performance instruments for this space</p>
                    </div>
                    <Button onClick={addEq} size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 shadow-sm text-xs font-semibold rounded px-3 transition-all w-auto">
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Equipment
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
                    {equipments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-10 space-y-4 opacity-40">
                            <div className="p-4 rounded-full bg-slate-200/50 border-2 border-dashed border-slate-300">
                                <PackagePlus className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-600 tracking-tight">No equipment added yet</p>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-[240px]">You can save the facility now or add instrumentation using the button above.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {equipments.map((eq, i) => (
                                <Card key={eq.id} className={cn("border-none shadow-sm overflow-hidden transition-all duration-300",
                                    eq.expanded ? "ring-2 ring-blue-500/20" : "hover:ring-1 hover:ring-blue-200 bg-white/70")}>

                                    {/* Card Header */}
                                    <div
                                        className="px-4 py-3 bg-white flex items-center gap-4 cursor-pointer select-none"
                                        onClick={() => updateEq(eq.id, "expanded", !eq.expanded)}
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-slate-800 truncate">
                                                {eq.equipmentName || <span className="text-slate-300 font-normal italic">Nameless Equipment</span>}
                                            </h3>
                                            {eq.manufacturer && (
                                                <p className="text-[10px] text-slate-400 font-medium">{eq.manufacturer} {eq.modelNumber && `• ${eq.modelNumber}`}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <Badge variant="outline" className={cn("text-[9px] font-bold px-2 h-5 tracking-tight uppercase",
                                                eq.initialStatus === "Available" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    eq.initialStatus === "In Use" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                        "bg-red-50 text-red-700 border-red-100"
                                            )}>
                                                {eq.initialStatus}
                                            </Badge>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeEq(eq.id); }}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform duration-300", eq.expanded && "rotate-180")} />
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    {eq.expanded && (
                                        <CardContent className="px-4 pb-5 pt-1 space-y-6 bg-slate-50/50 border-t border-slate-100">
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <div className="col-span-2 space-y-1.5">
                                                    <Label className="text-[9px] font-bold uppercase text-slate-500">Equipment Name *</Label>
                                                    <Input
                                                        placeholder="e.g., RT-PCR System"
                                                        value={eq.equipmentName}
                                                        onChange={(e) => updateEq(eq.id, "equipmentName", e.target.value)}
                                                        className={cn("h-9 text-sm bg-white border-slate-200", eq.errors.equipmentName && "border-red-400")}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-bold uppercase text-slate-500">Category *</Label>
                                                    <Select value={eq.equipmentCategory} onValueChange={(v) => updateEq(eq.id, "equipmentCategory", v)}>
                                                        <SelectTrigger className={cn("h-9 text-sm bg-white border-slate-200", eq.errors.equipmentCategory && "border-red-400")}>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableEqCats.filter(Boolean).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                            {availableEqCats.length === 0 && <SelectItem value="Other" disabled>Select Facility Category First</SelectItem>}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-bold uppercase text-slate-500">Initial Status</Label>
                                                    <Select value={eq.initialStatus} onValueChange={(v) => updateEq(eq.id, "initialStatus", v)}>
                                                        <SelectTrigger className="h-9 text-sm bg-white border-slate-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {eqStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-bold uppercase text-slate-500">Manufacturer *</Label>
                                                    <Input
                                                        placeholder="e.g., Bio-Rad"
                                                        value={eq.manufacturer}
                                                        onChange={(e) => updateEq(eq.id, "manufacturer", e.target.value)}
                                                        className={cn("h-9 text-sm bg-white border-slate-200", eq.errors.manufacturer && "border-red-400")}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-bold uppercase text-slate-500">Model Number *</Label>
                                                    <Input
                                                        placeholder="e.g., CFX Opus"
                                                        value={eq.modelNumber}
                                                        onChange={(e) => updateEq(eq.id, "modelNumber", e.target.value)}
                                                        className={cn("h-9 text-sm bg-white border-slate-200", eq.errors.modelNumber && "border-red-400")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase text-slate-500">Instrument Description *</Label>
                                                <Textarea
                                                    placeholder="Technical summary and use cases..."
                                                    value={eq.instrumentDescription}
                                                    onChange={(e) => updateEq(eq.id, "instrumentDescription", e.target.value)}
                                                    className={cn("text-xs bg-white border-slate-200 min-h-[60px]", eq.errors.instrumentDescription && "border-red-400")}
                                                />
                                            </div>

                                            {/* Tags Sections */}
                                            <div className="space-y-4 pt-2">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-bold uppercase text-slate-500">Technical Specifications</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="e.g., 0.1nm resolution"
                                                            value={eq.specInput}
                                                            onChange={(e) => updateEq(eq.id, "specInput", e.target.value)}
                                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), updateEq(eq.id, "technicalSpecifications", [...eq.technicalSpecifications, eq.specInput]), updateEq(eq.id, "specInput", ""))}
                                                            className="h-9 text-sm bg-white border-slate-200"
                                                        />
                                                        <Button
                                                            size="sm" variant="outline"
                                                            onClick={() => { updateEq(eq.id, "technicalSpecifications", [...eq.technicalSpecifications, eq.specInput]); updateEq(eq.id, "specInput", ""); }}
                                                            className="h-9 w-9 p-0 border-slate-200 text-slate-400"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {eq.technicalSpecifications.map(s => (
                                                            <Badge key={s} variant="outline" className="text-[10px] font-medium bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1 group">
                                                                {s}
                                                                <X className="h-2.5 w-2.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => updateEq(eq.id, "technicalSpecifications", eq.technicalSpecifications.filter(x => x !== s))} />
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-bold uppercase text-slate-500">Research Applications</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="e.g., Molecular diagnostics"
                                                            value={eq.appInput}
                                                            onChange={(e) => updateEq(eq.id, "appInput", e.target.value)}
                                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), updateEq(eq.id, "researchApplications", [...eq.researchApplications, eq.appInput]), updateEq(eq.id, "appInput", ""))}
                                                            className="h-9 text-sm bg-white border-slate-200"
                                                        />
                                                        <Button
                                                            size="sm" variant="outline"
                                                            onClick={() => { updateEq(eq.id, "researchApplications", [...eq.researchApplications, eq.appInput]); updateEq(eq.id, "appInput", ""); }}
                                                            className="h-9 w-9 p-0 border-slate-200 text-slate-400"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {eq.researchApplications.map(a => (
                                                            <Badge key={a} variant="outline" className="text-[10px] font-medium bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1 group">
                                                                {a}
                                                                <X className="h-2.5 w-2.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => updateEq(eq.id, "researchApplications", eq.researchApplications.filter(x => x !== a))} />
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}

                    <Button variant="outline" onClick={addEq} className="w-full h-16 border-2 border-dashed border-blue-200 bg-blue-50/20 hover:bg-blue-50 hover:border-blue-300 text-blue-500 font-semibold rounded-2xl group transition-all duration-300">
                        <PlusCircle className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                        Add New Equipment Item
                    </Button>
                </div>
            </div>
        </section>
    );
}
