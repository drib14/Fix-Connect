const fs = require('fs');

const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace("http://localhost:5000/api/system/currencies", "http://localhost:5000/api/admin/currencies");
content = content.replace("http://localhost:5000/api/system/promos", "http://localhost:5000/api/admin/promos");
content = content.replace("http://localhost:5000/api/system/testimonials", "http://localhost:5000/api/admin/testimonials");

fs.writeFileSync(file, content);
