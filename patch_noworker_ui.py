import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# When a booking is 'rejected' or auto-cancelled due to timeout, the status becomes 'cancelled' on the backend.
# Looking at bookingController.js auto-cancel logic:
# `booking.status = 'cancelled'; booking.cancelReason = 'Timeout: No worker accepted the request';`
# So we should trigger the modal if `booking.status === 'cancelled' && booking.cancelReason?.includes('Timeout')`
# Or better yet, since the task asks to let the user book a service *again* from the drawer, we should add a button for that.

old_modal = """
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
"""

new_modal = """
        {/* No Workers Found Modal */}
        <ResponsiveModal
            open={booking.status === 'cancelled' && booking.cancelReason && booking.cancelReason.includes('Timeout')}
            onOpenChange={() => {}}
            title="No Workers Found"
            description="We're sorry, but no workers are currently available for this service in your area. Please try again later."
        >
            <div className="flex flex-col items-center justify-center py-6 text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-muted-foreground mb-6">Our active workers might be busy or too far away. Your booking has been automatically cancelled.</p>
                <div className="flex flex-col w-full gap-3">
                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
                        <Link to="/">Book Another Service</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link to="/bookings">View My Bookings</Link>
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
"""

content = content.replace(old_modal.strip('\n'), new_modal.strip('\n'))

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
