import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Make the setWaypoints part robust, because when worker location updates fast,
# setWaypoints fires off requests. If map isn't completely ready or leaflet-routing-machine
# is still building up DOM, it fails.
replacement = """
        } else {
             // If it exists, just set waypoints
             try {
                const currentWaypoints = routingControlRef.current.getWaypoints();
                const start = currentWaypoints[0]?.latLng;
                const end = currentWaypoints[1]?.latLng;

                // Only update if there is a meaningful change in coordinates to prevent excessive API calls
                if (!start || !end || Math.abs(start.lat - workerLoc.lat) > 0.0001 || Math.abs(start.lng - workerLoc.lng) > 0.0001) {
                    routingControlRef.current.setWaypoints([
                        L.latLng(workerLoc.lat, workerLoc.lng),
                        L.latLng(customerLoc.lat, customerLoc.lng)
                    ]);
                }
             } catch (err) {
                 console.warn("Error updating waypoints:", err);
             }
        }
"""

content = re.sub(
    r"""        \} else \{\n             // If it exists, just set waypoints\n             try \{\n                routingControlRef.current.setWaypoints\(\[\n                    L.latLng\(workerLoc.lat, workerLoc.lng\),\n                    L.latLng\(customerLoc.lat, customerLoc.lng\)\n                \]\);\n             \} catch \(err\) \{\n                 console.warn\("Error updating waypoints:", err\);\n             \}\n        \}""",
    replacement.strip('\n'),
    content
)

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
