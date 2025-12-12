import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Bot, 
  Heart, 
  Gamepad2, 
  FerrisWheel,
  Music,
  Utensils,
  Trophy,
  Tent,
  PartyPopper,
  Building2,
  Rocket,
  Gift,
  Church,
  Film,
  Shirt,
  Coffee,
  Bike,
  Plane,
  Palette
} from 'lucide-react';

const useCases = [
  { icon: <GraduationCap className="w-5 h-5" />, title: 'School Festivals', desc: 'Run your campus economy' },
  { icon: <Bot className="w-5 h-5" />, title: 'Robotics Events', desc: 'Custom team tokens' },
  { icon: <Heart className="w-5 h-5" />, title: 'Charity Fundraisers', desc: 'Track every contribution' },
  { icon: <Gamepad2 className="w-5 h-5" />, title: 'Gaming Tournaments', desc: 'Reward system built-in' },
  { icon: <FerrisWheel className="w-5 h-5" />, title: 'Weekend Fairs', desc: 'Go cashless instantly' },
  { icon: <Music className="w-5 h-5" />, title: 'Music Festivals', desc: 'Seamless vendor payments' },
  { icon: <Utensils className="w-5 h-5" />, title: 'Food Festivals', desc: 'Fast food court transactions' },
  { icon: <Trophy className="w-5 h-5" />, title: 'Sports Events', desc: 'Fan engagement tokens' },
  { icon: <Tent className="w-5 h-5" />, title: 'Camping Retreats', desc: 'Camp economy simplified' },
  { icon: <PartyPopper className="w-5 h-5" />, title: 'Private Parties', desc: 'VIP token experience' },
  { icon: <Building2 className="w-5 h-5" />, title: 'Corporate Events', desc: 'Employee rewards' },
  { icon: <Rocket className="w-5 h-5" />, title: 'Hackathons', desc: 'Prize distribution' },
  { icon: <Gift className="w-5 h-5" />, title: 'Wedding Receptions', desc: 'Guest appreciation' },
  { icon: <Church className="w-5 h-5" />, title: 'Church Events', desc: 'Community engagement' },
  { icon: <Film className="w-5 h-5" />, title: 'Film Premieres', desc: 'Fan rewards' },
  { icon: <Shirt className="w-5 h-5" />, title: 'Fashion Shows', desc: 'Exclusive merch tokens' },
  { icon: <Coffee className="w-5 h-5" />, title: 'Coffee Meetups', desc: 'Community currency' },
  { icon: <Bike className="w-5 h-5" />, title: 'Cycling Events', desc: 'Checkpoint rewards' },
  { icon: <Plane className="w-5 h-5" />, title: 'Travel Meetups', desc: 'Group experience' },
  { icon: <Palette className="w-5 h-5" />, title: 'Art Exhibitions', desc: 'Artist tip tokens' },
];

const InfiniteUseCases = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless loop
  const items = [...useCases, ...useCases];

  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient masks for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-4"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 40,
            ease: 'linear',
          },
        }}
      >
        {items.map((useCase, i) => (
          <div
            key={i}
            className="glass-card px-5 py-4 flex items-center gap-3 cursor-default shrink-0 hover:border-primary/30 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              {useCase.icon}
            </div>
            <div className="whitespace-nowrap">
              <h4 className="font-semibold text-sm">{useCase.title}</h4>
              <p className="text-xs text-muted-foreground">{useCase.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default InfiniteUseCases;
