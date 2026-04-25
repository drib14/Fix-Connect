import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Add ResponsiveModal import
if "import { ResponsiveModal }" not in content:
    content = content.replace("import { Button } from '../components/ui/button';", "import { Button } from '../components/ui/button';\nimport { ResponsiveModal } from '../components/ResponsiveModal';")

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
