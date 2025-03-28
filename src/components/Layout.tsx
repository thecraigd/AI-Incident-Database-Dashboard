import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <motion.span 
                  className="text-2xl font-bold text-primary-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  AI Safety Incidents
                </motion.span>
              </div>
            </div>
            <div className="flex items-center">
              <a
                href="https://incidentdatabase.ai/"
                className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Original Database <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white shadow-inner mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Built with data from the{' '}
            <a
              href="https://incidentdatabase.ai/"
              className="text-primary-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              AI Incident Database
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;