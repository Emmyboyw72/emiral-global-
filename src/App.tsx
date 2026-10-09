import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { Wellness } from './pages/Wellness';
import { Opportunity } from './pages/Opportunity';
import { Community } from './pages/Community';
import { Blog } from './pages/Blog';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { TrackOrder } from './pages/TrackOrder';
import { Payment } from './pages/Payment';

// Admin Pages
import { AdminLayout } from './components/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminFAQ } from './pages/admin/AdminFAQ';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminMessages } from './pages/admin/AdminMessages';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Public Layout */}
            <Route path="/" element={<><Navbar /><main className="flex-grow"><Outlet /></main><Footer /></>}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="about" element={<About />} />
              <Route path="wellness" element={<Wellness />} />
              <Route path="opportunity" element={<Opportunity />} />
              <Route path="community" element={<Community />} />
              <Route path="blog" element={<Blog />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="payment" element={<Payment />} />
            </Route>

            {/* Admin Login (No Layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Dashboard (Admin Layout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="faq" element={<AdminFAQ />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}
