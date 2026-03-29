import { Box, Button, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

void motion;

export default function HeroSection({ onRegister }) {
    const theme = useTheme();

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                background: 'transparent',
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
                            visible: { transition: { staggerChildren: 0.12 } },
                        }}
                    >
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, x: -50 },
                                visible: {
                                    opacity: 1,
                                    x: 0,
                                    transition: { type: 'spring', stiffness: 140, damping: 18 },
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
                                visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
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
                                Clean. Fast. Smart. FeedbackFlow gives you the tools to capture valuable feedback instantly, turning audience opinions into actionable data.
                            </Typography>
                        </motion.div>

                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
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
                                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={onRegister}
                                    sx={{
                                        px: 5,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            boxShadow: 4,
                                        },
                                    }}
                                >
                                    Get Started
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 130, damping: 20, delay: 0.1 }}
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
    );
}
