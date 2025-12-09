import { motion } from 'framer-motion';
import { Sparkles, Zap, QrCode, Users, Store, BarChart3, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const { user, signOut } = useAuth();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Setup',
      description: 'Create your event currency in under 2 minutes',
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'QR Payments',
      description: 'Seamless scan-to-pay for all transactions',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Unlimited Participants',
      description: 'Scale from 10 to 10,000 users effortlessly',
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: 'Vendor Mode',
      description: 'Simple payment collection for all vendors',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Live Analytics',
      description: 'Real-time insights on your event economy',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Gamification',
      description: 'Badges and rewards keep participants engaged',
    },
  ];

  const useCases = [
    { emoji: '🎓', title: 'School Festivals', desc: 'Run your campus economy' },
    { emoji: '🤖', title: 'Robotics Events', desc: 'Custom team tokens' },
    { emoji: '💝', title: 'Charity Fundraisers', desc: 'Track every contribution' },
    { emoji: '🎮', title: 'Gaming Tournaments', desc: 'Reward system built-in' },
    { emoji: '🎡', title: 'Weekend Fairs', desc: 'Go cashless instantly' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-bold text-lg">MintPop</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/my-events">
                  <Button variant="ghost" size="sm">
                    My Events
                  </Button>
                </Link>
                <Link to="/create">
                  <Button variant="gradient" size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="gradient" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Create your own event currency
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            Launch Your Own
            <br />
            <span className="gradient-text">Digital Economy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Design, mint, and manage temporary digital currencies for any event. 
            School festivals, charity fundraisers, gaming tournaments — go cashless in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={user ? "/create" : "/auth"}>
              <Button variant="gradient" size="xl">
                {user ? 'Create Your Currency' : 'Get Started Free'}
                <Sparkles className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/demo/wallet">
              <Button variant="outline" size="xl">
                Try Demo Wallet
              </Button>
            </Link>
          </motion.div>

          {user && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-muted-foreground"
            >
              Welcome back! 👋
            </motion.p>
          )}
        </div>

        {/* Floating currency symbols */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['🪙', '💎', '⭐', '🎪'].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${15 + i * 25}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features, simple interface
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect For Any Event
            </h2>
            <p className="text-muted-foreground text-lg">
              From school fairs to gaming tournaments
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-card px-6 py-4 flex items-center gap-4 cursor-default"
              >
                <span className="text-3xl">{useCase.emoji}</span>
                <div>
                  <h4 className="font-semibold">{useCase.title}</h4>
                  <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Your
            <br />
            <span className="gradient-text">Event Economy?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of organizers running cashless events
          </p>
          <Link to={user ? "/create" : "/auth"}>
            <Button variant="gradient" size="xl">
              {user ? 'Create Event' : 'Get Started Free'}
              <Sparkles className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-bold text-lg">MintPop</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 MintPop. Create your own event currency.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
