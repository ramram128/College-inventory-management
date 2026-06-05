import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Lock, Phone, Plus, Save, CreditCard, Building2, Briefcase, BadgeCheck, ShieldAlert, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAppContext } from "../context/AppContext";

export function SettingsContent({ onBack }: { onBack?: () => void } = {}) {
    const navigate = useNavigate();
    const { currentUser, updateUserProfile, users } = useAppContext();
    const [name, setName] = useState(currentUser?.name || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [profilePic, setProfilePic] = useState(currentUser?.profilePic || "");
    const [institution, setInstitution] = useState("");
    const [department, setDepartment] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            setProfilePic(currentUser.profilePic || "");

            const fullUser = users.find(u => u.id === currentUser.id);
            if (fullUser) {
                setPhone(fullUser.phone || "");
                setInstitution(fullUser.institution || "");
                setDepartment(fullUser.department || "");
                setRole(fullUser.role || "");
                setStatus(fullUser.status || "");
            } else if (currentUser.id === "admin") {
                // Admin specific fallback
                setPhone("+1 (555) 000-0000");
                setPassword("password1234@mce");
                setInstitution("MCE R&D Center");
                setDepartment("Administration");
                setRole("Super Admin");
                setStatus("Active");
            }
        }
    }, [currentUser, users]);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate network delay
        setTimeout(() => {
            updateUserProfile({
                name,
                email,
                phone,
                password,
                profilePic
            });
            setIsSaving(false);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-transparent max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <button
                        onClick={onBack ? onBack : () => navigate('/admin')}
                        className="-ml-2 p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-900 mt-[2px]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">
                        Account Settings
                    </h1>
                </div>
                <p className="text-sm text-gray-500 ml-10">
                    Update your profile information and security preferences.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6">
                    <div className="flex flex-col gap-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 ml-1">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 ml-1">Email Address</Label>
                                <div className="relative group grayscale">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        value={email}
                                        disabled
                                        className="pl-11 h-12 bg-slate-100 border-slate-200 rounded-xl cursor-not-allowed opacity-70"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium ml-1 italic">Email cannot be changed directly</p>
                            </div>

                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 ml-1">Phone Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="pass" className="text-sm font-medium text-gray-700 ml-1">Password</Label>
                                <div className="relative group grayscale">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="pass"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        disabled
                                        className="pl-11 pr-11 h-12 bg-slate-100 border-slate-200 rounded-xl cursor-not-allowed opacity-70"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:cursor-pointer p-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-gray-400 font-medium ml-1 italic">Password cannot be changed here</p>
                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        Reset password
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="institution" className="text-sm font-medium text-gray-700 ml-1">Institution</Label>
                                <div className="relative group grayscale">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="institution"
                                        value={institution}
                                        disabled
                                        className="pl-11 h-12 bg-slate-100 border-slate-200 rounded-xl cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="department" className="text-sm font-medium text-gray-700 ml-1">Department</Label>
                                <div className="relative group grayscale">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="department"
                                        value={department}
                                        disabled
                                        className="pl-11 h-12 bg-slate-100 border-slate-200 rounded-xl cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="role" className="text-sm font-medium text-gray-700 ml-1">Role</Label>
                                <div className="relative group grayscale">
                                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="role"
                                        value={role}
                                        disabled
                                        className="pl-11 h-12 bg-slate-100 border-slate-200 rounded-xl cursor-not-allowed opacity-70 capitalize"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="status" className="text-sm font-medium text-gray-700 ml-1">Account Status</Label>
                                <div className="relative group grayscale">
                                    <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="status"
                                        value={status}
                                        disabled
                                        className="pl-11 h-12 bg-slate-100 border-slate-200 rounded-xl cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-end gap-4">
                    <Button
                        variant="outline"
                        className="h-10 text-gray-600"
                        onClick={() => {
                            setName(currentUser?.name || "");
                            setProfilePic(currentUser?.profilePic || "");
                            const fullUser = users.find(u => u.id === currentUser?.id);
                            if (fullUser) {
                                setPhone(fullUser.phone || "");
                            }
                        }}
                    >
                        Reset Changes
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Profile
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function SettingsPage() {
    return <SettingsContent />;
}
