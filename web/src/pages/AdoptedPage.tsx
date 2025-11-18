import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimalList from '@/components/animals/AnimalList';

export default function AdoptedPage() {
  const [activeTab, setActiveTab] = useState('all');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Convert activeTab to filter format
  const getFiltersFromTab = () => {
    switch (activeTab) {
      case 'dogs':
        return { species: 'dog' };
      case 'cats':
        return { species: 'cat' };
      case 'recent':
        // Recent adoptions will show all animals (sorting handles this)
        return {};
      case 'all':
      default:
        return {};
    }
  };
  
  return (
     <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">Success Stories</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Celebrate the journey of our rescued animals who have found their forever homes.
          </p>
        </motion.div>
        
        {/* Quick Filters / Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Stories', icon: 'fa-paw' },
            { id: 'dogs', label: 'Dogs', icon: 'fa-dog' },
            { id: 'cats', label: 'Cats', icon: 'fa-cat' },
            { id: 'recent', label: 'Recent Adoptions', icon: 'fa-calendar-check' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                 onClick={() => handleTabChange(tab.id)}
                 className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                   activeTab === tab.id
                     ? 'bg-[#4C51A4] text-white shadow-md'
                     : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                 }`}
               >
              <i className={`fa-solid ${tab.icon} mr-2`}></i>
              {tab.label}
            </motion.button>
          ))}
        </div>
        
        {/* Animal List with Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimalList 
            showAdopted={true}
            initialFilters={getFiltersFromTab()}
          />
        </motion.div>
      </div>
    </div>
  );
}