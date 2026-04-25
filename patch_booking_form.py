import re

with open('FixConnect/src/components/CreateBookingForm.jsx', 'r') as f:
    content = f.read()

# Remove the Date and Start Time inputs from the form since it's instant booking.
old_time_inputs = """
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={formData.date} onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary" required />
        </div>
      </div>
"""

content = content.replace(old_time_inputs.strip('\n'), '')

# Also remove them from the initial formData state to be clean, though not strictly necessary.
content = content.replace("    date: '',\n    startTime: '',\n    endTime: '',", "    // instant booking\n")

with open('FixConnect/src/components/CreateBookingForm.jsx', 'w') as f:
    f.write(content)
