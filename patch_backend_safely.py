import re

with open('server/controllers/bookingController.js', 'r') as f:
    content = f.read()

# We want to replace `const bot = nearestBot;` with `if (minDistance > 15) return; const bot = nearestBot;`
# This avoids nested bracket hell entirely. It just exits the `setTimeout` function early!

new_logic = """            if (minDistance > 15) {
                console.log(`Nearest worker is ${minDistance.toFixed(2)}km away. Skipping auto-accept.`);
                return;
            }
            const bot = nearestBot;"""

content = content.replace("            const bot = nearestBot;", new_logic)

with open('server/controllers/bookingController.js', 'w') as f:
    f.write(content)
