import { Box, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

export default function HowItWorksSection({ steps }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

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
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <Typography
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: theme.palette.text.secondary,
              mb: 1,
            }}
          >
            Process
          </Typography>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
                    staggerChildren: 0.03,
                    delayChildren: 0.12,
                  },
                },
              }}
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 900,
                mb: 1.5,
                color: theme.palette.text.primary,
                lineHeight: 1.2,
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '0.01em',
              }}
            >
              {'Get started in 4 simple steps'.split('').map((char, idx) => (
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

        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          {steps.map((step, idx) => {
            const stepAccent = isDarkMode ? '#FFFFFF' : '#1F1F1F';
            const stepTextColor = isDarkMode ? '#000000' : '#FFFFFF';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{
                  display: 'flex',
                  gap: '2rem',
                  marginBottom: idx < 3 ? '2rem' : 0,
                  position: 'relative',
                }}
              >
                {idx < 3 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '24px',
                      top: '60px',
                      width: '2px',
                      height: '60px',
                      backgroundColor: stepAccent,
                    }}
                  />
                )}
                <Box
                  sx={{
                    minWidth: '56px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: stepAccent,
                    color: stepTextColor,
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.85)' : '1px solid rgba(0, 0, 0, 0.15)',
                    boxShadow: isDarkMode
                      ? '0 10px 24px rgba(255, 255, 255, 0.22), inset 0 6px 12px rgba(255, 255, 255, 0.7), inset 0 -6px 12px rgba(0, 0, 0, 0.12)'
                      : '0 8px 20px rgba(0, 0, 0, 0.28), inset 0 4px 8px rgba(255, 255, 255, 0.08), inset 0 -4px 8px rgba(0, 0, 0, 0.22)',
                    flexShrink: 0,
                  }}
                >
                  {step.number}
                </Box>
                <Box sx={{ pt: 1, pb: 2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5, color: theme.palette.text.primary }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                    {step.desc}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
