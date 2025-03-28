import React from 'react';
import { motion } from 'framer-motion';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop"
        }}
        className="w-16 h-16 bg-primary-600 rounded-full mb-8"
      />
      
      <h2 className="text-2xl font-bold mb-4">Loading AI Incident Data...</h2>
      <p className="text-gray-600 max-w-md text-center">
        We're processing the AI Incident Database. This might take a moment.
      </p>
    </div>
  );
};

export default LoadingState;