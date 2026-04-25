import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Add the modals back since they seem to have been lost or not properly inserted if ResponsiveModal isn't in the file.
# Where should they go? Before the final return div ends.

modals_jsx = """
        {/* No Workers Found Modal */}
        <ResponsiveModal
            open={booking.status === 'rejected'}
            onOpenChange={() => {}}
            title="No Workers Found"
            description="We're sorry, but no workers are currently available for this service in your area. Please try again later."
        >
            <div className="flex flex-col items-center justify-center py-6 text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-muted-foreground mb-6">Our active workers might be busy or too far away. Your booking has been automatically cancelled.</p>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/bookings">View My Bookings</Link>
                </Button>
            </div>
        </ResponsiveModal>

        {/* Cancel Booking Modal */}
        <ResponsiveModal
            open={showCancelModal}
            onOpenChange={setShowCancelModal}
            title="Cancel Booking"
            description="Please select a reason for cancellation. Note: Cancelling a worker who is already on the way may incur a fee."
        >
            <div className="space-y-4 py-4 pointer-events-auto">
                <div className="space-y-2">
                    {['Worker is taking too long', 'I no longer need the service', 'I found someone else', 'Worker requested cancellation', 'Other'].map(reason => (
                        <label key={reason} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-emerald-500/10 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="cancelReason"
                                value={reason}
                                checked={cancelReason === reason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="accent-emerald-500"
                            />
                            <span className="text-sm">{reason}</span>
                        </label>
                    ))}
                </div>
                {cancelReason === 'Other' && (
                    <textarea
                        className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:border-emerald-500"
                        placeholder="Please specify your reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                    />
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button variant="ghost" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>Back</Button>
                    <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Cancellation
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
"""

# Let's check where to put it. At the very end before the last </div>
content = content.replace("  );\n}\n", modals_jsx + "\n  );\n}\n")

# Import XCircle
if "import { CheckCircle2, Clock, MapPin, Loader2, Calendar, Briefcase, Wallet, CreditCard, User, XCircle } from" not in content:
     content = content.replace("import { CheckCircle2, Clock, MapPin, Loader2, Calendar, Briefcase, Wallet, CreditCard, User } from", "import { CheckCircle2, Clock, MapPin, Loader2, Calendar, Briefcase, Wallet, CreditCard, User, XCircle } from")


with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
