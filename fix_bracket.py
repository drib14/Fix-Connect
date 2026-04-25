import re

with open('server/controllers/bookingController.js', 'r') as f:
    content = f.read()

old_block = """
            } else {
                console.log(`Nearest worker is ${minDistance.toFixed(2)}km away. Skipping auto-accept.`);
                // The booking will remain pending and naturally timeout or be manually accepted
            }
        }
      } catch (e) {
          console.error("Bot auto-accept error:", e);
"""

new_block = """
                } else {
                    console.log(`Nearest worker is ${minDistance.toFixed(2)}km away. Skipping auto-accept.`);
                    // The booking will remain pending and naturally timeout or be manually accepted
                }
            }
        }
      } catch (e) {
          console.error("Bot auto-accept error:", e);
"""

# The bracket nesting is off because we replaced the end but missed a closing brace.
content = content.replace("            } else {\n                console.log(`Nearest worker is ${minDistance.toFixed(2)}km away. Skipping auto-accept.`);\n                // The booking will remain pending and naturally timeout or be manually accepted\n            }\n        }\n      } catch (e) {", new_block.strip("\n"))


# Wait, let's just do a blanket fix by counting braces or checking the structure.
with open('server/controllers/bookingController.js', 'w') as f:
    f.write(content)
