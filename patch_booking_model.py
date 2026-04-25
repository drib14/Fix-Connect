import re

with open('server/models/Booking.js', 'r') as f:
    content = f.read()

# The model requires `date` and `startTime`. We need to make them optional or default to Date.now
content = content.replace("  date: {\n    type: Date,\n    required: true,\n  },", "  date: {\n    type: Date,\n    default: Date.now\n  },")
content = content.replace("  startTime: {\n    type: String,\n    required: true,\n  },", "  startTime: {\n    type: String,\n    default: 'ASAP'\n  },")

with open('server/models/Booking.js', 'w') as f:
    f.write(content)
