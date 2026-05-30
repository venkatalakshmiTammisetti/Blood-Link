import Navbar from './Navbar';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
  </div>
);

export default Layout;
