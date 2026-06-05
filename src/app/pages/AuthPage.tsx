import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff, Shield, LogIn, Briefcase, GraduationCap, Beaker, Tag, Microscope, Package, Users, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { useAppContext } from "../context/AppContext";
import { AuthLayout } from "../components/AuthLayout";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import React from 'react';

export function AuthPage() {
    const navigate = useNavigate();
    const { login, registerUser, currentUser } = useAppContext();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        institution: "",
        department: "",
        role: "",
        researchInterests: [] as string[]
    });

    const [errors, setErrors] = useState<Partial<typeof form>>({});

    const roles = [
        "Principal Investigator",
        "Professor",
        "Associate Professor",
        "Post Doctoral Researcher",
        "PhD Student",
        "Graduate Researcher",
        "Undergraduate Student",
        "Industry Researcher",
        "Visiting Scholar"
    ];

    const allInterests = [
        "Analytical Chemistry",
        "Materials Science",
        "Molecular Biology",
        "Cell Biology",
        "Electrochemistry",
        "Nanotechnology",
        "Biotechnology",
        "Electronics",
        "High-Performance Computing",
        "Physics"
    ];

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'admin') navigate("/admin");
            else navigate("/");
        }
    }, [currentUser, navigate]);

    const validate = () => {
        const newErrors: Partial<typeof form> = {};
        if (!form.email) newErrors.email = "Email is required";
        if (!form.password) newErrors.password = "Password is required";
        if (!isLoginMode) {
            if (!form.firstName) newErrors.firstName = "First name is required";
            if (!form.lastName) newErrors.lastName = "Last name is required";
            if (!form.role) newErrors.role = "Role is required";
            if (!form.institution) newErrors.institution = "Institution is required";
            if (!form.department) newErrors.department = "Department is required";
            if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
            if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setServerError("");
        const result = await login(form.email, form.password);
        setLoading(false);
        if (result.success) {
            if (form.email === "clginventorymanagement@gmail.com") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } else {
            setServerError(result.error || "Invalid email or password.");
        }
    };

    const handleRegisterSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setServerError("");
        const { confirmPassword, ...userData } = form;
        const result = await registerUser(userData);
        setLoading(false);
        if (result.success) {
            setSubmitted(true);
        } else {
            setServerError(result.error || "Registration failed. Please try again.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoginMode) handleLoginSubmit();
        else handleRegisterSubmit();
    };

    const toggleInterest = (interest: string) => {
        setForm(prev => {
            const interests = prev.researchInterests.includes(interest)
                ? prev.researchInterests.filter(i => i !== interest)
                : [...prev.researchInterests, interest];
            return { ...prev, researchInterests: interests };
        });
    };

    const fillAdmin = () => {
        setForm(prev => ({ ...prev, email: "clginventorymanagement@gmail.com", password: "password1234@mce" }));
        setErrors({});
        setServerError("");
    };

    const fillDemo = () => {
        setForm(prev => ({ ...prev, email: "s.chen@mit.edu", password: "pass1234" }));
        setErrors({});
        setServerError("");
    };

    const switchMode = () => {
        setIsLoginMode(!isLoginMode);
        setErrors({});
        setServerError("");
    };

    if (submitted && !isLoginMode) {
        return (
            <AuthLayout>
                <Card className="border-none shadow-none bg-transparent text-center space-y-6">
                    <CardHeader>
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold">Welcome Aboard!</CardTitle>
                        <CardDescription className="text-lg">
                            Hi {form.firstName}! Your account is active and ready to go.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-green-50/50 rounded-2xl p-6 text-left border border-green-100 space-y-4">
                            <p className="font-bold text-green-900">You're all set!</p>
                            <ul className="space-y-3 font-medium text-sm text-green-800">
                                <li className="flex items-center gap-2">✅ Access 50+ research facilities</li>
                                <li className="flex items-center gap-2">✅ Book equipment instantly</li>
                                <li className="flex items-center gap-2">✅ Collaborate with researchers worldwide</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <Button className="w-full h-12 bg-blue-600 font-bold rounded-xl" onClick={() => { setSubmitted(false); setIsLoginMode(true); }}>Continue to Sign In</Button>
                            <Button variant="ghost" className="w-full font-bold text-gray-500" onClick={() => navigate("/")}>Go to Home</Button>
                        </div>
                    </CardContent>
                </Card>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <Card className="flex flex-col md:flex-row min-h-[600px] max-w-6xl w-full mx-auto overflow-hidden shadow-2xl border-0">
                {/* Left Side: Info Panel */}
                <div className="hidden md:flex md:w-5/12 bg-blue-700 p-10 flex-col justify-between text-white relative">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-600 blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-800 blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-blue-400">
                                <Microscope className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-white text-xl">MAHENDRA</div>
                                <div className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">Research & Development Hub</div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold mb-6 leading-tight">Welcome Back to the Research Hub</h1>
                        <p className="text-blue-100 text-lg mb-12 leading-relaxed">
                            Access world-class research facilities, manage equipment bookings, and collaborate with researchers worldwide.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600/50 flex items-center justify-center shrink-0 border border-blue-500/30">
                                    <Microscope className="w-5 h-5 text-blue-100" />
                                </div>
                                <span className="font-semibold text-blue-50 text-sm">50+ Research Facilities</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600/50 flex items-center justify-center shrink-0 border border-blue-500/30">
                                    <Package className="w-5 h-5 text-blue-100" />
                                </div>
                                <span className="font-semibold text-blue-50 text-sm">200+ Equipment Units</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600/50 flex items-center justify-center shrink-0 border border-blue-500/30">
                                    <Users className="w-5 h-5 text-blue-100" />
                                </div>
                                <span className="font-semibold text-blue-50 text-sm">1,000+ Active Researchers</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600/50 flex items-center justify-center shrink-0 border border-blue-500/30">
                                    <Calendar className="w-5 h-5 text-blue-100" />
                                </div>
                                <span className="font-semibold text-blue-50 text-sm">24/7 Access Available</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 text-[10px] font-bold text-blue-300 flex items-center gap-3">
                        <span>Trusted by 50+ Global Institutions</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>ISO 27001 Certified System</span>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">{isLoginMode ? "Sign In" : "Register"}</h2>
                            <p className="text-sm text-gray-500 mt-2 font-medium">
                                {isLoginMode ? "Access your researcher dashboard" : "Fields marked * are required."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {serverError && (
                                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 font-medium text-center">
                                    {serverError}
                                </div>
                            )}

                            {isLoginMode ? (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Email Address <span className="text-red-500">*</span></Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input
                                                type="email" placeholder="john.doe@edu"
                                                className="pl-10 h-11 bg-gray-50/50 border-gray-200 rounded-xl"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                        {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Password <span className="text-red-500">*</span></Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input
                                                type={showPassword ? "text" : "password"} placeholder="••••••••"
                                                className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 rounded-xl"
                                                value={form.password}
                                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{errors.password}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Section: Personal Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                                            <User className="h-4 w-4" />
                                            <span className="text-sm">Personal Information</span>
                                        </div>
                                        <Separator className="bg-gray-100" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-500">First Name <span className="text-red-500">*</span></Label>
                                                <Input placeholder="John" className="h-10 bg-gray-50/50 rounded-lg" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                                                {errors.firstName && <p className="text-[10px] text-red-500 font-bold">{errors.firstName}</p>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-500">Last Name <span className="text-red-500">*</span></Label>
                                                <Input placeholder="Doe" className="h-10 bg-gray-50/50 rounded-lg" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                                                {errors.lastName && <p className="text-[10px] text-red-500 font-bold">{errors.lastName}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-500">Email Address <span className="text-red-500">*</span></Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                                                <Input placeholder="john.doe@university.edu" className="pl-10 h-10 bg-gray-50/50 rounded-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                            </div>
                                            {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-500">Phone Number <span className="text-gray-400 text-[10px] font-medium ml-1">(optional)</span></Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input placeholder="+1 (555) 000 0000" className="pl-10 h-10 bg-gray-50/50 rounded-lg" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Security */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                                            <Lock className="h-4 w-4" />
                                            <span className="text-sm">Security</span>
                                        </div>
                                        <Separator className="bg-gray-100" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5 font-bold">
                                                <Label className="text-xs text-gray-500">Password <span className="text-red-500">*</span></Label>
                                                <div className="relative group font-normal">
                                                    <Input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" className="h-10 bg-gray-50/50 rounded-lg pr-9" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
                                            </div>
                                            <div className="space-y-1.5 font-bold">
                                                <Label className="text-xs text-gray-500">Confirm Password <span className="text-red-500">*</span></Label>
                                                <div className="relative group font-normal">
                                                    <Input type={showConfirm ? "text" : "password"} placeholder="Repeat password" className="h-10 bg-gray-50/50 rounded-lg pr-9" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {errors.confirmPassword && <p className="text-[10px] text-red-500">{errors.confirmPassword}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Affiliation */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                                            <GraduationCap className="h-4 w-4" />
                                            <span className="text-sm">Affiliation</span>
                                        </div>
                                        <Separator className="bg-gray-100" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-500">Institution <span className="text-red-500">*</span></Label>
                                                <Input placeholder="e.g., MIT, Stanford" className="h-10 bg-gray-50/50 rounded-lg" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
                                                {errors.institution && <p className="text-[10px] text-red-500 font-bold">{errors.institution}</p>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-500">Department <span className="text-red-500">*</span></Label>
                                                <Input placeholder="e.g., Chemistry" className="h-10 bg-gray-50/50 rounded-lg" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                                                {errors.department && <p className="text-[10px] text-red-500 font-bold">{errors.department}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-500">Role / Position <span className="text-red-500">*</span></Label>
                                            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                                                <SelectTrigger className="h-10 bg-gray-50/50 rounded-lg">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {errors.role && <p className="text-[10px] text-red-500 font-bold">{errors.role}</p>}
                                        </div>
                                    </div>

                                    {/* Section: Research Interests */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                                            <Beaker className="h-4 w-4" />
                                            <span className="text-sm">Research Interests <span className="text-gray-400 text-[10px] font-medium ml-1">(optional)</span></span>
                                        </div>
                                        <Separator className="bg-gray-100" />
                                        <div className="flex flex-wrap gap-2">
                                            {allInterests.map(interest => (
                                                <Badge
                                                    key={interest}
                                                    variant={form.researchInterests.includes(interest) ? "default" : "outline"}
                                                    className={`cursor-pointer transition-all h-8 rounded-lg font-medium ${form.researchInterests.includes(interest) ? "bg-blue-600 hover:bg-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                                                    onClick={() => toggleInterest(interest)}
                                                >
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="space-y-4">
                                {!isLoginMode && (
                                    <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                                        By registering, you agree to the R&D Center's{" "}
                                        <button type="button" className="text-blue-600 font-bold hover:underline">Terms of Use</button> and{" "}
                                        <button type="button" className="text-blue-600 font-bold hover:underline">Safety Policies</button>.
                                    </p>
                                )}
                                <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white mt-4 shadow-md shadow-blue-500/20">
                                    {loading ? "Processing..." : (isLoginMode ? "Sign In" : "Create Account")}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 text-center border-t border-gray-100 pt-6">
                            <p className="text-xs font-bold text-gray-500">
                                {isLoginMode ? "New to the portal?" : "Already a member?"}{" "}
                                <button onClick={switchMode} className="text-blue-600 hover:text-blue-700 font-extrabold hover:underline underline-offset-4">
                                    {isLoginMode ? "Create an account" : "Sign In"}
                                </button>
                            </p>
                            {isLoginMode && (
                                <p className="text-[10px] mt-2 font-bold text-gray-400">View Public Facilities</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </AuthLayout>
    );
}
