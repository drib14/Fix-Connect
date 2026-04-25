import re

with open('server/controllers/bookingController.js', 'r') as f:
    content = f.read()

# Fix the missing brace closure. The patch inserted `if (minDistance <= 15) { const bot = nearestBot; ...`
# but it left the closing brace misplaced or didn't add it around the whole block.
# Let's find: `} else {\n                console.log(\`Nearest worker is ${minDistance.toFixed(2)}km away. Skipping auto-accept.\`);`
# The actual structure inside the timeout is:
# try {
#     ...
#     if (bots.length > 0) {
#         let nearestBot = bots[0];
#         ...
#         if (minDistance <= 15) {
#             const bot = nearestBot;
#             const bookingToAccept = ...
#             if (bookingToAccept && bookingToAccept.status === 'pending') { ... }
#         } else {
#             console.log(...)
#         }
#     }
# } catch (e) {}

replacement = """
            // Only accept if the nearest worker is within a reasonable radius (e.g. 15 km)
            if (minDistance <= 15) {
                const bot = nearestBot;

                const bookingToAccept = await Booking.findById(savedBooking._id);
"""

# First revert the broken patch
content = content.replace("""
            // Only accept if the nearest worker is within a reasonable radius (e.g. 15 km)
            if (minDistance <= 15) {
                const bot = nearestBot;

            const bookingToAccept = await Booking.findById(savedBooking._id);""", replacement.strip('\n'))

with open('server/controllers/bookingController.js', 'w') as f:
    f.write(content)
