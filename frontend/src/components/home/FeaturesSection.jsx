import { Box, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

export default function FeaturesSection({ features }) {
    const theme = useTheme();

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
                                fontFamily: '"Inter", "Roboto", sans-serif',
                            }}
                        >
                            Features
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
                            {'Powerful tools for better feedback'.split('').map((char, idx) => (
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
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                        gap: { xs: 3, md: 4 },
                    }}
                >
                    {features.map((feature, idx) => {
                        return (
                            <motion.div
                                key={idx}
                                className="feature-card"
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: idx * 0.06 }}
                                viewport={{ once: true, amount: 0.25 }}
                                whileHover={{ y: -10, transition: { duration: 0.22, ease: 'easeOut' } }}
                                style={{
                                    borderRadius: '16px',
                                    padding: '24px',
                                    textAlign: 'left',
                                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '100px',
                                        height: '100px',
                                        background: idx % 2 === 0
                                            ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), transparent)'
                                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), transparent)',
                                        borderRadius: '50%',
                                        transform: 'translate(40%, -40%)',
                                        pointerEvents: 'none',
                                    }}
                                />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: 56,
                                        width: 56,
                                        borderRadius: '12px',
                                        mb: 2,
                                        color: '#FFFFFF',
                                        backgroundColor: '#1F1F1F',
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <feature.Icon size={28} />
                                </Box>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.35, delay: idx * 0.08 + 0.18, ease: 'easeOut' }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 800,
                                            mb: 1.5,
                                            color: theme.palette.text.primary,
                                            fontSize: '1.15rem',
                                            fontFamily: '"Inter", sans-serif',
                                            letterSpacing: '-0.01em',
                                            transition: 'all 0.3s ease',
                                            '&': {
                                                backgroundImage: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.1), transparent)',
                                                backgroundPosition: '0% center',
                                            }
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            lineHeight: 1.7,
                                            fontSize: '0.95rem',
                                            fontWeight: 400,
                                        }}
                                    >
                                        {feature.desc}
                                    </Typography>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </Box>
            </Container>
        </Box>
    );
}
