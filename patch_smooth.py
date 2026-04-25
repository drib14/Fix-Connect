import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# For smoother moving markers, leaflet has a way to flyTo and panTo but for Markers we have to just update state and let React rerender the Marker.
# However, if the updates are too frequent, Leaflet Routing Machine recalculates OSRM paths excessively.
# Our check `Math.abs(start.lat - workerLoc.lat) > 0.0001` already limits this to ~11 meters. Let's make it 0.0005 to reduce jitter and delay.

content = content.replace("Math.abs(start.lat - workerLoc.lat) > 0.0001", "Math.abs(start.lat - workerLoc.lat) > 0.0005")
content = content.replace("Math.abs(start.lng - workerLoc.lng) > 0.0001", "Math.abs(start.lng - workerLoc.lng) > 0.0005")

# Smooth transition for Marker
# In BookingDetail.jsx, the marker positions are controlled by React Leaflet's <Marker> component.
# By default, a simple prop change will instantly jump the marker.
# For true smoothness without extra heavy dependencies (like leaflet.marker.slideto), css transitions can be added to the leaflet-marker-icon.

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)

with open('FixConnect/src/index.css', 'a') as f:
    f.write('''
/* Make leaflet markers transition smoothly when their position changes */
.leaflet-marker-icon, .leaflet-marker-shadow {
    transition: transform 0.5s linear;
}
''')
