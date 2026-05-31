const fs = require('fs');

const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace("setPayments(res.data.payments)", "setPayments(res.data.bookings || [])");
content = content.replace("setLocations(res.data.locations)", "setLocations(res.data.workers || [])");

content = content.replace("http://localhost:5000/api/system/currencies", "http://localhost:5000/api/admin/currencies");
content = content.replace("http://localhost:5000/api/system/promos", "http://localhost:5000/api/admin/promos");
content = content.replace("http://localhost:5000/api/system/testimonials", "http://localhost:5000/api/admin/testimonials");
content = content.replace("setCurrencies(curRes.data.data)", "setCurrencies(curRes.data.currencies || [])");
content = content.replace("setPromos(proRes.data.data)", "setPromos(proRes.data.promos || [])");
content = content.replace("setTestimonials(testRes.data.data)", "setTestimonials(testRes.data.testimonials || [])");

fs.writeFileSync(file, content);
