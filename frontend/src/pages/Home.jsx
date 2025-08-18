import { Box, Button, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AreaChart,
  ArrowRight,
  BotMessageSquare,
  FormInput,
  LogIn,
  QrCode,
  Share2,
  Sparkles
} from "lucide-react";

import React, { useLayoutEffect, useRef } from "react";

// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// Define the features data
const features = [
  {
    Icon: FormInput,
    title: "Build with Ease",
    desc: "Visually construct your feedback forms with our intuitive drag & drop editor.",
    color: "#7C3AED",
  },
  {
    Icon: Share2,
    title: "Instant Sharing",
    desc: "Distribute your form via a unique link or QR code. No login required for respondents.",
    color: "#2563EB",
  },
  {
    Icon: AreaChart,
    title: "Live Analytics",
    desc: "Watch feedback roll in with real-time charts and visual insights from every response.",
    color: "#10B981",
  },
  {
    Icon: BotMessageSquare,
    title: "AI Summaries",
    desc: "Leverage AI to automatically extract key insights, topics, and sentiment from text responses.",
    color: "#F59E0B",
  },
  {
    Icon: LogIn,
    title: "Simple Access",
    desc: "Attendees and team members can securely log in using their existing email or social accounts.",
    color: "#EF4444",
  },
  {
    Icon: QrCode,
    title: "QR Feedback",
    desc: "Generate custom QR codes for your forms, perfect for collecting on-the-spot feedback at live events.",
    color: "#8B5CF6",
  },
];

// Define the Framer Motion variants for text animation
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const theme = useTheme();

  console.log('📍 Current Page: Home/Landing Page');

  // Use useLayoutEffect for GSAP animations to prevent flash of unstyled content
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const featureCards = gsap.utils.toArray(".feature-card");

      // Animate the feature cards on scroll
      gsap.fromTo(
        featureCards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: featureCards[0],
            start: "top 85%",
            end: "bottom top",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert(); // Clean up GSAP animations on component unmount
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* Decorative Background Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-12rem',
          width: '40rem',
          height: '40rem',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.2)',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: '-12rem',
          width: '40rem',
          height: '40rem',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          zIndex: -1,
        }}
      />

      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          px: { xs: 2, md: 8 },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              alignItems: 'center',
              minHeight: '100vh',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 6 },
              px: { xs: 2, md: 4 },
            }}
          >
            <motion.div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: { xs: 'center', md: 'left' },
              }}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.2 } },
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { type: "spring", stiffness: 100 },
                  },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem', lg: '3.75rem' },
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    color: theme.palette.text.primary,
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  Collect event feedback effortlessly.
                </Typography>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: '32rem',
                    mx: { xs: 'auto', md: 0 },
                    mt: 3,
                    fontSize: '1.125rem',
                    lineHeight: 1.75,
                    color: theme.palette.text.secondary,
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  Clean. Fast. Smart. FeedbackFlow gives you the tools to capture
                  valuable feedback instantly, turning audience opinions into
                  actionable data.
                </Typography>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  gap: '1rem',
                  marginTop: '2.5rem',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      px: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    Get Started Free →
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                alt="A professional demonstrating a product on a tablet"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: 8,
                  objectFit: 'cover',
                }}
              />
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        component="section"
        sx={{
          px: { xs: 3, md: 10 },
          py: 12,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Everything you need. Nothing you don't.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '1.125rem',
                mb: 8,
              }}
            >
              FeedbackFlow is packed with powerful features to make feedback
              collection a breeze.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: { xs: 4, md: 4 },
              maxWidth: '7xl',
              mx: 'auto',
            }}
          >
            {features.map((feature, idx) => (
              <Box
                key={idx}
                className="feature-card"
                sx={{
                  borderRadius: 4,
                  p: 3,
                  textAlign: 'left',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  backdropFilter: 'blur(8px)',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 48,
                    width: 48,
                    borderRadius: 2,
                    mb: 2,
                    color: feature.color,
                    backgroundColor: `${feature.color}33`,
                  }}
                >
                  <feature.Icon size={24} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: theme.palette.text.primary,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#242424',
          color: 'white',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >

        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{
            position: 'relative',
            maxWidth: '64rem',
            margin: '0 auto',
            padding: '0 1rem',
            zIndex: 10,
          }}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4.5rem' },
                fontWeight: 800,
                mb: 4,
                lineHeight: 1.2,
                background: 'linear-gradient(to right, white, #9ca3af)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              {["Elevate", "Your", "Feedback.", "Start", "Today."].map((word, index) => (
                <motion.span
                  key={index}
                  variants={itemVariants}
                  style={{ display: 'inline-block', marginRight: '0.5rem' }}
                >
                  {word}
                </motion.span>
              ))}
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, type: "spring" }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#d1d5db',
                maxWidth: '32rem',
                mx: 'auto',
                mb: 6,
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                lineHeight: 1.75,
              }}
            >
              Discover a better way to collect and analyze insights with beautifully designed and powerful feedback forms.
            </Typography>
          </motion.div>

          <motion.button
            component={Button}
            variant="contained"
            size="large"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
            sx={{
              px: 5,
              py: 2,
              borderRadius: 8,
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(to right, #374151, #111827)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              textTransform: 'none',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                background: 'linear-gradient(to right, #4b5563, #1f2937)',
              },
            }}
          >
            <div className='flex items-center'>
              <Sparkles style={{ animation: 'pulse 2s infinite', marginRight: '0.5rem' }} />
              Get Started Free
              <ArrowRight style={{ marginLeft: '1rem' }} />
            </div>
          </motion.button>
        </motion.div>
      </Box>
    </Box>
  );
}
