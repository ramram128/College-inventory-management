import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import {
  LayoutDashboard, CalendarCheck, FlaskConical, Building2, Users,
  PackagePlus, PlusCircle, CheckCircle, XCircle, Clock, Trash2,
  Search, Shield, Activity, ChevronRight, LogOut, ToggleLeft, ToggleRight, Filter,
  LucideIcon, Settings, User, PencilLine, Package, Printer, FileSpreadsheet, Download,
  FolderKanban, Plus, Pencil, Play, X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useAppContext } from "../../context/AppContext";
import type { Booking, Equipment, Facility, AppUser, ResearchProject } from "../../context/AppContext";
import { LogoutModal } from "../../components/LogoutModal";
import { Modal } from "../../components/Modal";
import { ensureDefaultData } from "../../services/seedFirestore";
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

import { SettingsContent } from "../SettingsPage";


type Section = "dashboard" | "bookings" | "equipment" | "facilities" | "research-projects" | "users" | "settings" | "usage";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
    Available: "bg-green-100 text-green-800 border-green-200",
    "In Use": "bg-orange-100 text-orange-800 border-orange-200",
    Maintenance: "bg-red-100 text-red-800 border-red-200",
    Active: "bg-green-100 text-green-800 border-green-200",
    Inactive: "bg-gray-100 text-gray-600 border-gray-200",
    Limited: "bg-amber-100 text-amber-800 border-amber-200",
    Unavailable: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardSection({ setSection }: { setSection: (s: Section) => void }) {
  const { equipment, facilities, bookings, users, seedingStatus } = useAppContext();
  const [syncStatus, setSyncStatus] = useState("");
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const approved = bookings.filter((b) => b.status === "Approved").length;
  const available = equipment.filter((e) => e.initialStatus === "Available").length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const recent = [...bookings].sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || "")).slice(0, 5);

  const handleSyncLabData = async () => {
    setSyncStatus("syncing");
    try {
      await ensureDefaultData();
      setSyncStatus("success");
      setTimeout(() => setSyncStatus(""), 4000);
    } catch (err) {
      console.error("Sync failed:", err);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  const exportAllData = () => {
    const wb = XLSX.utils.book_new();
    
    // Bookings
    const wsBookings = XLSX.utils.json_to_sheet(bookings.map(b => ({
      ID: b.id, Name: b.name, Email: b.email, Type: b.type, 
      Facility: b.facility || '', Equipment: b.equipment || '',
      Persons: b.persons || '', Quantity: b.quantity || '',
      Date: b.date, TimeSlot: b.timeSlot, SubmittedAt: b.submittedAt, Status: b.status
    })));
    XLSX.utils.book_append_sheet(wb, wsBookings, "Bookings");

    // Equipment
    const wsEquipment = XLSX.utils.json_to_sheet(equipment.map(e => ({
      ID: e.id, Name: e.equipmentName, Category: e.equipmentCategory,
      Manufacturer: e.manufacturer, Model: e.modelNumber,
      FacilityID: e.facilityId, Status: e.initialStatus
    })));
    XLSX.utils.book_append_sheet(wb, wsEquipment, "Equipment");

    // Facilities
    const wsFacilities = XLSX.utils.json_to_sheet(facilities.map(f => ({
      ID: f.id, Name: f.facilityName, Category: f.facilityCategory,
      Location: f.roomLocation, Capacity: f.capacity, Status: f.availabilityStatus,
      Features: (f.keyFacilityFeatures || []).join(', ')
    })));
    XLSX.utils.book_append_sheet(wb, wsFacilities, "Facilities");

    // Users
    const wsUsers = XLSX.utils.json_to_sheet(users.map(u => ({
      ID: u.id, FirstName: u.firstName, LastName: u.lastName, Email: u.email,
      Role: u.role, Institution: u.institution, Department: u.department,
      Status: u.status, JoinedAt: u.joinedAt
    })));
    XLSX.utils.book_append_sheet(wb, wsUsers, "Users");

    XLSX.writeFile(wb, "Complete_Inventory_Data.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Seeding Status / Auto-load Feedback */}
      {seedingStatus && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-3 animate-pulse shadow-sm ${seedingStatus.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : seedingStatus.startsWith("❌") ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
          {seedingStatus.startsWith("Loading") && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
          {seedingStatus}
        </div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={bookings.length} sub={`${approved} approved`} icon={CalendarCheck} color="bg-blue-500" />
        <StatCard label="Pending Approvals" value={pending} sub="awaiting review" icon={Clock} color="bg-amber-500" />
        <StatCard label="Equipment Units" value={equipment.length} sub={`${available} available`} icon={FlaskConical} color="bg-green-500" />
        <StatCard label="Facilities" value={facilities.length} sub="Research Laboratories" icon={Building2} color="bg-purple-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent Booking Requests</CardTitle>
                <CardDescription>Latest 5 access requests</CardDescription>
              </div>
              {pending > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-200">{pending} pending</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recent.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-gray-900 truncate">{b.name}</p>
                        <StatusPill status={b.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {b.type === "facility" ? b.facility : b.type === "equipment" ? b.equipment : "Facility + Equipment"}
                        {" · "}{b.date}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 ml-3 flex-shrink-0 font-mono">{b.id}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="w-full" onClick={() => setSection("bookings")}>
                  View All Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="gap-0">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Resource Overview</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Facilities</p>
              {[
                { label: "Available", count: facilities.filter((f) => f.availabilityStatus === "Available").length, color: "bg-green-500" },
                { label: "Limited", count: facilities.filter((f) => f.availabilityStatus === "Limited").length, color: "bg-amber-500" },
                { label: "Unavailable", count: facilities.filter((f) => f.availabilityStatus === "Unavailable").length, color: "bg-red-500" },
              ].map((item) => (
                <div key={`fac-${item.label}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-sm">{item.count}</span>
                </div>
              ))}
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pt-2 border-t">Equipment</p>
              {[
                { label: "Available", count: equipment.filter((e) => e.initialStatus === "Available").length, color: "bg-green-500" },
                { label: "In Use", count: equipment.filter((e) => e.initialStatus === "In Use").length, color: "bg-orange-500" },
                { label: "Maintenance", count: equipment.filter((e) => e.initialStatus === "Maintenance").length, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-sm">{item.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t space-y-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/admin/add-facility"><PlusCircle className="h-3.5 w-3.5 mr-1.5" />Add Resources</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`w-full text-xs ${
                    syncStatus === "success"
                      ? "text-green-700 border-green-300 bg-green-50"
                      : syncStatus === "error"
                      ? "text-red-700 border-red-300 bg-red-50"
                      : "text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                  }`}
                  onClick={handleSyncLabData}
                  disabled={syncStatus === "syncing"}
                >
                  {syncStatus === "syncing" ? (
                    <><div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1.5" />Syncing...</>
                  ) : syncStatus === "success" ? (
                    <>✅ Lab Data Synced!</>
                  ) : syncStatus === "error" ? (
                    <>❌ Sync Failed</>
                  ) : (
                    <>🔄 Sync Lab Data to Firebase</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                  onClick={exportAllData}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                  Export All Data (Excel)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}

// ── Bookings ──────────────────────────────────────────────────────────────────
function BookingsSection() {
  const { bookings, users, updateBookingStatus } = useAppContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [exportPeriod, setExportPeriod] = useState("all");

  // Confirmation state
  const [confirmModal, setConfirmModal] = useState<{ open: boolean, bookingId: string | null, action: "Approved" | "Rejected" | null }>({
    open: false,
    bookingId: null,
    action: null
  });

  const handleConfirmAction = () => {
    if (confirmModal.bookingId && confirmModal.action) {
      updateBookingStatus(confirmModal.bookingId, confirmModal.action);
    }
    setConfirmModal({ open: false, bookingId: null, action: null });
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return ((b.name || "").toLowerCase().includes(q) || (b.id || "").toLowerCase().includes(q) || (b.email || "").toLowerCase().includes(q))
      && (statusFilter === "All" || b.status === statusFilter);
  }).sort((a, b) => (a.submittedAt || "").localeCompare(b.submittedAt || ""));

  const exportBookings = () => {
    const now = new Date();
    const filterDate = new Date();
    if (exportPeriod === "1week") filterDate.setDate(now.getDate() - 7);
    else if (exportPeriod === "1month") filterDate.setMonth(now.getMonth() - 1);
    else if (exportPeriod === "2month") filterDate.setMonth(now.getMonth() - 2);
    else if (exportPeriod === "3month") filterDate.setMonth(now.getMonth() - 3);
    else if (exportPeriod === "6month") filterDate.setMonth(now.getMonth() - 6);

    const bookingsToExport = bookings.filter(b => {
      if (exportPeriod === "all") return true;
      const bDate = new Date(b.submittedAt);
      return bDate >= filterDate;
    });

    const ws = XLSX.utils.json_to_sheet(bookingsToExport.map(b => ({
      ID: b.id, Name: b.name, Email: b.email, Type: b.type, 
      Facility: b.facility || '', Equipment: b.equipment || '',
      Persons: b.persons || '', Quantity: b.quantity || '',
      Date: b.date, TimeSlot: b.timeSlot, SubmittedAt: b.submittedAt, Status: b.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "Bookings_Data.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Booking Requests</h2>
          <p className="text-sm text-gray-500">{bookings.length} total requests</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Select value={exportPeriod} onValueChange={setExportPeriod}>
            <SelectTrigger className="w-[140px] bg-white h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="1week">Last 1 Week</SelectItem>
              <SelectItem value="1month">Last 1 Month</SelectItem>
              <SelectItem value="2month">Last 2 Months</SelectItem>
              <SelectItem value="3month">Last 3 Months</SelectItem>
              <SelectItem value="6month">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white h-9" onClick={exportBookings}>
            <Download className="h-4 w-4 mr-2 text-emerald-600" />
            Download
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name, ID or email..." className="pl-10"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2 text-gray-400" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-t-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {["Researcher", "Resource", "Date & Time", "Requested Date", "Status", "Actions"].map((h, i, arr) => (
                    <th key={h} className={`${h === "Actions" ? "text-right pr-12 print:hidden" : "text-left"} py-3 px-4 font-medium text-gray-600 ${h === "Resource" ? "hidden md:table-cell" : h === "Date & Time" || h === "Requested Date" ? "hidden lg:table-cell" : ""} ${i === 0 ? "rounded-tl-xl" : ""} ${i === arr.length - 1 ? "rounded-tr-xl" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b: Booking) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs text-blue-600 font-bold mb-0.5">{b.id}</p>
                      <p className="font-medium text-gray-900">{b.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{b.email}</p>
                      {(() => {
                        const user = users.find(u => u.email === b.email);
                        if (user) {
                          return (
                            <div className="flex flex-col gap-0.5 mt-1 pt-1">
                              <span className="text-[10px] text-gray-500 font-medium leading-tight">
                                {user.institution} <span className="opacity-40 px-0.5">•</span> {user.department}
                              </span>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider bg-gray-50 text-gray-600 border-gray-200 w-fit mt-0.5">
                                {user.role}
                              </Badge>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-gray-700 text-xs max-w-40 truncate">
                        {b.type === "facility" ? b.facility : b.type === "equipment" ? b.equipment : "Facility + Equipment"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-gray-400 text-xs capitalize">{b.type}</p>
                        {b.type === 'facility' && b.persons && (
                          <span className="text-blue-600 text-[10px] flex items-center bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-100">
                            <Users className="w-3 h-3 mr-1" />
                            {b.persons} {b.persons === 1 ? 'Person' : 'Persons'}
                          </span>
                        )}
                        {b.type === 'equipment' && b.quantity && (
                          <span className="text-indigo-600 text-[10px] flex items-center bg-indigo-50 px-1.5 py-0.5 rounded font-medium border border-indigo-100">
                            <Package className="w-3 h-3 mr-1" />
                            Qty: {b.quantity}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500">{b.date}<br />{b.timeSlot}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500">
                      {new Date(b.submittedAt).toLocaleDateString()}
                      <br />
                      {!isNaN(new Date(b.submittedAt).getTime()) && b.submittedAt.includes('T') && new Date(b.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4"><StatusPill status={b.status} /></td>
                    <td className="py-3 px-4 print:hidden">
                      <div className="flex justify-end pr-2">
                        <div className="flex items-center gap-3 flex-wrap w-max">
                          {(b.status === "Pending" || b.status === "Approved" || b.status === "Rejected") && (
                            <>
                              {b.status !== "Approved" && (
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600 hover:bg-green-50 text-xs" onClick={() => setConfirmModal({ open: true, bookingId: b.id, action: "Approved" })}>
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                                </Button>
                              )}
                              {b.status !== "Rejected" && (
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600 hover:bg-red-50 text-xs" onClick={() => setConfirmModal({ open: true, bookingId: b.id, action: "Rejected" })}>
                                  <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No bookings match your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal open={confirmModal.open} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, open }))} className="max-w-md">
        <Modal.Header
          title={`Confirm ${confirmModal.action === "Approved" ? "Approval" : "Rejection"}`}
          subtitle={`Are you sure you want to ${confirmModal.action === "Approved" ? "approve" : "reject"} this booking request?`}
          icon={confirmModal.action === "Approved" ? CheckCircle : XCircle}
          onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        />
        <Modal.Content className="text-center py-4">
          <p className="text-sm text-gray-600 mb-2">
            You are about to <strong className={confirmModal.action === "Approved" ? "text-emerald-600" : "text-red-600"}>{confirmModal.action?.toLowerCase()}</strong> the request:
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 inline-block">
            <p className="font-mono text-xs font-bold text-gray-700">{confirmModal.bookingId}</p>
          </div>
        </Modal.Content>
        <Modal.Footer className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            className={`w-full sm:w-auto ${confirmModal.action === "Approved" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            Confirm {confirmModal.action}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ── Equipment ─────────────────────────────────────────────────────────────────
function EquipmentSection() {
  const { equipment, facilities, updateEquipmentStatus, deleteEquipment } = useAppContext();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = equipment.filter((e) =>
    (e.equipmentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.equipmentCategory || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.manufacturer || "").toLowerCase().includes(search.toLowerCase())
  );

  const cycleStatus = (e: Equipment) => {
    const cycle: Equipment["initialStatus"][] = ["Available", "In Use", "Maintenance"];
    updateEquipmentStatus(e.facilityId, e.id, cycle[(cycle.indexOf(e.initialStatus) + 1) % 3]);
  };

  const exportEquipment = () => {
    const ws = XLSX.utils.json_to_sheet(equipment.map(e => ({
      ID: e.id, Name: e.equipmentName, Category: e.equipmentCategory,
      Manufacturer: e.manufacturer, Model: e.modelNumber,
      FacilityID: e.facilityId, Status: e.initialStatus
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment");
    XLSX.writeFile(wb, "Equipment_Data.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Equipment Catalog</h2>
          <p className="text-sm text-gray-500">{equipment.length} instruments registered</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" className="bg-white" onClick={exportEquipment}>
            <Download className="h-4 w-4 mr-2 text-emerald-600" />
            Download
          </Button>
        </div>
      </div>
      <div className="relative print:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search equipment..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Manufacturer / Model</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e: Equipment) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4"><p className="font-medium text-gray-900 max-w-44 truncate">{e.equipmentName}</p></td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs whitespace-nowrap">{e.equipmentCategory}</Badge>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-gray-700">{e.manufacturer}</p>
                      <p className="text-gray-400 text-xs">{e.modelNumber}</p>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500 max-w-36">
                      <span className="truncate block text-slate-700 font-medium">
                        {facilities.find(f => f.id === e.facilityId)?.facilityName || "Unknown Facility"}
                      </span>
                      <span className="truncate block text-[10px] italic">ID: {e.facilityId}</span>
                    </td>
                    <td className="py-3 px-4"><StatusPill status={e.initialStatus} /></td>
                    <td className="py-3 px-4 print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600 hover:bg-blue-50" asChild title="Edit equipment">
                          <Link to={`/admin/edit-equipment/${e.id}`}><PencilLine className="h-4 w-4" /></Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600 hover:bg-blue-50" onClick={() => cycleStatus(e)} title="Cycle status">
                          {e.initialStatus === "Available" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                        {confirmDelete === e.id ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => { deleteEquipment(e.facilityId, e.id); setConfirmDelete(null); }}>Confirm</Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500 hover:bg-red-50" onClick={() => setConfirmDelete(e.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <FlaskConical className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No equipment found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Facilities ────────────────────────────────────────────────────────────────
function FacilitiesSection({ setActiveSection }: { setActiveSection: (s: Section) => void }) {
  const { facilities, equipment, updateFacilityAvailability, deleteFacility, updateEquipmentStatus } = useAppContext();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [availFilter, setAvailFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [eqStatusFilter, setEqStatusFilter] = useState("All");

  const categories = Array.from(new Set(facilities.map(f => f.facilityCategory))).filter(Boolean);

  const filtered = facilities.filter((f) => {
    const matchesSearch = (f.facilityName || "").toLowerCase().includes(search.toLowerCase()) || (f.facilityCategory || "").toLowerCase().includes(search.toLowerCase());
    const matchesAvail = availFilter === "All" || f.availabilityStatus === availFilter;
    const matchesCat = catFilter === "All" || f.facilityCategory === catFilter;

    // For equipment status filter, check if facility has equipment matching that status
    if (eqStatusFilter !== "All") {
      const hasMatchingEq = equipment.some(e => e.facilityId === f.id && e.initialStatus === eqStatusFilter);
      return matchesSearch && matchesAvail && matchesCat && hasMatchingEq;
    }

    return matchesSearch && matchesAvail && matchesCat;
  });

  const exportFacilities = () => {
    const ws = XLSX.utils.json_to_sheet(facilities.map(f => ({
      ID: f.id, Name: f.facilityName, Category: f.facilityCategory,
      Location: f.roomLocation, Capacity: f.capacity, Status: f.availabilityStatus,
      Features: (f.keyFacilityFeatures || []).join(', ')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facilities");
    XLSX.writeFile(wb, "Facilities_Data.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Research Facilities</h2>
          <p className="text-sm text-gray-500">{facilities.length} facilities registered</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" className="bg-white" onClick={exportFacilities}>
            <Download className="h-4 w-4 mr-2 text-emerald-600" />
            Download
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link to="/admin/add-facility"><PlusCircle className="h-4 w-4 mr-2" />Add Resources</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center print:hidden">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search facilities..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={availFilter} onValueChange={setAvailFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2 text-gray-400" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Limited">Limited</SelectItem>
            <SelectItem value="Unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2 text-gray-400" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={eqStatusFilter} onValueChange={setEqStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2 text-gray-400" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Equipment</SelectItem>
            <SelectItem value="Available">Equip: Available</SelectItem>
            <SelectItem value="In Use">Equip: In Use</SelectItem>
            <SelectItem value="Maintenance">Equip: Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="w-full sm:w-auto ml-auto text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:text-blue-700 h-10 px-4" onClick={() => setActiveSection("equipment")}>
          <FlaskConical className="h-4 w-4 mr-2" />
          Equipment
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((f: Facility) => (
          <Card key={f.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{f.facilityName}</h3>
                  <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 mb-2">
                    <span>{f.roomLocation}</span>
                    <span>·</span>
                    <span>{f.capacity} Researchers</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-sm">{f.facilityCategory}</Badge>
                    <StatusPill status={f.availabilityStatus} />
                  </div>
                  {(f.keyFacilityFeatures || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(f.keyFacilityFeatures || []).slice(0, 3).map((feat) => (
                        <Badge key={feat} variant="secondary" className="text-xs">{feat}</Badge>
                      ))}
                      {(f.keyFacilityFeatures || []).length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{(f.keyFacilityFeatures || []).length - 3}</Badge>
                      )}
                    </div>
                  )}

                  {/* Associated Equipment grouped by Category - Matching Reference Image */}
                  {(() => {
                    const associated = equipment.filter(e => e.facilityId === f.id);
                    if (associated.length === 0) return null;

                    const grouped = associated.reduce((acc, eq) => {
                      if (!acc[eq.equipmentCategory]) acc[eq.equipmentCategory] = [];
                      acc[eq.equipmentCategory].push(eq);
                      return acc;
                    }, {} as Record<string, Equipment[]>);

                    return (
                      <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.1em]">Associated Equipment</p>
                        <div className="space-y-4">
                          {Object.entries(grouped).map(([cat, eqs]) => (
                            <div key={cat} className="space-y-2">
                              <p className="text-[11px] font-bold text-blue-600/90 tracking-tight">{cat}</p>
                              <div className="flex flex-wrap gap-2">
                                {eqs.map(eq => (
                                  <Badge
                                    key={eq.id}
                                    variant="outline"
                                    className="text-[10px] bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-colors py-0.5 px-2 font-medium shadow-sm"
                                  >
                                    {eq.equipmentName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 print:hidden">
                  <Button size="sm" variant="outline" className="h-8 px-3 text-sm" asChild>
                    <Link to={`/admin/edit-facility/${f.id}`}><PencilLine className="h-4 w-4 text-blue-600 mr-1.5" />Edit</Link>
                  </Button>
                  <RadioGroup
                    value={f.availabilityStatus}
                    onValueChange={(val: any) => updateFacilityAvailability(f.id, val)}
                    className="flex flex-col gap-2 mt-1 border border-gray-100 rounded-md p-2.5 bg-gray-50/50"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Available" id={`avail-${f.id}`} className="h-4 w-4" />
                      <Label htmlFor={`avail-${f.id}`} className="text-xs cursor-pointer font-medium text-emerald-700">Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Limited" id={`limited-${f.id}`} className="h-4 w-4" />
                      <Label htmlFor={`limited-${f.id}`} className="text-xs cursor-pointer font-medium text-amber-700">Limited</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Unavailable" id={`unavail-${f.id}`} className="h-4 w-4" />
                      <Label htmlFor={`unavail-${f.id}`} className="text-xs cursor-pointer font-medium text-rose-700">Unavailable</Label>
                    </div>
                  </RadioGroup>
                  {confirmDelete === f.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => { deleteFacility(f.id); setConfirmDelete(null); }}>Del</Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setConfirmDelete(null)}>No</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-red-500 hover:bg-red-50" onClick={() => setConfirmDelete(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 text-center py-10 text-gray-400">
            <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No facilities found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────
function UsersSection() {
  const { users, updateUserStatus } = useAppContext();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.institution ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const exportUsers = () => {
    const ws = XLSX.utils.json_to_sheet(users.map(u => ({
      ID: u.id, FirstName: u.firstName, LastName: u.lastName, Email: u.email,
      Role: u.role, Institution: u.institution, Department: u.department,
      Status: u.status, JoinedAt: u.joinedAt
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Users_Data.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Registered Users</h2>
          <p className="text-sm text-gray-500">{users.length} total accounts</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" className="bg-white" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2 text-emerald-600" />
            Download
          </Button>
        </div>
      </div>
      <div className="relative print:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search by name, email or institution..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Institution</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden sm:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: AppUser) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-gray-700 text-xs">{u.role}</p>
                      <p className="text-gray-400 text-xs">{u.department}</p>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500">{u.institution}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-xs text-gray-500">{u.joinedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Research Projects ────────────────────────────────────────────────────────
function ResearchProjectsSection() {
  const { researchProjects, addResearchProject, updateResearchProject, deleteResearchProject } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);

  const filtered = researchProjects
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const projectData = {
      title: formData.get('title') as string,
      year: formData.get('year') as string,
      description: formData.get('description') as string,
      videoUrl: formData.get('videoUrl') as string,
      duration: formData.get('duration') as string,
      image: formData.get('image') as string || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
      tags: (formData.get('tags') as string).split(',').map(tag => {
        const [name, iconName] = tag.trim().split(':');
        return { name, iconName: iconName || 'Settings' };
      })
    };

    if (editingProject) {
      await updateResearchProject(editingProject.id, projectData);
    } else {
      await addResearchProject(projectData);
    }
    
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project: ResearchProject) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this research project?")) {
      await deleteResearchProject(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Research Projects</h2>
          <p className="text-sm text-gray-500">{researchProjects.length} projects published</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setEditingProject(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add Project
        </Button>
      </div>

      <div className="relative print:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search projects..." 
          className="pl-10" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 font-medium">
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4 hidden md:table-cell">Year</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proj) => (
                  <tr key={proj.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                      {proj.title}
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <Badge variant="secondary">{proj.year}</Badge>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-gray-500 max-w-[300px] truncate">
                      {proj.description}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600" onClick={() => handleEdit(proj)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDelete(proj.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <FolderKanban className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No research projects found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} className="max-w-2xl">
        <Modal.Header 
          title={editingProject ? "Edit Research Project" : "Add Research Project"}
          subtitle="Management for innovative outcomes"
          icon={FolderKanban}
          onClose={() => setIsModalOpen(false)}
        />
        <form onSubmit={handleSave}>
          <Modal.Content className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Title</Label>
                <Input name="title" defaultValue={editingProject?.title} placeholder="Enter title" required />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input name="year" defaultValue={editingProject?.year} placeholder="e.g. 2024" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editingProject?.description} placeholder="Enter project description" className="min-h-[100px]" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Drive Video Link</Label>
                <Input name="videoUrl" defaultValue={editingProject?.videoUrl} placeholder="Google Drive URL" required />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input name="duration" defaultValue={editingProject?.duration} placeholder="e.g. 3:45" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail Image URL (Optional)</Label>
              <Input name="image" defaultValue={editingProject?.image} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label>Tags (Format: Name:IconName, ...)</Label>
              <Input 
                name="tags" 
                defaultValue={editingProject?.tags.map((t: any) => `${t.name}:${t.iconName}`).join(', ')} 
                placeholder="IoT:Cpu, Energy:Zap, AI:Activity" 
                required 
              />
              <p className="text-[10px] text-gray-400">Icons: Cpu, Zap, Settings, Activity, LayoutGrid, Car, FlaskConical, Dna, Monitor</p>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              {editingProject ? 'Update Project' : 'Add Project'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

// ── Usage Overview ─────────────────────────────────────────────────────────────
function UsageOverviewSection() {
  const { facilities, equipment, bookings } = useAppContext();
  
  const monthOptions = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return {
      label: `${startStr} - ${endStr}`,
      value: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.getMonth(),
      year: d.getFullYear()
    };
  });

  const [dateRange, setDateRange] = useState(monthOptions[0].value);
  const [chartView, setChartView] = useState("facility");

  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.submittedAt || b.date || "");
    if (isNaN(d.getTime())) return true;
    
    const selectedOption = monthOptions.find(o => o.value === dateRange) || monthOptions[0];
    return d.getMonth() === selectedOption.month && d.getFullYear() === selectedOption.year;
  });

  const totalFacilities = facilities.length;
  const totalEquipments = equipment.length;
  const totalBookings = filteredBookings.length;
  const inUseEquipments = equipment.filter(e => e.initialStatus === "In Use").length;
  const overallUsage = equipment.length > 0 ? Math.round((inUseEquipments / equipment.length) * 100) : 0;

  // Chart 1: Facilities Usage
  const facilityUsageData = facilities.map(f => {
    const facEq = equipment.filter(e => e.facilityId === f.id);
    const inUse = facEq.filter(e => e.initialStatus === "In Use").length;
    const usage = facEq.length > 0 ? Math.round((inUse / facEq.length) * 100) : Math.floor(Math.random() * 60) + 40; // Default mock if no equipment
    return { name: f.facilityName, usage: usage };
  });

  // Chart 1b: Equipment Usage
  const equipmentUsageData = Array.from(new Set(equipment.map(e => e.equipmentCategory || "Others"))).map(cat => {
    const catEq = equipment.filter(e => (e.equipmentCategory || "Others") === cat);
    const inUse = catEq.filter(e => e.initialStatus === "In Use").length;
    const usage = catEq.length > 0 ? Math.round((inUse / catEq.length) * 100) : Math.floor(Math.random() * 60) + 40;
    return { name: cat, usage: usage };
  });

  const activeChartData = chartView === "facility" ? facilityUsageData : equipmentUsageData;

  // Chart 2: Equipment Category
  const categoryDataRaw = equipment.reduce((acc, eq) => {
    const cat = eq.equipmentCategory || "Others";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDataRaw).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

  // Top 5 Equipments
  const topEquipments = equipment.slice(0, 5).map(e => {
    const usage = Math.floor(Math.random() * 40) + 60; // Mock usage
    const facilityName = facilities.find(f => f.id === e.facilityId)?.facilityName || "Unknown";
    return { name: e.equipmentName, facility: facilityName, usage: `${usage}%` };
  });

  const handleDownloadReport = () => {
    const wsFacilities = XLSX.utils.json_to_sheet(facilityUsageData);
    const wsCategories = XLSX.utils.json_to_sheet(categoryData);
    const wsTopEquip = XLSX.utils.json_to_sheet(topEquipments);
    const wsBookings = XLSX.utils.json_to_sheet(filteredBookings.map(b => ({
      ID: b.id, Name: b.name, Type: b.type, Facility: b.facility || '', 
      Equipment: b.equipment || '', Date: b.date, Status: b.status
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsFacilities, "Facility Usage");
    XLSX.utils.book_append_sheet(wb, wsCategories, "Category Usage");
    XLSX.utils.book_append_sheet(wb, wsTopEquip, "Top Equipments");
    XLSX.utils.book_append_sheet(wb, wsBookings, "Filtered Bookings");
    
    const selectedLabel = monthOptions.find(o => o.value === dateRange)?.label || "Report";
    const safeDate = selectedLabel.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `Usage_Overview_${safeDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facilities & Equipments Usage</h2>
          <p className="text-sm text-gray-500">Overview of facility and equipment usage statistics</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[200px] bg-white h-10">
              <SelectValue placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white h-10" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
         <StatCard label="Total Facilities" value={totalFacilities} sub="All registered facilities" icon={Building2} color="bg-blue-600" />
         <StatCard label="Total Equipments" value={totalEquipments} sub="Across all facilities" icon={Activity} color="bg-emerald-500" />
         <StatCard label="Total Bookings" value={totalBookings} sub="During selected period" icon={CalendarCheck} color="bg-amber-500" />
         <StatCard label="Overall Usage" value={`${overallUsage}%`} sub="Average utilization rate" icon={FlaskConical} color="bg-indigo-600" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold">Usage of Facilities & Equipments</CardTitle>
          <Select value={chartView} onValueChange={setChartView}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facility">By Facility</SelectItem>
              <SelectItem value="equipment">By Equipment</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dx={-10} domain={[0, 100]} />
                <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="usage" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Usage by Equipment Category</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full flex justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available</div>
              )}
            </div>
            <div className="w-full flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Top 5 Most Utilized Equipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-semibold text-gray-500 pb-2 border-b">
                <span>Equipment</span>
                <span>Facility</span>
                <span>Usage (%)</span>
              </div>
              {topEquipments.map((eq, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1">
                  <span className="font-medium text-gray-900 w-1/3 truncate pr-2" title={eq.name}>{eq.name}</span>
                  <span className="text-gray-500 w-1/3 truncate pr-2" title={eq.facility}>{eq.facility}</span>
                  <div className="w-1/3 flex items-center justify-end gap-2">
                    <div className="w-full max-w-[80px] bg-gray-100 rounded-full h-1.5 hidden sm:block">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: eq.usage }}></div>
                    </div>
                    <span className="font-semibold text-gray-700 w-8 text-right">{eq.usage}</span>
                  </div>
                </div>
              ))}
              {topEquipments.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">No equipments found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export function AdminPage() {
  const { currentUser, logout, bookings } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Use state from router if available, otherwise default to dashboard
  const [activeSection, setActiveSection] = useState<Section>(
    location.state?.activeTab || "dashboard"
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;

  // Redirect non-admins silently
  useState(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
    }
  });

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  const navItems: { id: Section; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: CalendarCheck, badge: pendingCount },
    { id: "facilities", label: "Resources", icon: Building2 },
    { id: "research-projects", label: "Research Projects", icon: FolderKanban },
    { id: "usage", label: "Usage Overview", icon: Activity },
    { id: "users", label: "Users", icon: Users },
  ];

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden print:overflow-visible print:h-auto print:block">
      {/* Admin Top Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-none leading-none print:hidden">
        <Navbar>
          <Navbar.Brand
            icon={Shield}
            title="Admin Portal"
            subtitle="R&D Center Management"
          />
          <Navbar.Actions>
            <Button size="sm" variant="outline" className="text-gray-600 gap-1.5 border-gray-200 h-8" asChild>
              <Link to="/"><ChevronRight className="h-4 w-4 rotate-180" />Site</Link>
            </Button>
          </Navbar.Actions>
        </Navbar>
      </div>

      <div className="flex-1 overflow-hidden w-full flex bg-white print:overflow-visible print:block print:h-auto">
        <div className="flex w-full h-full print:block print:h-auto">
          {/* Sidebar — desktop */}
          <div className="print:hidden h-full flex-shrink-0">
            <Sidebar>
              <Sidebar.Nav>
                <Sidebar.Section title="Management">
                  {navItems.map(({ id, label, icon: Icon, badge }) => (
                    <Sidebar.Item
                      key={id}
                      label={label}
                      icon={Icon}
                      isActive={activeSection === id}
                      onClick={() => setActiveSection(id)}
                      badge={badge}
                    />
                  ))}
                </Sidebar.Section>
              </Sidebar.Nav>
              <Sidebar.Profile
                onSettingsClick={() => setActiveSection("settings")}
                onLogoutClick={() => setIsLogoutOpen(true)}
              />
            </Sidebar>
          </div>

          <main className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-br from-blue-50 to-cyan-50 print:bg-none print:bg-white print:overflow-visible print:block print:h-auto print:p-0">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 print:p-0">
              {activeSection === "dashboard" && <DashboardSection setSection={setActiveSection} />}
              {activeSection === "usage" && <UsageOverviewSection />}
              {activeSection === "bookings" && <BookingsSection />}
              {activeSection === "equipment" && <EquipmentSection />}
              {activeSection === "facilities" && <FacilitiesSection setActiveSection={setActiveSection} />}
              {activeSection === "research-projects" && <ResearchProjectsSection />}
              {activeSection === "users" && <UsersSection />}
              {activeSection === "settings" && <SettingsContent onBack={() => setActiveSection("dashboard")} />}
            </div>
          </main>
        </div>
      </div>
      <LogoutModal
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        onConfirm={handleLogout}
      />
    </div >
  );
}
