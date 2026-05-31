const fs = require('fs');

const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace("  Hammer,\n  Leaf,\n  Plus,\n  Edit,\n  Trash2,\n", "  Hammer,\n  Leaf,\n  Edit,\n  Trash2,\n");

fs.writeFileSync(file, content);
