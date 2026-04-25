import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# The UI panel has `z-10` which means it might be underneath the map if the map has a higher z-index implicitly,
# or Leaflet's zoom controls / interactive elements are overlapping it.
# Let's ensure the details panel has a high enough z-index and pointer-events so it's clickable.
# Actually, the panel has: className="w-full md:w-[400px] h-[45vh] md:h-full bg-card/95 backdrop-blur-md md:border-r border-t md:border-t-0 border-border/50 z-10 flex flex-col overflow-y-auto no-scrollbar shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] md:shadow-2xl p-6 absolute md:relative bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none transition-all duration-300 transform translate-y-0"
# Notice it's absolute on mobile. Leaflet map is in `<div className="flex-1 w-full h-full relative z-0 min-h-[50vh]">`.
# But `pointer-events: auto` might be needed if it got disabled, or the map container is covering it.

# Let's add z-40 to the panel to be safe against Leaflet layers (which usually use z-index 400, so let's use z-50 in Tailwind)
# Tailwind z-index goes up to z-50 natively.

content = content.replace("z-10 flex flex-col", "z-50 flex flex-col")

# Wait, another reason why it might not be clickable is if `setShowCancelModal` is undefined?
# No, it's defined in the state hook.
# Let's check where the ResponsiveModal for cancellation is located.
# Oh! In the previous patch, I added it, but maybe it got overwritten or placed weirdly.

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
