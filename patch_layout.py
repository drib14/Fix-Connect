import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Make the wrapper div flex-col-reverse on mobile so the map is on top, and the details panel on bottom.
# And we'll use CSS to make the panel a Bottom Sheet that is fixed at the bottom.
old_container = r'<div className="flex-1 relative z-0 flex flex-col md:flex-row">'
new_container = r'<div className="flex-1 relative z-0 flex flex-col md:flex-row overflow-hidden">'

content = content.replace(old_container, new_container)

old_panel = r'<div className="w-full md:w-[400px] h-[40vh] md:h-full bg-card/95 backdrop-blur-md md:border-r border-t md:border-t-0 border-border/50 z-10 flex flex-col overflow-y-auto no-scrollbar shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] md:shadow-2xl p-6 absolute md:relative bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none transition-all duration-300 hover:h-[60vh] md:hover:h-full">'
new_panel = r'<div className="w-full md:w-[400px] h-[45vh] md:h-full bg-card/95 backdrop-blur-md md:border-r border-t md:border-t-0 border-border/50 z-10 flex flex-col overflow-y-auto no-scrollbar shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] md:shadow-2xl p-6 absolute md:relative bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none transition-all duration-300 transform translate-y-0">'

content = content.replace(old_panel, new_panel)

# Now we need to add the action buttons (Cancel Booking) inside the panel
cancellation_buttons = """
                <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3 shrink-0">
                    {['pending', 'accepted', 'in_progress'].includes(booking.status) && localStorage.getItem('userId') !== booking.workerId?.userId && (
                         <Button variant="destructive" className="w-full font-bold">
                             Cancel Booking
                         </Button>
                    )}
                    {booking.status === 'in_progress' && localStorage.getItem('userId') === booking.workerId?.userId && (
                        <Button className="w-full font-bold bg-emerald-600 hover:bg-emerald-700">
                             Complete Job
                         </Button>
                    )}
                </div>
            </div>

            {/* Map Area */}
"""

content = content.replace("            </div>\n\n            {/* Map Area */}", cancellation_buttons)

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
