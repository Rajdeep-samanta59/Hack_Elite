import React from 'react';
import { motion } from 'framer-motion';

const TrueFocus = ({ sentence, borderColor = "#6366F1", glowColor = "rgba(99,102,241,0.6)", animationDuration = 0.6, pauseBetweenAnimations = 1.2 }) => {
  const words = sentence.split(' ');

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: animationDuration,
            delay: index * (animationDuration + pauseBetweenAnimations),
            ease: "easeOut"
          }}
          className="text-4xl md:text-6xl font-bold text-white"
          style={{
            textShadow: `0 0 20px ${glowColor}`,
            borderBottom: `3px solid ${borderColor}`,
            paddingBottom: '4px'
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export default TrueFocus;
