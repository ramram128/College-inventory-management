import { useState, useEffect } from "react";
import { Calendar, Clock, User, Mail, Building, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Pencil, X, Upload } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router";
import { auth } from "../../firebase";
import { sendEmailVerification } from "firebase/auth";

const timeSlots = [
  "08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00",
  "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00",
];

export function BookingPage() {
  const { facilities, equipment: equipmentList, addBooking, currentUser, users } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as {
    equipment?: string; equipCategory?: string; equipFacility?: string;
    facility?: string; type?: string;
  } | null;

  const userProfile = currentUser && currentUser.id !== "admin"
    ? users.find((u) => String(u.id) === String(currentUser.id))
    : null;

  const bookingType = routeState?.type === "facility" ? "facility" : "equipment";

  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSentMsg, setEmailSentMsg] = useState("");
  const [persons, setPersons] = useState(1);
  const [extraPersons, setExtraPersons] = useState<{ name: string; email: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    type: bookingType,
    facility: routeState?.facility ?? "",
    equipFacility: routeState?.equipFacility ?? "",
    equipCategory: routeState?.equipCategory ?? "",
    equipment: routeState?.equipment ?? "",
    quantity: 1,
    date: "", timeSlot: "", purpose: "",
  });

  // Update extraPersons array when persons count changes
  useEffect(() => {
    const extra = Math.max(0, persons - 1);
    setExtraPersons((prev) => {
      if (extra > prev.length) return [...prev, ...Array(extra - prev.length).fill({ name: "", email: "" })];
      return prev.slice(0, extra);
    });
  }, [persons]);

  // Auto-fill user details on mount / whenever login state changes
  useEffect(() => {
    const profile = currentUser && currentUser.id !== "admin"
      ? users.find((u) => String(u.id) === String(currentUser.id))
      : null;

    // Find facility for the equipment if not already provided
    const equipCat = routeState?.equipCategory ?? "";
    const equipName = routeState?.equipment ?? "";
    let resolvedFacility = routeState?.equipFacility ?? "";
    if (!resolvedFacility && (equipCat || equipName)) {
      // Find facility whose features include the equipment category
      const match = facilities.find((f) =>
        (f.keyFacilityFeatures || []).some((feat) => feat.toLowerCase() === equipCat.toLowerCase())
      );
      if (match) resolvedFacility = match.facilityName;
    }

    // Ensure we always have a name if they are logged in.
    const defaultName = userProfile 
        ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() 
        : (currentUser?.name && currentUser.name !== "user" ? currentUser.name : "");

    const defaultDept = profile ? `${profile.department}${profile.institution ? `, ${profile.institution}` : ''}` : "";

    setFormData((prev) => ({
      ...prev,
      ...(defaultName ? { name: defaultName } : {}),
      ...(currentUser ? { email: currentUser.email } : {}),
      ...(defaultDept ? { department: defaultDept } : {}),
      ...(resolvedFacility ? { equipFacility: resolvedFacility } : {}),
    }));
  }, [currentUser?.id, currentUser?.name, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.department) {
      setErrorMsg("Missing personal details. Please ensure your name and department are loaded or filled in.");
      return;
    }

    if (currentUser && !currentUser.emailVerified) {
      setErrorMsg("You must verify your email address before submitting a booking request.");
      return;
    }

    if (formData.type === "facility" && !formData.facility) {
      setErrorMsg("Please select a facility.");
      return;
    }
    if (formData.type === "equipment" && (!formData.equipFacility || !formData.equipCategory || !formData.equipment)) {
      setErrorMsg("Please ensure facility, category, and equipment are all selected.");
      return;
    }
    if (!formData.date) {
      setErrorMsg("Please select a preferred date.");
      return;
    }
    if (!formData.timeSlot) {
      setErrorMsg("Please select a preferred time slot.");
      return;
    }
    if (!formData.purpose.trim()) {
      setErrorMsg("Please provide a research purpose.");
      return;
    }

    setSubmitting(true);
    try {
      const id = await addBooking({
        name: formData.name, email: formData.email, department: formData.department,
        userId: currentUser?.id,
        type: formData.type, facility: formData.facility, equipment: formData.equipment,
        date: formData.date, timeSlot: formData.timeSlot, purpose: formData.purpose,
        persons: formData.type === "facility" ? persons : undefined,
        quantity: formData.type === "equipment" ? formData.quantity : undefined,
      });
      setBookingId(id);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ name: "", email: "", department: "", type: "equipment", facility: "", equipFacility: "", equipCategory: "", equipment: "", quantity: 1, date: "", timeSlot: "", purpose: "" });
    navigate("/my-bookings");
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setResendingEmail(true);
    setEmailSentMsg("");
    setErrorMsg("");
    try {
      await sendEmailVerification(auth.currentUser);
      setEmailSentMsg("Verification email sent! Please check your inbox and refresh this page after verifying.");
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to resend verification email.");
    } finally {
      setResendingEmail(false);
    }
  };

  // The submitted dialog is now rendered as a modal at the end of the return statement.

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Request Facility Access</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Submit a request to access our research facilities and equipment. We'll review your application and get back to you shortly.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Access Request Form</CardTitle>
              <CardDescription>Please fill out all required fields to submit your request</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser && !currentUser.emailVerified && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl relative">
                   <div className="flex gap-3">
                     <div className="mt-0.5"><Mail className="h-5 w-5 text-amber-600" /></div>
                     <div>
                       <h3 className="text-sm font-bold text-amber-900">Email Verification Required</h3>
                       <p className="text-sm text-amber-700 mt-1">
                         To submit a booking request, please click the link we sent to <strong>{currentUser.email}</strong> to verify your account.
                         If you have already verified, please refresh this page.
                       </p>
                       <div className="mt-3 flex items-center gap-2">
                         <Button variant="outline" size="sm" className="bg-white border-amber-300 hover:bg-amber-100 text-amber-800" onClick={handleResendVerification} disabled={resendingEmail}>
                           {resendingEmail ? "Sending..." : "Resend Email"}
                         </Button>
                         {emailSentMsg && <span className="text-xs font-semibold text-emerald-600">{emailSentMsg}</span>}
                       </div>
                     </div>
                   </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" placeholder="John Doe" value={formData.name}
                        readOnly={!!currentUser}
                        className={currentUser ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""}
                        onChange={(e) => !currentUser && setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="john.doe@university.edu"
                        readOnly={!!currentUser}
                        className={currentUser ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""}
                        value={formData.email} onChange={(e) => !currentUser && setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department/Organization *</Label>
                    <Input id="department" placeholder="e.g., Chemistry Department, XYZ University"
                      readOnly={!!currentUser}
                      className={currentUser ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""}
                      value={formData.department} onChange={(e) => !currentUser && setFormData({ ...formData, department: e.target.value })} />
                  </div>
                </div>

                {/* Access Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Access Details</h3>

                  {/* ── FACILITY FLOW ── */}
                  {formData.type === "facility" && (
                    <div className="space-y-4">
                      {/* Facility select */}
                      <div className="space-y-2">
                        <Label htmlFor="facility">Facility *</Label>
                        <Select value={formData.facility} onValueChange={(v) => setFormData({ ...formData, facility: v })}>
                          <SelectTrigger id="facility"><SelectValue placeholder="Select a facility" /></SelectTrigger>
                          <SelectContent>
                            {facilities.filter((f) => f.availabilityStatus !== "Unavailable").map((f) => (
                              <SelectItem key={f.id} value={f.facilityName}>{f.facilityName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Number of persons */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Number of Persons *</Label>
                          <p className="text-xs text-gray-400 mt-0.5">Including yourself</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button"
                            onClick={() => setPersons((p) => Math.max(1, p - 1))}
                            disabled={persons <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 transition-colors disabled:opacity-40"
                          >−</button>
                          <input type="number" min={1} value={persons}
                            onChange={(e) => setPersons(Math.max(1, Number(e.target.value)))}
                            className="w-14 text-center border border-gray-300 rounded-lg h-8 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button type="button"
                            onClick={() => setPersons((p) => p + 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 transition-colors"
                          >+</button>
                        </div>
                      </div>

                      {/* Extra persons details */}
                      {extraPersons.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Additional Persons Details</h4>
                          {extraPersons.map((p, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Person {i + 2}</p>
                              <div className="grid md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label htmlFor={`ep-name-${i}`}>Full Name *</Label>
                                  <Input id={`ep-name-${i}`} required placeholder="Full name" value={p.name}
                                    onChange={(e) => setExtraPersons((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`ep-email-${i}`}>Email *</Label>
                                  <Input id={`ep-email-${i}`} type="email" required placeholder="email@example.com" value={p.email}
                                    onChange={(e) => setExtraPersons((prev) => prev.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── EQUIPMENT FLOW ── */}
                  {formData.type === "equipment" && (
                    <div className="space-y-3">
                      {/* Step 1: Facility */}
                      <div className="space-y-2">
                        <Label htmlFor="equipFacility">Facility *</Label>
                        <Select
                          value={formData.equipFacility}
                          onValueChange={(v) => setFormData({ ...formData, equipFacility: v, equipCategory: "", equipment: "" })}
                        >
                          <SelectTrigger id="equipFacility"><SelectValue placeholder="Select a facility" /></SelectTrigger>
                          <SelectContent>
                            {facilities.filter((f) => f.availabilityStatus !== "Unavailable").map((f) => (
                              <SelectItem key={f.id} value={f.facilityName}>{f.facilityName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Step 2: Equipment Category (from facility features) */}
                      {formData.equipFacility && (() => {
                        const selectedFacility = facilities.find((f) => f.facilityName === formData.equipFacility);
                        const categories = selectedFacility?.keyFacilityFeatures ?? [];
                        return (
                          <div className="space-y-2">
                            <Label htmlFor="equipCategory">Equipment Category *</Label>
                            <Select
                              value={formData.equipCategory}
                              onValueChange={(v) => setFormData({ ...formData, equipCategory: v, equipment: "" })}
                            >
                              <SelectTrigger id="equipCategory"><SelectValue placeholder="Select a category" /></SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })()}

                      {/* Step 3: Equipment (filtered by category) */}
                      {formData.equipCategory && (() => {
                        const filtered = equipmentList.filter(
                          (e) =>
                            e.initialStatus === "Available" &&
                            ((e.equipmentCategory || "").toLowerCase() === formData.equipCategory.toLowerCase() ||
                              (e.equipmentName || "").toLowerCase().includes(formData.equipCategory.toLowerCase()))
                        );
                        return (
                          <div className="space-y-2">
                            <Label htmlFor="equipment">Select Equipment *</Label>
                            <Select
                              value={formData.equipment}
                              onValueChange={(v) => setFormData({ ...formData, equipment: v })}
                            >
                              <SelectTrigger id="equipment"><SelectValue placeholder="Choose equipment" /></SelectTrigger>
                              <SelectContent>
                                {filtered.length > 0 ? (
                                  filtered.map((item) => (
                                    <SelectItem key={item.id} value={item.equipmentName}>{item.equipmentName}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="__none" disabled>No available equipment in this category</SelectItem>
                                )}
                              </SelectContent>
                            </Select>

                            {/* Quantity Counter */}
                            <div className="flex items-center justify-between pt-1">
                              <Label htmlFor="quantity">Quantity</Label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormData((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                                  className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 transition-colors disabled:opacity-40"
                                  disabled={formData.quantity <= 1}
                                >−</button>
                                <input
                                  id="quantity"
                                  type="number"
                                  min={1}
                                  value={formData.quantity}
                                  onChange={(e) => setFormData((p) => ({ ...p, quantity: Math.max(1, Number(e.target.value)) }))}
                                  className="w-14 text-center border border-gray-300 rounded-lg h-8 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setFormData((p) => ({ ...p, quantity: p.quantity + 1 }))}
                                  className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 transition-colors"
                                >+</button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date *</Label>
                    <Input id="date" type="date" value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Preferred Time Slot *</Label>
                    <Select value={formData.timeSlot} onValueChange={(v) => setFormData({ ...formData, timeSlot: v })}>
                      <SelectTrigger id="timeSlot"><SelectValue placeholder="Select time slot" /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="purpose">Research Purpose *</Label>
                  <Textarea id="purpose" rows={4}
                    placeholder="Please describe your research purpose and how you plan to use the facility/equipment..."
                    value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
                </div>

                {errorMsg && (
                  <div className="bg-red-100 text-red-700 border-2 border-red-300 p-4 rounded-xl text-sm font-bold animate-shake">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg" 
                  disabled={submitting || (!!currentUser && !currentUser.emailVerified)}
                >
                  {submitting ? "Processing..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Modal */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Request Submitted!</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Your request is submitted. The Admin will accept or reject your request within 24 hours.<br/><br/>
                  <strong className="text-gray-700">(Please check your registered email for further updates)</strong>
                </p>
              </div>
              <div className="pt-4">
                <Button onClick={resetForm} className="w-full bg-blue-600 hover:bg-blue-700">
                  Got it, thanks!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}