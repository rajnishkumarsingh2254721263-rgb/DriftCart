require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// --- DB Models ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String,
  rating: Number,
  category: String,
});
const Product = mongoose.model('Product', ProductSchema);

// --- Routes ---

// 1. Auth
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ email, password: hashedPassword, name });
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) { res.status(500).send('Server error'); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) { res.status(500).send('Server error'); }
});

// 2. Products
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Seed Data
app.get('/seed', async (req, res) => {
  await Product.deleteMany({});
  const products = [
    { title: "iPhone 15 Pro", price: 134900, rating: 4.8, category: "Mobiles", image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-black-titanium-select-202309-1.jpg" },
    { title: "Sony WH-1000XM5", price: 24990, rating: 4.7, category: "Electronics", image: "https://images-cdn.ubuy.co.in/633a12dd1c6d6b4f5f2d326-sony-wh-1000xm5-wireless-noise-canceling.jpg" },
    { title: "Nike Air Max", price: 4999, rating: 4.2, category: "Footwear", image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad974-custom-air-max-1-shoes-Kq0bK3.png" },
    { title: "Adidas Track Jacket", price: 1999, rating: 4.5, category: "Fashion", image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_lfill,g_auto/v2/Open%20Chance_Yellow_GH7459_21_hover_model.jpg" },
  ];
  await Product.insertMany(products);
  res.send("Seeded");
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)));
