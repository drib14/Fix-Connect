const fs = require('fs');

const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace("await axios.get('http://localhost:5000/api/admin/currencies');", "await axios.get('http://localhost:5000/api/admin/currencies', { headers });");
content = content.replace("await axios.get('http://localhost:5000/api/admin/promos');", "await axios.get('http://localhost:5000/api/admin/promos', { headers });");
content = content.replace("await axios.get('http://localhost:5000/api/admin/testimonials');", "await axios.get('http://localhost:5000/api/admin/testimonials', { headers });");

fs.writeFileSync(file, content);
