const fs = require('fs');
const content = fs.readFileSync('server/controllers/bookingController.js', 'utf-8');

const oldStr = `
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

            const bookingToAccept = await Booking.findById(savedBooking._id);
`;

const newStr = `
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

                const bookingToAccept = await Booking.findById(savedBooking._id);
`;

let result = content.replace(oldStr.trim(), newStr.trim());

// Close the if statement
const oldEnd = `
                        console.error('Error in bot simulation:', botErr);
                    }
                }
            }
        }, randomDelay);
`;

const newEnd = `
                        console.error('Error in bot simulation:', botErr);
                    }
                }
            } else {
                console.log(\`Nearest worker is \${minDistance.toFixed(2)}km away. Skipping auto-accept.\`);
            }
        } catch (e) {
          console.error("Bot auto-accept error:", e);
        }
    }, randomDelay);
`;

// Need to safely replace just the bottom try/catch block for the setTimeout.
// The original block ended like this:
/*
                } catch (osrmError) {
                    ...
                }
            }
        }
      } catch (e) {
          console.error("Bot auto-accept error:", e);
      }
    }, 3000); // 3 seconds delay
*/

const fixedEnd = result.replace(
    /} catch \(osrmError\) {([\s\S]*?)}\n            }\n        }\n      } catch \(e\) {/g,
    `} catch (osrmError) {$1}\n            }\n        } else {\n          console.log(\`Nearest worker is \${minDistance.toFixed(2)}km away. Skipping auto-accept.\`);\n        }\n      } catch (e) {`
);

fs.writeFileSync('server/controllers/bookingController.js', fixedEnd);
