import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-black/60 text-white font-sans border-t border-gray-800 backdrop-blur-md">
      <div className=" mx-auto px-6 py-12 md:flex md:justify-between md:items-center bg-black/40 backdrop-blur-lg shadow-2xl shadow-black/20 ring-1 ring-white/10">
        {/* Branding */}
        <div className="mb-8 md:mb-0 flex items-center space-x-3">
          <div className="text-3xl font-extrabold tracking-tight select-none">
            FeedbackFlow
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-12 md:gap-y-0">
          <a
            href="/about"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            About
          </a>
          <a
            href="/features"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            Features
          </a>
          <a
            href="/pricing"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            Pricing
          </a>
          <a
            href="/blog"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            Blog
          </a>
          <a
            href="/contact"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            Contact
          </a>
        </nav>

        {/* Social Icons */}
        <div className="mt-8 md:mt-0 flex justify-center space-x-6">
          <a
            href="https://twitter.com/yourprofile"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            <Twitter size={24} />
          </a>
          <a
            href="https://instagram.com/yourprofile"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            <Instagram size={24} />
          </a>
          <a
            href="https://linkedin.com/in/yourprofile"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            <Linkedin size={24} />
          </a>
          <a
            href="https://github.com/yourprofile"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            <Github size={24} />
          </a>
          <a
            href="mailto:support@feedbackflow.com"
            aria-label="Email"
            className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            <Mail size={24} />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-300 bg-black/30 backdrop-blur-md">
        &copy; {new Date().getFullYear()} FeedbackFlow. All rights reserved.
        <span className="block sm:inline ml-1">
          Made with <span aria-label="love" role="img" className="text-red-500">❤️</span> by Kumar Gautam.
        </span>
      </div>
    </footer>
  );
}
