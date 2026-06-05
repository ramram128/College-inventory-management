import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Building2, Save, Clock, LayoutDashboard, Shield, CalendarCheck, FlaskConical, Users, ChevronRight, PencilLine, Plus } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import { LogoutModal } from "../../components/LogoutModal";
import { useAppContext, Equipment } from "../../context/AppContext";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";

import { FacilityForm } from "./components/FacilityForm";
import { EquipmentForm, EquipmentState, createBlankEq } from "./components/EquipmentForm";
import { SuccessModal } from "./components/SuccessModal";
import { getEquipmentCategories } from "../../services/firestoreService";
import categoryMapData from "../../data/categories.json";

const categoryMap: Record<string, string[]> = categoryMapData;

const defaultImages: Record<string, string> = {
    CHEMISTRY_LAB: "https://images.unsplash.com/photo-1707944746058-4da338d0f827?w=800&q=80",
    BIOMEDICAL_LAB: "https://images.unsplash.com/photo-1732400333616-8efa4f385a03?w=800&q=80",
    EEE_LAB: "https://images.unsplash.com/photo-1765830403209-a5eceac4c198?w=800&q=80",
    ECE_LAB: "https://images.unsplash.com/photo-1759866042499-d0b3e9d87ceb?w=800&q=80",
    PHYSICS_LAB: "https://images.unsplash.com/photo-1707944746058-4da338d0f827?w=800&q=80",
    COMPUTER_LAB: "https://images.unsplash.com/photo-1765830403209-a5eceac4c198?w=800&q=80",
    MECHANICAL_LAB: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&q=80",
    Other: "https://images.unsplash.com/photo-1707944746058-4da338d0f827?w=800&q=80",
};

export function CombinedAddPage() {
    const {
        addFacilityWithEquipment,
        facilities,
        equipment,
        updateFacility,
        updateEquipment,
        addEquipment,
        updateEquipmentBatch,
        logout,
        bookings
    } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [done, setDone] = useState(false);
    const [savedName, setSavedName] = useState("");
    const [savedCount, setSavedCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const pendingCount = bookings.filter(b => b.status === "Pending").length;

    // Facility State
    const [fac, setFac] = useState({
        facilityName: "", facilityCategory: "", spaceDescription: "", capacity: 0 as number, roomLocation: "",
        availabilityStatus: "Available" as "Available" | "Limited" | "Unavailable",
    });
    const [featInput, setFeatInput] = useState("");
    const [features, setFeatures] = useState<string[]>([]);
    const [facErrors, setFacErrors] = useState<Record<string, string>>({});

    // Equipment List State
    const [equipments, setEquipments] = useState<EquipmentState[]>([]);
    const [availableEqCats, setAvailableEqCats] = useState<string[]>([]);
    const [loadingText, setLoadingText] = useState("Saving...");

    useEffect(() => {
        if (fac.facilityCategory) {
            getEquipmentCategories(fac.facilityCategory).then(cats => {
                if (cats.length > 0) {
                    setAvailableEqCats(cats);
                } else {
                    setAvailableEqCats((categoryMap[fac.facilityCategory] || []).filter(Boolean));
                }
            });
        } else {
            setAvailableEqCats([]);
        }
    }, [fac.facilityCategory]);

    useEffect(() => {
        if (isEditMode && facilities.length > 0) {
            const facility = facilities.find(f => String(f.id) === id);
            if (facility) {
                setFac({
                    facilityName: facility.facilityName,
                    facilityCategory: facility.facilityCategory,
                    spaceDescription: facility.spaceDescription,
                    capacity: facility.capacity,
                    roomLocation: facility.roomLocation,
                    availabilityStatus: facility.availabilityStatus,
                });
                setFeatures(facility.keyFacilityFeatures);

                // Load associated equipment
                const associated = equipment.filter(e => String(e.facilityId) === id);
                if (associated.length > 0) {
                    setEquipments(associated.map(e => ({
                        id: e.id,
                        dbId: e.id,
                        equipmentName: e.equipmentName,
                        equipmentCategory: e.equipmentCategory,
                        manufacturer: e.manufacturer,
                        modelNumber: e.modelNumber,
                        initialStatus: e.initialStatus,
                        instrumentDescription: e.instrumentDescription,
                        specInput: "",
                        technicalSpecifications: e.technicalSpecifications,
                        appInput: "",
                        researchApplications: e.researchApplications,
                        expanded: false,
                        errors: {},
                    })));
                }
            }
        }
    }, [isEditMode, id, facilities, equipment]);

    const handleFacChange = (k: string, v: any) => {
        if (k === "facilityCategory" && v !== fac.facilityCategory) {
            setEquipments(prev => prev.map(eq => ({ ...eq, equipmentCategory: "" })));
        }
        setFac(prev => ({ ...prev, [k]: v }));
        if (facErrors[k]) setFacErrors(prev => {
            const next = { ...prev };
            delete next[k];
            return next;
        });
    };

    const addFeat = () => {
        const v = featInput.trim();
        if (v && !features.includes(v)) setFeatures([...features, v]);
        setFeatInput("");
    };

    const removeFeat = (v: string) => setFeatures(features.filter(x => x !== v));

    const updateEq = (eqId: string | number, key: string, val: any) => {
        setEquipments(prev => prev.map(e => e.id === eqId ? { ...e, [key]: val } : e));
    };

    const addEq = () => setEquipments(prev => [...prev, createBlankEq()]);
    const removeEq = (eqId: string | number) => setEquipments(prev => prev.filter(e => e.id !== eqId));

    const validate = () => {
        const fErrs: Record<string, string> = {};
        if (!fac.facilityName.trim()) fErrs.facilityName = "Required";
        if (!fac.facilityCategory) fErrs.facilityCategory = "Required";
        if (!fac.spaceDescription.trim()) fErrs.spaceDescription = "Required";
        if (!fac.capacity) fErrs.capacity = "Required";
        if (!fac.roomLocation.trim()) fErrs.roomLocation = "Required";

        let hasEqErrs = false;
        const updatedEqs = equipments.map(eq => {
            const isTouched = eq.equipmentName.trim() || eq.manufacturer.trim() || eq.modelNumber.trim() || eq.instrumentDescription.trim() || eq.equipmentCategory;
            const eErrs: Record<string, string> = {};
            if (isTouched) {
                if (!eq.equipmentName.trim()) eErrs.equipmentName = "Required";
                if (!eq.equipmentCategory) eErrs.equipmentCategory = "Required";
                if (!eq.manufacturer.trim()) eErrs.manufacturer = "Required";
                if (!eq.modelNumber.trim()) eErrs.modelNumber = "Required";
                if (!eq.instrumentDescription.trim()) eErrs.instrumentDescription = "Required";
            }
            if (Object.keys(eErrs).length > 0) hasEqErrs = true;
            return { ...eq, errors: eErrs, expanded: Object.keys(eErrs).length > 0 ? true : eq.expanded };
        });

        setFacErrors(fErrs);
        setEquipments(updatedEqs);

        return Object.keys(fErrs).length === 0 && !hasEqErrs;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        const filledEqs = equipments.filter(eq => eq.equipmentName.trim() || eq.manufacturer.trim() || eq.modelNumber.trim() || eq.instrumentDescription.trim() || eq.equipmentCategory);
        setLoadingText(`Saving ${fac.facilityName} & ${filledEqs.length} items...`);

        const eqData = filledEqs.map(e => ({
            equipmentName: e.equipmentName,
            equipmentCategory: e.equipmentCategory,
            manufacturer: e.manufacturer,
            modelNumber: e.modelNumber,
            initialStatus: e.initialStatus,
            instrumentDescription: e.instrumentDescription,
            technicalSpecifications: e.technicalSpecifications,
            researchApplications: e.researchApplications,
            facilityId: id || ""
        }));

        if (isEditMode) {
            const updatedFac = { ...fac, keyFacilityFeatures: features };

            // Prepare batch updates for equipment
            const eqUpdates = filledEqs.map(eq => ({
                id: eq.dbId,
                data: {
                    equipmentName: eq.equipmentName,
                    equipmentCategory: eq.equipmentCategory,
                    manufacturer: eq.manufacturer,
                    modelNumber: eq.modelNumber,
                    initialStatus: eq.initialStatus,
                    instrumentDescription: eq.instrumentDescription,
                    technicalSpecifications: eq.technicalSpecifications,
                    researchApplications: eq.researchApplications,
                    facilityId: id!
                } as Equipment
            }));

            // Sync all changes in parallel
            await Promise.all([
                updateFacility(id!, updatedFac),
                updateEquipmentBatch(id!, eqUpdates)
            ]);

            setFac(updatedFac); // Update local state to show change immediately
        } else {
            setLoadingText("Creating facility...");
            await addFacilityWithEquipment({
                ...fac,
                keyFacilityFeatures: features,
                createdAt: new Date().toISOString()
            }, eqData);
        }

        setSavedName(fac.facilityName);
        setSavedCount(filledEqs.length);
        setDone(true);
        setLoading(false);
    };

    const resetForm = () => {
        setFac({ facilityName: "", facilityCategory: "", spaceDescription: "", capacity: 0, roomLocation: "", availabilityStatus: "Available" });
        setFeatures([]);
        setEquipments([]);
        setDone(false);
    };

    if (done) return (
        <SuccessModal
            isEditMode={isEditMode}
            savedName={savedName}
            savedCount={savedCount}
            onReset={resetForm}
        />
    );



    const handleLogout = () => { logout(); navigate("/"); };

    const sidebarItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "bookings", label: "Bookings", icon: CalendarCheck, badge: pendingCount },
        { id: "facilities", label: "Resources", icon: Building2 },
        { id: "users", label: "Users", icon: Users },
    ];

    return (
        <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            {/* Admin Nav */}
            <Navbar>
                <Navbar.Brand icon={Shield} title="Admin Portal" subtitle="R&D Center Management" />
                <Navbar.Actions>
                    <Button size="sm" variant="outline" className="text-gray-600 gap-1.5 border-gray-200 h-8" asChild>
                        <Link to="/"><ChevronRight className="h-4 w-4 rotate-180" />Site</Link>
                    </Button>
                </Navbar.Actions>
            </Navbar>

            <div className="flex-1 overflow-hidden w-full flex bg-white">
                <div className="flex w-full h-full">
                    {/* Sidebar */}
                    <Sidebar>
                        <Sidebar.Nav>
                            <Sidebar.Section title="Management">
                                {sidebarItems.map(({ id, label, icon: Icon, badge }) => (
                                    <Sidebar.Item
                                        key={id}
                                        label={label}
                                        icon={Icon}
                                        isActive={false}
                                        onClick={() => navigate("/admin")}
                                        badge={badge}
                                    />
                                ))}
                            </Sidebar.Section>
                        </Sidebar.Nav>
                        <Sidebar.Profile
                            onSettingsClick={() => navigate("/settings")}
                            onLogoutClick={() => setIsLogoutOpen(true)}
                        />
                    </Sidebar>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                        {/* Page Header */}
                        <div className="shrink-0 px-6 py-4 md:px-8 md:pt-6 md:pb-2 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isEditMode ? "Edit Facility & Equipment" : "Add New Facility & Equipment"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {isEditMode ? "Update details for this facility and its equipment" : "Register a new facility and add its equipment"}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" className="text-slate-500 hover:bg-slate-200/50" onClick={() => navigate("/admin", { state: { activeTab: "facilities" } })}>Cancel</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Clock className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                            {loadingText}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-3.5 w-3.5 mr-1.5" />
                                            {isEditMode ? "Save Changes" : "Save All"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Split Content */}
                        <main className="flex flex-1 overflow-hidden p-6 md:p-8">
                            <div className="flex w-full bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden max-w-7xl mx-auto">
                                <FacilityForm
                                    isEditMode={isEditMode}
                                    fac={fac}
                                    handleFacChange={handleFacChange}
                                    facErrors={facErrors}
                                    featInput={featInput}
                                    setFeatInput={setFeatInput}
                                    features={features}
                                    addFeat={addFeat}
                                    removeFeat={removeFeat}
                                />

                                <div className="w-px bg-slate-100 shrink-0" />

                                <EquipmentForm
                                    equipments={equipments}
                                    updateEq={updateEq}
                                    removeEq={removeEq}
                                    addEq={addEq}
                                    availableEqCats={availableEqCats}
                                />
                            </div>
                        </main>

                        {/* Sticky Status Bar */}
                        <div className="shrink-0 p-4 flex items-center z-20">
                            <div className="flex items-center gap-6 text-xs text-slate-400 font-medium px-4">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", fac.facilityName ? "bg-emerald-500" : "bg-slate-300")} />
                                    Facility Data
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", equipments.length > 0 ? "bg-blue-500" : "bg-slate-300")} />
                                    {equipments.length} Equipment Items
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LogoutModal
                open={isLogoutOpen}
                onOpenChange={setIsLogoutOpen}
                onConfirm={handleLogout}
            />
        </div>
    );
}

