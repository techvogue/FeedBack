import { Box, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

export default function TestimonialsSection({ testimonials }) {
  const theme = useTheme();
  const ratingColor = '#CA8A04';
  const nameBlue = '#2563EB';

  return (
    <Box
      component="section"
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 8, md: 12 },
        background: 'transparent',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
          >
            <Typography
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '0.7rem',
                fontWeight: 900,
                color: theme.palette.text.secondary,
                mb: 1.5,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Testimonials
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
          >
            <Typography
              component={motion.h2}
              variant="h2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.02,
                    delayChildren: 0.06,
                  },
                },
              }}
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 900,
                mb: 0,
                color: theme.palette.text.primary,
                lineHeight: 1.2,
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '0.01em',
              }}
            >
              {'What our users say'.split('').map((char, idx) => (
                <motion.span
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  style={{ display: 'inline-block', marginRight: char === ' ' ? '0.25em' : '0' }}
                >
                  {char}
                </motion.span>
              ))}
            </Typography>
          </motion.div>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 },
          }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: theme.palette.mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.15)', transition: { duration: 0.22, ease: 'easeOut' } }}
              style={{
                padding: '32px',
                borderRadius: '16px',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.38, delay: idx * 0.08 + 0.12, ease: 'easeOut' }}
              >
                <Typography sx={{ fontSize: '1.1rem', mb: 3, color: ratingColor, fontWeight: 800, letterSpacing: '0.05em' }}>⭐ 5.0 / 5.0</Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: idx * 0.08 + 0.18, ease: 'easeOut' }}
              >
                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 5,
                    lineHeight: 1.9,
                    fontStyle: 'italic',
                    fontSize: '0.98rem',
                    fontWeight: 500,
                  }}
                >
                  "{testimonial.quote}"
                </Typography>
              </motion.div>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 + 0.24, type: 'spring', stiffness: 240, damping: 18 }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #FCA5A5, #F87171)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      boxShadow: '0 8px 16px rgba(248, 113, 113, 0.3)',
                    }}
                  >
                    {testimonial.avatar}
                  </Box>
                </motion.div>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: nameBlue, fontSize: '1rem', letterSpacing: '-0.01em' }}>
                    {testimonial.author}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', mt: 0.5 }}>
                    {testimonial.role}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
