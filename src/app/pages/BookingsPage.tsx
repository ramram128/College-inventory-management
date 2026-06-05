import { useAppContext } from "../context/AppContext";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Calendar, Clock, MapPin, Package, Users } from "lucide-react";

export function BookingsPage() {
    const { currentUser, bookings } = useAppContext();

    // Filter bookings for the current user
    const myBookings = bookings.filter((b) => b.email === currentUser?.email);

    // Sort bookings by date (newest first)
    const sortedBookings = [...myBookings].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    function StatusPill({ status }: { status: string }) {
        const map: Record<string, string> = {
            Pending: "bg-amber-100 text-amber-800 border-amber-200",
            Approved: "bg-green-100 text-green-800 border-green-200",
            Rejected: "bg-red-100 text-red-800 border-red-200",
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50/50 p-6 md:p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">
                    My Bookings
                </h1>
                <p className="text-gray-500">
                    View the status of your facility and equipment requests.
                </p>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                {sortedBookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">You haven't made any facility or equipment requests yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedBookings.map((booking) => {
                            return (
                                <Card key={booking.id} className="overflow-hidden group hover:shadow-md transition-shadow border-gray-200 rounded-xl">
                                    <CardHeader className="pb-3 px-6 pt-5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5 min-h-[20px]">
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase tracking-widest bg-gray-50 text-gray-500 border-gray-200 font-bold shrink-0">
                                                        {booking.type === 'facility' ? 'Facility' : 'Equipment'}
                                                    </Badge>
                                                    <span className="text-[10px] font-mono text-gray-400">ID: {booking.id}</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900 leading-snug truncate">
                                                    {booking.type === 'facility' ? booking.facility : booking.equipment}
                                                </h4>
                                                {booking.type === 'equipment' && booking.facility && (
                                                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{booking.facility}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-6 md:gap-10 sm:justify-start">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Scheduled</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{booking.timeSlot}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 hidden sm:block">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Details</p>
                                                    {booking.type === 'facility' && booking.persons && (
                                                        <span className="text-blue-600 text-[11px] flex items-center bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-100 w-fit">
                                                            <Users className="w-3 h-3 mr-1" />
                                                            {booking.persons} {booking.persons === 1 ? 'Person' : 'Persons'}
                                                        </span>
                                                    )}
                                                    {booking.type === 'equipment' && booking.quantity && (
                                                        <span className="text-indigo-600 text-[11px] flex items-center bg-indigo-50 px-2 py-0.5 rounded-full font-bold border border-indigo-100 w-fit">
                                                            <Package className="w-3 h-3 mr-1" />
                                                            Qty: {booking.quantity}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="shrink-0 flex flex-col items-end gap-1.5 self-center">
                                                    <div className="text-[10px] text-gray-400 font-medium">Status</div>
                                                    <StatusPill status={booking.status} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 font-medium">Submitted on {new Date(booking.submittedAt).toLocaleDateString()}</span>
                                            {booking.purpose && (
                                                <span className="text-gray-300">|</span>
                                            )}
                                            {booking.purpose && (
                                                <span className="text-gray-500 italic truncate max-w-[200px] md:max-w-[400px]">"{booking.purpose}"</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
