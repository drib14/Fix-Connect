const fs = require('fs');

let file = fs.readFileSync('FixConnect/src/pages/BookingDetail.jsx', 'utf8');

// Fix RoutingMachine
file = file.replace(/function RoutingMachine[\s\S]*?return null;\n}/m, `function RoutingMachine({ customerLoc, workerLoc, setEta }) {
    const map = useMap();
    const routingControlRef = React.useRef(null);

    useEffect(() => {
        if (!map || !customerLoc || !workerLoc) return;

        if (!routingControlRef.current) {
            routingControlRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(workerLoc.lat, workerLoc.lng),
                    L.latLng(customerLoc.lat, customerLoc.lng)
                ],
                lineOptions: {
                    styles: [{ color: '#10b981', weight: 5, opacity: 0.8 }]
                },
                show: false,
                addWaypoints: false,
                routeWhileDragging: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                createMarker: () => null // We draw our own markers
            });

            // Prevent crash on unmount during ajax
            const originalClearLines = routingControlRef.current._clearLines.bind(routingControlRef.current);
            routingControlRef.current._clearLines = function() {
                if (!this._map) return;
                originalClearLines();
            };

            routingControlRef.current.on('routesfound', function(e) {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    const summary = routes[0].summary;
                    if (setEta) {
                        // convert seconds to human readable
                        const totalMinutes = Math.round(summary.totalTime / 60);
                        setEta(totalMinutes > 0 ? \`\${totalMinutes} min\` : '< 1 min');
                    }
                }
            }).addTo(map);
        } else {
             // Only update the waypoint data without fitting selected routes again
             if (routingControlRef.current._map) {
                 routingControlRef.current.setWaypoints([
                    L.latLng(workerLoc.lat, workerLoc.lng),
                    L.latLng(customerLoc.lat, customerLoc.lng)
                ]);
             }
        }
    }, [map, customerLoc, workerLoc, setEta]);

    useEffect(() => {
        // Cleanup on fully unmounting
        return () => {
             if (routingControlRef.current && map) {
                 try {
                     map.removeControl(routingControlRef.current);
                     routingControlRef.current = null;
                 } catch (_e) { // eslint-disable-line no-unused-vars
                     // ignore
                 }
             }
        }
    }, [map]);

    return null;
}`);

// Fix TileLayer
file = file.replace(/<TileLayer\s*url=\{`https:\/\/{s}-tiles.locationiq.com\/v3\/streets\/r\/{z}\/{x}\/{y}.png\?key=\$\{import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN\}`\}\s*attribution='&copy; <a href="https:\/\/locationiq.com\/\?ref=maps">LocationIQ<\/a> contributors'\s*\/>/,
`<TileLayer
                        url={import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN ? \`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=\${import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN}\` : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                        attribution={import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN ? '&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
                    />`);

fs.writeFileSync('FixConnect/src/pages/BookingDetail.jsx', file);
console.log("Patched BookingDetail.jsx");
