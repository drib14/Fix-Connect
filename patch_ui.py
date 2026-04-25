import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Replace the layout logic so that it uses a Drawer-like bottom sheet on mobile that doesn't
# permanently hide half the map, or better yet, make it responsive via standard CSS.

old_panel = r'<div className="w-full md:w-\[400px\] h-1/2 md:h-full bg-card/95 backdrop-blur-md border-r border-border/50 z-10 flex flex-col overflow-y-auto no-scrollbar shadow-2xl p-6 absolute md:relative bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none">'
new_panel = r'<div className="w-full md:w-[400px] h-[40vh] md:h-full bg-card/95 backdrop-blur-md md:border-r border-t md:border-t-0 border-border/50 z-10 flex flex-col overflow-y-auto no-scrollbar shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] md:shadow-2xl p-6 absolute md:relative bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none transition-all duration-300 hover:h-[60vh] md:hover:h-full">'

content = re.sub(re.escape(old_panel), new_panel, content)

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
