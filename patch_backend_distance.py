import re

with open('server/controllers/bookingController.js', 'r') as f:
    content = f.read()

# We need to modify the bot acceptance logic so it only accepts if `minDistance` is below a certain threshold.
# Let's say if `minDistance` > 15 km, we don't auto-accept, but wait. Or the simulation logic is just for bots.
# If no bot is within radius, it shouldn't auto accept.
# In the original code: `const bot = nearestBot;` and it immediately accepts.
# Let's add a check: `if (minDistance <= 25) { ... }` (Accepts if within 25km).

replacement = """
            let nearestBot = bots[0];
            let minDistance = getDistance(lat, lng, nearestBot.currentLocation.lat, nearestBot.currentLocation.lng);
            for (let i = 1; i < bots.length; i++) {
                let distance = getDistance(lat, lng, bots[i].currentLocation.lat, bots[i].currentLocation.lng);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBot = bots[i];
                }
            }

            // Only accept if the nearest worker is within a reasonable radius (e.g. 15 km)
            if (minDistance <= 15) {
                const bot = nearestBot;
"""

content = content.replace("""
            let nearestBot = bots[0];
            let minDistance = getDistance(lat, lng, nearestBot.currentLocation.lat, nearestBot.currentLocation.lng);
            for (let i = 1; i < bots.length; i++) {
                let distance = getDistance(lat, lng, bots[i].currentLocation.lat, bots[i].currentLocation.lng);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBot = bots[i];
                }
            }
            const bot = nearestBot;
""", replacement.strip('\n') + "\n")


# Now we have to close the if statement and add an `else` block to do nothing and let it timeout or be manually accepted later.
# We'll replace the end of the timeout block:
# It's inside a `setTimeout(async () => { ... }, randomDelay);`

old_end = """                        console.error('Error in bot simulation:', botErr);
                    }
                }
            }
        }, randomDelay);"""

new_end = """                        console.error('Error in bot simulation:', botErr);
                    }
                }
            } else {
                console.log(`Nearest worker is ${minDistance.toFixed(2)}km away. Skipping auto-accept.`);
                // The booking will remain pending and naturally timeout or be manually accepted
            }
        }, randomDelay);"""

content = content.replace(old_end, new_end)

with open('server/controllers/bookingController.js', 'w') as f:
    f.write(content)
