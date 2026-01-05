import { motion } from 'framer-motion';

export function AnimatedGradientBackground() {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none" 
      style={{ 
        zIndex: 0,
        backgroundColor: '#0f172a' // slate-950 base
      }}
    >
      {/* Blob 1 - Dark Blue */}
      <motion.div
        animate={{
          x: ['0vw', '30vw', '10vw', '0vw'],
          y: ['0vh', '20vh', '-10vh', '0vh'],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute"
        style={{
          width: '50vw',
          height: '50vw',
          top: '-10vw',
          left: '-10vw',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(67, 56, 202, 0.5))',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.7,
        }}
      />

      {/* Blob 2 - Violet */}
      <motion.div
        animate={{
          x: ['0vw', '-30vw', '10vw', '0vw'],
          y: ['0vh', '-20vh', '10vh', '0vh'],
          scale: [1.1, 1, 1.2, 1.1],
          rotate: [0, 90, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute"
        style={{
          width: '60vw',
          height: '60vw',
          bottom: '-10vw',
          right: '-10vw',
          background: 'linear-gradient(45deg, rgba(79, 70, 229, 0.4), rgba(99, 102, 241, 0.5))',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.7,
        }}
      />

      {/* Blob 3 - Deep Blue-Violet */}
      <motion.div
        animate={{
          x: ['0vw', '20vw', '-15vw', '0vw'],
          y: ['0vh', '15vh', '-15vh', '0vh'],
          scale: [0.9, 1.1, 0.95, 0.9],
          rotate: [0, -45, 45, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute"
        style={{
          width: '45vw',
          height: '45vw',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(90deg, rgba(67, 56, 202, 0.35), rgba(30, 58, 138, 0.4))',
          borderRadius: '50%',
          filter: 'blur(120px)',
          opacity: 0.6,
        }}
      />

      {/* Blob 4 - Light Violet Accent */}
      <motion.div
        animate={{
          x: ['0vw', '-20vw', '25vw', '0vw'],
          y: ['0vh', '25vh', '-20vh', '0vh'],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute"
        style={{
          width: '40vw',
          height: '40vw',
          top: '20%',
          right: '10%',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.3), rgba(79, 70, 229, 0.35))',
          borderRadius: '50%',
          filter: 'blur(90px)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}
