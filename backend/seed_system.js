const mongoose = require('mongoose');
require('dotenv').config();

const Currency = require('./models/Currency');
const Promo = require('./models/Promo');
const Testimonial = require('./models/Testimonial');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seed() {
  await Currency.deleteMany();
  await Promo.deleteMany();
  await Testimonial.deleteMany();

  await Currency.create({ code: 'USD', symbol: '$', name: 'US Dollar', isActive: true });
  await Currency.create({ code: 'PHP', symbol: '₱', name: 'Philippine Peso', isActive: true });

  await Promo.create({ code: 'WELCOME10', discountPercentage: 10, isActive: true });
  await Promo.create({ code: 'SUMMER20', discountPercentage: 20, isActive: true });

  await Testimonial.create({ authorName: 'John Doe', role: 'Customer', content: 'Great service!', rating: 5, isActive: true });

  console.log('seeded');
  process.exit();
}

seed();
