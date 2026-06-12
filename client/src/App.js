import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaShoppingCart, FaHome, FaBox, FaList, FaUser, FaStar } from 'react-icons/fa';

const API_URL = 'http://localhost:5000'; // Badme change karna hai

// 1. Header Component
const Header = ({ cartCount, logout }) => (
  <div className="sticky top-0 z-50 bg-[#2874f0] text-white p-3 shadow-md">
    <div className="flex items-center justify-between max-w-6xl mx-auto">
      <h1 className="text-xl font-bold italic">DriftCart</h1>
      <div className="flex-1 mx-4 hidden md:block relative">
        <input type="text" placeholder="Search for products" className="w-full p-2 rounded-sm text-black px-2" />
      </div>
      <div className="flex items-center gap-6">
        <FaHeart className="text-xl hidden md:block" />
        <div className="relative">
          <FaShoppingCart className="text-xl" />
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
        </div>
        <button onClick={logout} className="bg-yellow-400 text-black font-bold px-4 py-1 rounded-sm hidden md:block">Logout</button>
      </div>
    </div>
  </div>
);

// 2. Bottom Nav
const BottomNav = () => (
  <div className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around p-3 text-[#2874f0] z-50">
    <FaHome className="text-2xl" />
    <FaList className="text-2xl" />
    <FaBox className="text-2xl" />
    <FaHeart className="text-2xl" />
    <FaUser className="text-2xl" />
  </div>
);

// 3. Product Card
const ProductCard = ({ product, addToCart }) => (
  <div className="bg-white p-2 shadow-sm hover:shadow-md border border-transparent hover:border-gray-200">
    <div className="h-40 flex items-center justify-center mb-2">
      <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
    </div>
    <h3 className="text-sm text-gray-600 truncate">{product.title}</h3>
    <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
      <FaStar /> <span>{product.rating}</span>
    </div>
    <span className="font-bold text-lg block mt-1">₹{product.price}</span>
    <button onClick={() => addToCart(product)} className="w-full bg-[#ff9f00] text-white text-sm font-bold py-1 mt-2 rounded-sm">ADD TO CART</button>
  </div>
);

// 4. Auth Page
const AuthPage = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
      const res = await axios.post(url, formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/');
    } catch (err) { alert(err.response?.data?.msg || "Error"); }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#2874f0] mb-6 text-center">{isLogin ? 'Login to DriftCart' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && <input className="border p-3 rounded" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} />}
          <input className="border p-3 rounded" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className="border p-3 rounded" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
          <button className="bg-[#fb641b] text-white font-bold py-3 rounded shadow-md">{isLogin ? 'LOGIN' : 'SIGN UP'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New to DriftCart? Create an account" : "Existing User? Login"}
        </p>
      </div>
    </div>
  );
};

// 5. Home Page
const Home = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/products`).then(res => setProducts(res.data));
  }, []);

  const categories = ["Mobiles", "Electronics", "Fashion", "Footwear", "All"];

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <div className="p-2">
        <div className="bg-[#2874f0] h-40 md:h-52 rounded flex items-center justify-center text-white shadow-md">
          <div className="text-center">
            <p className="text-2xl md:text-4xl font-bold">Big Savings On Top Brands</p>
            <button className="mt-4 bg-white text-[#2874f0] px-6 py-2 rounded font-bold text-lg">Shop Now</button>
          </div>
        </div>
      </div>
      <div className="bg-white p-2 shadow-sm overflow-x-auto flex gap-4 whitespace-nowrap">
        {categories.map(cat => (
          <div key={cat} className="flex flex-col items-center min-w-[60px] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-1">{cat[0]}</div>
            <span className="text-xs font-bold text-[#2874f0]">{cat}</span>
          </div>
        ))}
      </div>
      <div className="p-2">
        <h2 className="text-xl font-bold mb-2">Best Sellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {products.map(product => <ProductCard key={product._id} product={product} addToCart={addToCart} />)}
        </div>
      </div>
    </div>
  );
};

// MAIN APP
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCartItems([]);
    setCartCount(0);
  };

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    setCartCount(prev => prev + 1);
    alert("Added to Cart!");
  };

  if (!token) return <AuthPage setToken={setToken} />;

  return (
    <Router>
      <Header cartCount={cartCount} logout={logout} />
      <div className="mt-14">
        <Routes><Route path="/" element={<Home addToCart={addToCart} />} /></Routes>
      </div>
      <BottomNav />
    </Router>
  );
}

export default App;