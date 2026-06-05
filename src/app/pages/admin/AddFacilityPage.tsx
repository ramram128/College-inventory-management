import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, X, CheckCircle, Building2, Save, Clock, PencilLine } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { useAppContext } from "../../context/AppContext";
import { SuccessModal } from "./components/SuccessModal";

const categories = [
    "CHEMISTRY_LAB", "BIOMEDICAL_LAB", "EEE_LAB", "ECE_LAB",
    "PHYSICS_LAB", "COMPUTER_LAB", "MECHANICAL_LAB", "Other",
];

const defaultImages: Record<string, string> = {
    CHEMISTRY_LAB: "https://images.unsplash.com/photo-1707944746058-4da338d0f827?w=800&q=80",
    BIOMEDICAL_LAB: "https://images.unsplash.com/photo-1732400333616-8efa4f385a03?w=800&q=80",
    EEE_LAB: "https://images.unsplash.com/photo-1765830403209-a5eceac4c198?w=800&q=80",
    ECE_LAB: "https://images.unsplash.com/photo-1759866042499-d0b3e9d87ceb?w=800&q=80",
    PHYSICS_LAB: "https://images.unsplash.com/photo-1707944746058-4da338d0f827?w=800&q=80",
    COMPUTER_LAB: "https://images.unsplash.com/photo-1765830403209-a5eceac4c198?w=800&q=80",
    MECHANICAL_LAB: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&q=80",
};

export function AddFacilityPage() {
    const { addFacility, updateFacility, facilities } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [done, setDone] = useState(false);
    const [addedName, setAddedName] = useState("");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        facilityName: "",
        facilityCategory: "",
        spaceDescription: "",
        capacity: 0,
        roomLocation: "",
        availabilityStatus: "Available" as "Available" | "Limited" | "Unavailable",
    });
    const [featureInput, setFeatureInput] = useState("");
    const [features, setFeatures] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isEditMode && facilities.length > 0) {
            const facility = facilities.find(f => f.id === id);
            if (facility) {
                setForm({
                    facilityName: facility.facilityName,
                    facilityCategory: facility.facilityCategory,
                    spaceDescription: facility.spaceDescription,
                    capacity: facility.capacity,
                    roomLocation: facility.roomLocation,
                    availabilityStatus: facility.availabilityStatus,
                });
                setFeatures(facility.keyFacilityFeatures);
            }
        }
    }, [isEditMode, id, facilities]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.facilityName.trim()) e.facilityName = "Required";
        if (!form.facilityCategory) e.facilityCategory = "Required";
        if (!form.spaceDescription.trim()) e.spaceDescription = "Required";
        if (form.capacity <= 0) e.capacity = "Required";
        if (!form.roomLocation.trim()) e.roomLocation = "Required";
        return e;
    };

    const addFeature = () => {
        const v = featureInput.trim();
        if (v && !features.includes(v)) setFeatures([...features, v]);
        setFeatureInput("");
    };
    const removeFeature = (v: string) => setFeatures(features.filter((f) => f !== v));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        setTimeout(() => {
            const submission = {
                ...form,
                keyFacilityFeatures: features,
                createdAt: new Date().toISOString(),
                image: defaultImages[form.facilityCategory] || defaultImages.CHEMISTRY_LAB,
            };

            if (isEditMode) {
                updateFacility(id!, { ...form, keyFacilityFeatures: features });
            } else {
                addFacility(submission);
            }
            setAddedName(form.facilityName);
            setDone(true);
            setLoading(false);
        }, 800);
    };

    const resetForm = () => {
        setForm({ facilityName: "", facilityCategory: "", spaceDescription: "", capacity: 0, roomLocation: "", availabilityStatus: "Available" });
        setFeatures([]); setErrors({}); setDone(false);
    };

    if (done) {
        return (
            <div className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
                <SuccessModal
                    isEditMode={isEditMode}
                    savedName={addedName}
                    savedCount={0}
                    onReset={resetForm}
                />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
            {/* Header - Fixed at Top */}
            <div className="bg-slate-900 text-white p-6 shadow-lg shrink-0">
                <div className="flex items-center gap-4 mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-300 hover:text-white -ml-2"
                        asChild
                    >
                        <Link to="/admin">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Admin
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-400/30">
                        {isEditMode ? <PencilLine className="h-8 w-8 text-emerald-400" /> : <Building2 className="h-8 w-8 text-emerald-400" />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Facility" : "Add New Facility"}</h1>
                        <p className="text-slate-400 text-sm">{isEditMode ? `Updating "${form.facilityName}"` : "Register a new research facility or laboratory"}</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-4xl">
                    <Card className="border-none shadow-md bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>{isEditMode ? "Edit Details" : "Facility Details"}</CardTitle>
                            <CardDescription>Fields marked <span className="text-red-500">*</span> are required.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold border-b pb-2 text-gray-800">Basic Information</h3>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="facilityName">Facility Name <span className="text-red-500">*</span></Label>
                                        <Input id="facilityName" placeholder="e.g., Advanced Chemistry Laboratory"
                                            value={form.facilityName} onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
                                            className={errors.facilityName ? "border-red-400" : ""} />
                                        {errors.facilityName && <p className="text-xs text-red-500">{errors.facilityName}</p>}
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="facilityCategory">Category <span className="text-red-500">*</span></Label>
                                            <Select value={form.facilityCategory} onValueChange={(v) => setForm({ ...form, facilityCategory: v })}>
                                                <SelectTrigger id="facilityCategory" className={errors.facilityCategory ? "border-red-400" : ""}>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {errors.facilityCategory && <p className="text-xs text-red-500">{errors.facilityCategory}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="availabilityStatus">Initial Availability</Label>
                                            <Select value={form.availabilityStatus} onValueChange={(v) => setForm({ ...form, availabilityStatus: v as typeof form.availabilityStatus })}>
                                                <SelectTrigger id="availabilityStatus"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Available">Available</SelectItem>
                                                    <SelectItem value="Limited">Limited</SelectItem>
                                                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="capacity">Capacity <span className="text-red-500">*</span></Label>
                                            <Input id="capacity" type="number" placeholder="e.g., 20"
                                                value={form.capacity || ""} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                                                className={errors.capacity ? "border-red-400" : ""} />
                                            {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="roomLocation">Room / Location <span className="text-red-500">*</span></Label>
                                            <Input id="roomLocation" placeholder="e.g., Block A, Room 101"
                                                value={form.roomLocation} onChange={(e) => setForm({ ...form, roomLocation: e.target.value })}
                                                className={errors.roomLocation ? "border-red-400" : ""} />
                                            {errors.roomLocation && <p className="text-xs text-red-500">{errors.roomLocation}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="spaceDescription">Description <span className="text-red-500">*</span></Label>
                                        <Textarea id="spaceDescription" rows={3}
                                            placeholder="Describe the facility, its purpose, equipment, and any certifications..."
                                            value={form.spaceDescription} onChange={(e) => setForm({ ...form, spaceDescription: e.target.value })}
                                            className={errors.spaceDescription ? "border-red-400" : ""} />
                                        {errors.spaceDescription && <p className="text-xs text-red-500">{errors.spaceDescription}</p>}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold border-b pb-2 text-gray-800">Key Features / Equipment</h3>
                                    <div className="flex gap-2">
                                        <Input placeholder='e.g., "Fume Hoods" or "PCR Machines" — press Enter'
                                            value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} />
                                        <Button type="button" variant="outline" onClick={addFeature}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-[28px] p-3 bg-slate-50 rounded-lg">
                                        {features.length === 0 && <p className="text-xs text-gray-400 italic">No features added yet</p>}
                                        {features.map((f) => (
                                            <Badge key={f} variant="secondary" className="gap-1 pl-3 pr-2 py-1 bg-emerald-50 text-emerald-700 border-emerald-100">
                                                {f}
                                                <button type="button" onClick={() => removeFeature(f)} className="hover:text-red-600 ml-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button type="submit" size="lg" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                                        {loading ? (
                                            <><Clock className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? "Saving..." : "Adding..."}</>
                                        ) : (
                                            <><Save className="h-4 w-4 mr-2" /> {isEditMode ? "Save Changes" : "Add Facility"}</>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" size="lg" onClick={() => navigate("/admin")}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
