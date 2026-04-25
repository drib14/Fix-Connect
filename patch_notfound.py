import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

no_worker_modal = """
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

if "No Workers Found" not in content:
    content = content.replace("        <ResponsiveModal\n            open={showCancelModal}", no_worker_modal.strip('\n') + "\n\n        <ResponsiveModal\n            open={showCancelModal}")

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
