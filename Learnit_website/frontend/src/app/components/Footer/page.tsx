import Link from "next/link";
import Image from "next/image";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-6">
            <Image 
              src="/learnit logo.png" 
              alt="LearnIt.com Logo" 
              width={150} 
              height={50} 
              className="h-auto"
            />
          </div>
          <p className="text-gray-400 mb-6">
            Transforming the way you study with AI-powered learning tools that adapt to your needs.
          </p>
          <div className="flex space-x-4">
          <a href="https://x.com/learnit_com" className="text-gray-400 hover:text-white">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
            
            <a href="https://www.instagram.com/learnit_com/" className="text-gray-400 hover:text-white">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
          <ul className="space-y-2">
            <li><Link href="/subscriptions" className="text-gray-400 hover:text-white">Pricing</Link></li>
            <li><Link href="/subscriptions#faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
          <ul className="space-y-2">
            
            <li><Link href="/communities" className="text-gray-400 hover:text-white">Community</Link></li>
            <li><Link href="/api-docs" className="text-gray-400 hover:text-white">API Documentation</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>© 2025 LearnIt.com. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;