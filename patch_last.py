import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Ah! The JSX modals were appended AFTER the `</div>` that closes the main return statement.
# Specifically after line 519. We need them INSIDE the final `</div>`.

# Let's clean the end of the file.
lines = content.split('\n')
# Find the line with `<MapContainer` and go down until we see `</div>\n    </div>\n  );\n}` basically.
# Instead of regex, let's just find the last few divs.

bad_ending = """                    )}
                </MapContainer>
            </div>
        </div>
    </div>
        {/* No Workers Found Modal */}"""

good_ending = """                    )}
                </MapContainer>
            </div>
        </div>
        {/* No Workers Found Modal */}"""

content = content.replace(bad_ending, good_ending)

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
