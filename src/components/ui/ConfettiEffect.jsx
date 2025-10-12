"use client";

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const ConfettiEffect = ({ active, duration = 5000 }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Set dimensions to window size
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Handle window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (active) {
      setShowConfetti(true);
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!showConfetti) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Confetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={300}
        recycle={false}
        colors={['#10B981', '#FBBF24', '#6366F1', '#EC4899', '#F59E0B', '#F43F5E']}
      />
    </div>
  );
};

export default ConfettiEffect;