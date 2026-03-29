import { Box, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

function AnimatedStatNumber({ value }) {
    const containerRef = useRef(null);
    const [displayValue, setDisplayValue] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    const parsedValue = useMemo(() => {
        const match = String(value).match(/^(\d+(?:\.\d+)?)(.*)$/);
        if (!match) {
            return { target: 0, suffix: String(value), decimals: 0 };
        }

        const [, numericPart, suffix] = match;
        const decimalPart = numericPart.includes('.') ? numericPart.split('.')[1] : '';

        return {
            target: Number(numericPart),
            suffix,
            decimals: decimalPart.length,
        };
    }, [value]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasStarted) return;

        const duration = 1100;
        const startTime = performance.now();
        let animationFrameId;

        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const nextValue = parsedValue.target * easedProgress;

            setDisplayValue(nextValue);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(updateValue);
            }
        };

        animationFrameId = requestAnimationFrame(updateValue);

        return () => cancelAnimationFrame(animationFrameId);
    }, [hasStarted, parsedValue.target]);

    const formattedNumber = parsedValue.decimals > 0
        ? displayValue.toFixed(parsedValue.decimals)
        : Math.round(displayValue).toString();

    return (
        <span ref={containerRef}>
            {formattedNumber}{parsedValue.suffix}
        </span>
    );
}

export default function StatsSection({ stats }) {
    const theme = useTheme();

    return (
        <Box
            component="section"
            sx={{
                px: { xs: 2, md: 4 },
                py: { xs: 8, md: 12 },
                background: 'transparent',
                position: 'relative',
                overflow: 'visible',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-20%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-30%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
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
                            Statistics
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
                            {'Trusted by teams worldwide'.split('').map((char, idx) => (
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
                        gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                        gap: { xs: 3, md: 4 },
                    }}
                >
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.85 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.22, ease: 'easeOut' } }}
                            style={{
                                padding: '32px 24px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                border: 'none',
                                backgroundColor: 'transparent',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    mb: 2,
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 0.1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: idx * 0.08 + 0.12, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute',
                                        width: '100px',
                                        height: '100px',
                                        background: idx % 2 === 0 ? 'radial-gradient(circle, #2563EB, transparent)' : 'radial-gradient(circle, #EF4444, transparent)',
                                        borderRadius: '50%',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: -1,
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: { xs: '2.2rem', md: '3rem' },
                                        fontWeight: 900,
                                        background: idx % 2 === 0 ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1,
                                        fontFamily: '"Inter", sans-serif',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    <AnimatedStatNumber value={stat.number} />
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.03em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {stat.label}
                            </Typography>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
