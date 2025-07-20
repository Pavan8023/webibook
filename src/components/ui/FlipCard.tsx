// src/components/ui/FlipCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FlipCardProps {
  children: React.ReactNode[];
  onClick?: () => void;
}

export const FlipCard: React.FC<FlipCardProps> = ({ children, onClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="flip-card h-full w-full cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={onClick}
    >
      <motion.div
        className="flip-card-inner w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="flip-card-front w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
          {children[0]}
        </div>
        <div 
          className="flip-card-back w-full h-full" 
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {children[1]}
        </div>
      </motion.div>
    </div>
  );
};