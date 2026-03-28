import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import FeaturesSection from '../components/home/FeaturesSection';

import HeroSection from '../components/home/HeroSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import StatsSection from '../components/home/StatsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import { features, stats, steps, testimonials } from '../components/home/homeData';

export default function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'relative',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #111111 0%, #2a2a2a 100%)'
          : 'linear-gradient(135deg, #f8f8f8 0%, #efefef 100%)',
        color: theme.palette.text.primary,
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        overflowX: 'hidden',
      }}
    >
      <HeroSection onRegister={() => navigate('/register')} />
      <FeaturesSection features={features} />
      <StatsSection stats={stats} />
      <HowItWorksSection steps={steps} />
      <TestimonialsSection testimonials={testimonials} />
    </Box>
  );
}
