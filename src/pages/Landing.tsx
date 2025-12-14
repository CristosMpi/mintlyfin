import { motion } from 'framer-motion';
import { Sparkles, Zap, QrCode, Users, Store, BarChart3, LogIn, UserPlus, Shield, Clock, Gift, Wallet, Send, Trophy, Target, Globe, Lock, CreditCard, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import InfiniteUseCases from '@/components/InfiniteUseCases';
import mintlyLogo from '@/assets/mintly-logo.png';
const Landing = () => {
  const {
    user,
    signOut
  } = useAuth();
  const features = [{
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Setup',
    description: 'Create your event currency in under 2 minutes with our intuitive wizard'
  }, {
    icon: <QrCode className="w-6 h-6" />,
    title: 'QR Payments',
    description: 'Seamless scan-to-pay for all transactions between participants and vendors'
  }, {
    icon: <Users className="w-6 h-6" />,
    title: 'Unlimited Participants',
    description: 'Scale from 10 to 10,000+ users effortlessly with real-time syncing'
  }, {
    icon: <Store className="w-6 h-6" />,
    title: 'Vendor Mode',
    description: 'Simple payment collection interface designed for fast-paced events'
  }, {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Live Analytics',
    description: 'Real-time insights on circulation, transactions, and vendor earnings'
  }, {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Badges & Rewards',
    description: 'Create custom badges and reward participants for engagement'
  }];
  const organizerFeatures = [{
    icon: <Target className="w-5 h-5" />,
    title: 'Custom Currency Design',
    description: 'Choose your currency name, symbol (emoji or icon), and set the exchange rate against real money'
  }, {
    icon: <Clock className="w-5 h-5" />,
    title: 'Automatic Expiration',
    description: 'Set event duration and currencies automatically deactivate when the event ends'
  }, {
    icon: <Wallet className="w-5 h-5" />,
    title: 'Starting Balance Control',
    description: 'Define how much currency each participant receives when they join your event'
  }, {
    icon: <Store className="w-5 h-5" />,
    title: 'Vendor Management',
    description: 'Add, freeze, or remove vendors. Track individual vendor earnings in real-time'
  }, {
    icon: <Gift className="w-5 h-5" />,
    title: 'Send Rewards',
    description: 'Reward participants with bonus currency for achievements, activities, or loyalty'
  }, {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Complete Dashboard',
    description: 'Monitor active users, total circulation, vendor earnings, and remaining allocation'
  }];
  const participantFeatures = [{
    icon: <QrCode className="w-5 h-5" />,
    title: 'Instant Join',
    description: 'Scan the event QR code and enter your name to get your wallet instantly'
  }, {
    icon: <Wallet className="w-5 h-5" />,
    title: 'Digital Wallet',
    description: 'View your balance, transaction history, and earned badges all in one place'
  }, {
    icon: <Send className="w-5 h-5" />,
    title: 'Peer Transfers',
    description: 'Send currency to other participants by scanning their QR code'
  }, {
    icon: <CreditCard className="w-5 h-5" />,
    title: 'Easy Payments',
    description: 'Pay vendors instantly by letting them scan your personal wallet QR'
  }];
  const howItWorks = [{
    step: '01',
    title: 'Create Your Event',
    description: 'Sign up as an event host, name your currency (like "RoboBucks" or "FestCoins"), set the exchange rate, and define how long the event lasts.'
  }, {
    step: '02',
    title: 'Share Your QR Code',
    description: 'Mintly generates a unique, branded QR code for your event. Print it, display it, or share it digitally.'
  }, {
    step: '03',
    title: 'Participants Join',
    description: 'Attendees scan the QR code, enter their name, and instantly receive a digital wallet with your currency.'
  }, {
    step: '04',
    title: 'Transactions Flow',
    description: 'Participants pay vendors, transfer to friends, and earn rewards — all tracked in real-time on your dashboard.'
  }, {
    step: '05',
    title: 'Event Concludes',
    description: 'When time expires, the currency deactivates. You get a complete analytics summary and participants keep their badges.'
  }];
  return <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        <motion.div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.2, 0.4, 0.2]
      }} transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        <motion.div className="absolute -bottom-40 right-1/3 w-72 h-72 rounded-full bg-accent/10 blur-3xl" animate={{
        scale: [1, 1.3, 1],
        opacity: [0.2, 0.3, 0.2]
      }} transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        {/* Additional floating particles */}
        {[...Array(6)].map((_, i) => <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-primary/30" style={{
        left: `${10 + i * 15}%`,
        top: `${20 + i % 3 * 30}%`
      }} animate={{
        y: [-30, 30, -30],
        x: [-10, 10, -10],
        opacity: [0.3, 0.7, 0.3]
      }} transition={{
        duration: 5 + i,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.5
      }} />)}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <motion.img src={mintlyLogo} alt="Mintly" className="h-12 w-auto" whileHover={{
            scale: 1.05
          }} transition={{
            type: "spring",
            stiffness: 400
          }} />
            <span className="text-xl font-bold tracking-tight gradient-text">Mintly</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? <>
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
              </> : <>
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
              </>}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8" whileHover={{
            scale: 1.05
          }} animate={{
            boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.2)', '0 0 0 8px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.2)']
          }} transition={{
            duration: 2,
            repeat: Infinity
          }}>
              <Sparkles className="w-4 h-4" />
              The Complete Event Currency Platform
            </motion.span>
          </motion.div>

          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Launch Your Own
            <br />
            <motion.span className="gradient-text" animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }} transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }} style={{
            backgroundSize: '200% 200%'
          }}>
              Digital Economy
            </motion.span>
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Mintly empowers anyone to design, mint, and manage temporary digital currencies for any event. 
            Create a complete cashless economy in minutes — no technical skills required.
          </motion.p>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.25
        }} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            From school festivals to charity fundraisers, robotics team tokens to gaming tournament rewards — 
            Mintly handles wallets, payments, vendors, and analytics so you can focus on your event.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.98
            }}>
                <Button variant="gradient" size="xl" className="group">
                  Event Host Sign In
                  <motion.span className="ml-2" animate={{
                  rotate: [0, 15, -15, 0]
                }} transition={{
                  duration: 2,
                  repeat: Infinity
                }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
            <Link to="/join">
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.98
            }}>
                <Button variant="outline" size="xl">
                  <LogIn className="w-5 h-5 mr-2" />
                  Participant Login
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {user && <motion.p initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.5
        }} className="mt-6 text-muted-foreground">
              Welcome back!
            </motion.p>}
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[Wallet, QrCode, Gift, Trophy, Store].map((Icon, i) => <motion.div key={i} className="absolute text-primary/20" style={{
          left: `${10 + i * 20}%`,
          top: `${25 + i % 3 * 20}%`
        }} animate={{
          y: [-20, 20, -20],
          rotate: [0, 10, -10, 0]
        }} transition={{
          duration: 4 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5
        }}>
              <Icon className="w-8 h-8" />
            </motion.div>)}
        </div>
      </section>

      {/* What is Mintly Section */}
      <section className="py-20 px-4 bg-card/30 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              What is <span className="gradient-text">Mintly</span>?
            </h2>
            <div className="max-w-4xl mx-auto space-y-4 text-lg text-muted-foreground">
              <p>
                Mintly is a mobile-first platform that enables anyone to create and launch their own temporary digital currency for events. 
                Whether you're organizing a school festival, running a robotics team, hosting a charity fundraiser, or managing a gaming tournament — 
                Mintly gives you the power to run a complete cashless economy.
              </p>
              <p>
                No more handling cash, no complicated payment systems, no technical expertise required. 
                With Mintly, organizers can design custom currencies (like "RoboCoins" or "FestBucks"), 
                set exchange rates, distribute starting balances, register vendors, and track every transaction in real-time.
              </p>
              <p>
                Participants join by scanning a single QR code, receive an instant digital wallet, and can pay vendors, 
                transfer funds to friends, and earn rewards — all from their phone. When the event ends, 
                the currency automatically deactivates, and organizers receive comprehensive analytics.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features, Simple Interface
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to run a successful cashless event
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} whileHover={{
            y: -5,
            scale: 1.02
          }} className="glass-card p-6 hover:border-primary/30 transition-all cursor-default group">
                <motion.div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4" whileHover={{
              rotate: 10,
              scale: 1.1
            }}>
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card/30 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Mintly Works
            </h2>
            <p className="text-muted-foreground text-lg">
              From setup to event conclusion in 5 simple steps
            </p>
          </motion.div>

          <div className="space-y-8">
            {howItWorks.map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            x: i % 2 === 0 ? -30 : 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="flex gap-6 items-start">
                <motion.div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center" whileHover={{
              scale: 1.1,
              rotate: 5
            }}>
                  <span className="text-primary font-bold text-lg">{item.step}</span>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* For Organizers */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For Event <span className="gradient-text">Organizers</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Complete control over your event economy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizerFeatures.map((feature, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="glass-card p-5 hover:border-secondary/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* For Participants */}
      <section className="py-20 px-4 bg-card/30 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For <span className="gradient-text">Participants</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Simple, fast, and fun to use
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {participantFeatures.map((feature, i) => <motion.div key={i} initial={{
            opacity: 0,
            scale: 0.95
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} whileHover={{
            scale: 1.02
          }} className="glass-card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built with Security in Mind
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your event economy is protected by enterprise-grade security measures
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[{
            icon: <Lock className="w-5 h-5" />,
            title: 'Secure Transactions',
            desc: 'All wallet operations are protected by server-side security functions'
          }, {
            icon: <Shield className="w-5 h-5" />,
            title: 'Data Protection',
            desc: 'Row-level security ensures users only access their own data'
          }, {
            icon: <Globe className="w-5 h-5" />,
            title: 'Real-time Sync',
            desc: 'Instant balance updates across all devices with conflict resolution'
          }, {
            icon: <Clock className="w-5 h-5" />,
            title: 'Automatic Expiration',
            desc: 'Currencies automatically deactivate when events end'
          }].map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 10
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="flex items-center gap-4 p-4 rounded-xl bg-card/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Use Cases - Infinite Scroll */}
      <section className="py-20 px-4 bg-card/30 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect For Any Event
            </h2>
            <p className="text-muted-foreground text-lg">
              From school fairs to gaming tournaments and beyond
            </p>
          </motion.div>
        </div>
        
        <InfiniteUseCases />
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{
            value: '2min',
            label: 'Setup Time'
          }, {
            value: '10K+',
            label: 'Max Participants'
          }, {
            value: '99.9%',
            label: 'Uptime'
          }, {
            value: '0',
            label: 'Technical Skills Needed'
          }].map((stat, i) => <motion.div key={i} whileHover={{
            scale: 1.05
          }} className="p-4">
                <motion.p className="text-3xl md:text-4xl font-bold gradient-text mb-2" initial={{
              opacity: 0,
              scale: 0.5
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} viewport={{
              once: true
            }} transition={{
              delay: i * 0.1,
              type: "spring"
            }}>
                  {stat.value}
                </motion.p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Why Mintly */}
      <section className="py-20 px-4 bg-card/30 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">Mintly</span>?
            </h2>
          </motion.div>

          <div className="space-y-4">
            {['No technical skills required — anyone can create an event economy', 'Complete customization — your currency, your rules, your branding', 'Real-time everything — balances, transactions, and analytics update instantly', 'Secure by design — enterprise-grade protection for every transaction', 'Automatic cleanup — currencies expire when events end, no loose ends', 'Gamification built-in — badges and rewards keep participants engaged', 'Works on any device — no app downloads required, just scan and go'].map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.05
          }} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <p className="text-muted-foreground">{item}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="max-w-2xl mx-auto text-center relative z-10">
          <motion.h2 className="text-4xl md:text-5xl font-bold mb-6" animate={{
          textShadow: ['0 0 0 transparent', '0 0 30px hsl(var(--primary) / 0.3)', '0 0 0 transparent']
        }} transition={{
          duration: 3,
          repeat: Infinity
        }}>
            Ready to Create Your
            <br />
            <span className="gradient-text">Event Economy?</span>
          </motion.h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join event organizers worldwide who trust Mintly to power their cashless experiences
          </p>
          <Link to={user ? "/create" : "/auth"}>
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.98
          }}>
              <Button variant="gradient" size="xl" className="relative overflow-hidden group">
                <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{
                x: ['-100%', '100%']
              }} transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }} />
                {user ? 'Create Your Event' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <motion.img src={mintlyLogo} alt="Mintly" className="h-6 w-auto" whileHover={{
            scale: 1.05
          }} transition={{
            duration: 0.3
          }} />
          </div>
          <p className="text-sm text-muted-foreground">2025 Mintly©  by Christos Mpirmpos. Create your own event economy.</p>
        </div>
      </footer>
    </div>;
};
export default Landing;