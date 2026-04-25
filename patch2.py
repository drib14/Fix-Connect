import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Add logic to wrap setWaypoints inside a setTimeout or check if map has layers,
# The TypeError: Cannot read properties of null (reading 'addLayer') occurs in Leaflet routing machine
# when it tries to add a line to a non-existent map layer Group because it got detached, or route calculating finished after the component is already torn down.

replacement = """
    useEffect(() => {
        // Component fully unmounting
        return () => {
            if (routingControlRef.current) {
                try {
                    // Stop it from making further requests
                    if (routingControlRef.current.getRouter && routingControlRef.current.getRouter()) {
                        routingControlRef.current.getRouter().abort = () => {};
                    }
                    if (map && map.removeControl) {
                        map.removeControl(routingControlRef.current);
                    }
                    // Explicitly nullify to prevent delayed callbacks from trying to add layers
                    routingControlRef.current._map = null;
                    routingControlRef.current._line = null;
                } catch (e) {
                    console.warn("Cleanup error in routing machine", e);
                }
            }
        };
    }, [map]);
"""

content = re.sub(
    r"""    useEffect\(\(\) => \{\n        // Component fully unmounting\n        return \(\) => \{\n            if \(routingControlRef.current && map\) \{\n                try \{\n                    // Stop it from making further requests\n                    if \(routingControlRef.current.getRouter && routingControlRef.current.getRouter\(\)\) \{\n                        routingControlRef.current.getRouter\(\).abort = \(\) => \{\}; \n                    \}\n                    map.removeControl\(routingControlRef.current\);\n                \} catch \(e\) \{\n                    console.warn\("Cleanup error in routing machine", e\);\n                \}\n            \}\n        \};\n    \}, \[map\]\);""",
    replacement.strip('\n'),
    content
)

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
