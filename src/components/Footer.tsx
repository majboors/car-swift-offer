
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-lg">
            <img 
              src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
              alt="Snap My Car" 
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Buy</h3>
            <ul className="space-y-2">
              <li><Link to="/search?condition=used" className="text-gray-300 hover:text-white">Used Cars</Link></li>
              <li><Link to="/search?condition=new" className="text-gray-300 hover:text-white">New Cars</Link></li>
              <li><Link to="/search?type=review" className="text-gray-300 hover:text-white">Car Reviews</Link></li>
              <li><Link to="/search?type=comparison" className="text-gray-300 hover:text-white">Car Comparisons</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Sell</h3>
            <ul className="space-y-2">
              <li><Link to="/add-listing" className="text-gray-300 hover:text-white">Sell My Car</Link></li>
              <li><Link to="/add-listing" className="text-gray-300 hover:text-white">Car Value</Link></li>
              <li><Link to="/snap-ai" className="text-gray-300 hover:text-white">Snap AI</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Help & Info</h3>
            <ul className="space-y-2">
              <li><Link to="/contact-us" className="text-gray-300 hover:text-white">Contact Us</Link></li>
              <li><Link to="/about-us" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><a href="https://taas.techrealm.pk/careers" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Snap My Car. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
