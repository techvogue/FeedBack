import {
  Assessment as AssessmentIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Share as ShareIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import FeedbackFormCreator from '../../components/feedback/FeedbackFormCreator';
import { useFeedbackForm } from '../../hooks/useFeedbackForm';
import { getApiErrorMessage } from '../../utils/errorHandling';
import { notifyError } from '../../utils/notify';

const FeedbackResponsesPage = lazy(() => import('../feedback/FeedbackResponsesPage'));

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardManageRoute = location.pathname.startsWith('/dashboard/my-events/');

  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasFeedbackForm, refresh: refreshFeedbackForm } = useFeedbackForm(id);
  const [previewFormData, setPreviewFormData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const basePath = isDashboardManageRoute ? `/dashboard/my-events/${id}` : `/events/${id}`;
  const currentPath = location.pathname.replace(/\/+$/, '');
  const requestedSection = useMemo(() => {
    if (currentPath === `${basePath}/edit-feedback`) return 'edit-feedback';
    if (currentPath === `${basePath}/preview-form`) return 'preview-form';
    if (currentPath === `${basePath}/responses`) return 'responses';
    if (currentPath === `${basePath}/share-form`) return 'share-form';
    return 'details';
  }, [basePath, currentPath]);
  const isOwner = Boolean(user && event && event.owner?.id === user.id);
  const canManageEvent = Boolean(isOwner && isDashboardManageRoute);
  const activeSection = canManageEvent ? requestedSection : 'details';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${id}`);
        setEvent(response.data);


      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to load event details');
        setError(message);
        notifyError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchPreview = async () => {
      if (activeSection !== 'preview-form') return;
      if (!hasFeedbackForm) {
        setPreviewFormData(null);
        return;
      }

      setPreviewLoading(true);
      try {
        const response = await axios.get(`/feedback/forms/${id}`);
        setPreviewFormData(response.data);
      } catch {
        setPreviewFormData(null);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [activeSection, hasFeedbackForm, id]);

  useEffect(() => {
    if (!canManageEvent && requestedSection !== 'details') {
      navigate(basePath, { replace: true });
    }
  }, [basePath, canManageEvent, navigate, requestedSection]);

  const handleFormSaved = () => {
    refreshFeedbackForm();
    navigate(`${basePath}/preview-form`);
  };

  const handleGiveFeedback = () => {
    navigate(`/feedback/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Event not found</Typography>
      </Box>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString();
  const formattedTime = new Date(event.date).toLocaleTimeString();
  const feedbackUrl = `${window.location.origin}/feedback/${id}`;

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      background: theme.palette.background.default
    }}>
      {/* Left Drawer (management only) */}
      {canManageEvent && (
        <Box sx={{
          width: { xs: 0, md: 260 },
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          p: { md: 3 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 2,
        }}>
          <List sx={{ p: 0 }}>
            <ListItem button onClick={() => navigate(basePath)} sx={{ mb: 1, borderRadius: 1, backgroundColor: activeSection === 'details' ? theme.palette.action.selected : 'transparent' }}>
              <ListItemIcon sx={{ minWidth: 40, color: activeSection === 'details' ? theme.palette.primary.main : theme.palette.text.secondary }}>
                <EventIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Event Detail"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: activeSection === 'details'
                      ? theme.palette.primary.main
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary),
                  }
                }}
              />
            </ListItem>

            <ListItem button onClick={() => navigate(`${basePath}/edit-feedback`)} sx={{ mb: 1, borderRadius: 1, backgroundColor: activeSection === 'edit-feedback' ? theme.palette.action.selected : 'transparent' }}>
              <ListItemIcon sx={{ minWidth: 40, color: activeSection === 'edit-feedback' ? theme.palette.primary.main : theme.palette.text.secondary }}>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Edit Feedback Form"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: activeSection === 'edit-feedback'
                      ? theme.palette.primary.main
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary),
                  }
                }}
              />
            </ListItem>

            <ListItem button onClick={() => navigate(`${basePath}/preview-form`)} sx={{ mb: 1, borderRadius: 1, backgroundColor: activeSection === 'preview-form' ? theme.palette.action.selected : 'transparent' }}>
              <ListItemIcon sx={{ minWidth: 40, color: activeSection === 'preview-form' ? theme.palette.primary.main : theme.palette.text.secondary }}>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Preview Form"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: activeSection === 'preview-form'
                      ? theme.palette.primary.main
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary),
                  }
                }}
              />
            </ListItem>

            <ListItem button onClick={() => navigate(`${basePath}/responses`)} sx={{ mb: 1, borderRadius: 1, backgroundColor: activeSection === 'responses' ? theme.palette.action.selected : 'transparent' }}>
              <ListItemIcon sx={{ minWidth: 40, color: activeSection === 'responses' ? theme.palette.primary.main : theme.palette.text.secondary }}>
                <AssessmentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="View Analysis"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: activeSection === 'responses'
                      ? theme.palette.primary.main
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary),
                  }
                }}
              />
            </ListItem>

            <ListItem button onClick={() => navigate(`${basePath}/share-form`)} sx={{ mb: 1, borderRadius: 1, backgroundColor: activeSection === 'share-form' ? theme.palette.action.selected : 'transparent' }}>
              <ListItemIcon sx={{ minWidth: 40, color: activeSection === 'share-form' ? theme.palette.primary.main : theme.palette.text.secondary }}>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Share Form"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: activeSection === 'share-form'
                      ? theme.palette.primary.main
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary),
                  }
                }}
              />
            </ListItem>
          </List>
        </Box>
      )}

      {/* Right Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          ...(activeSection === 'responses'
            ? { px: 0, py: { xs: 2, sm: 3, md: 4 } }
            : { p: { xs: 2, sm: 3, md: 4 } }),
        }}
      >
        {activeSection === 'details' && (
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
            <Box component="img" src={event.bannerUrl} alt={event.title} sx={{ width: '100%', height: 320, objectFit: 'cover' }} />
            <Box sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{event.title}</Typography>
              <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>{event.description}</Typography>
              <Typography sx={{ mb: 1 }}><strong>Date:</strong> {formattedDate}</Typography>
              <Typography sx={{ mb: 1 }}><strong>Time:</strong> {formattedTime}</Typography>
              <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>
                Organized by: {event.owner?.name || 'Unknown'} ({event.owner?.email})
              </Typography>

              {!isOwner && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="outlined" onClick={handleGiveFeedback}>Give Feedback</Button>
                </Box>
              )}

              {isOwner && !canManageEvent && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/dashboard/my-events/${id}`)}
                  >
                    Manage This Event in Dashboard
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {activeSection === 'edit-feedback' && (
          isOwner ? (
            <FeedbackFormCreator
              eventId={id}
              onSave={handleFormSaved}
              onCancel={() => navigate(basePath)}
            />
          ) : (
            <Alert severity="warning">Only event owners can edit feedback forms.</Alert>
          )
        )}

        {activeSection === 'preview-form' && (
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Preview Form</Typography>
            {previewLoading ? (
              <CircularProgress />
            ) : !hasFeedbackForm ? (
              <Alert severity="info">No feedback form created yet.</Alert>
            ) : (
              <Box>
                {previewFormData?.schema?.pages?.[0]?.elements?.map((q, idx) => (
                  <Paper key={q.name || idx} sx={{ p: 2, mb: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>{idx + 1}. {q.title || q.name}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Type: {q.type}</Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        )}

        {activeSection === 'responses' && (
          <Suspense
            fallback={(
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            )}
          >
            <FeedbackResponsesPage eventId={id} embedded />
          </Suspense>
        )}

        {activeSection === 'share-form' && (
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Share Form</Typography>
            {!hasFeedbackForm ? (
              <Alert severity="info">Create a feedback form first to share it.</Alert>
            ) : (
              <>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Paper sx={{ display: 'inline-flex', p: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <QRCodeSVG
                      value={feedbackUrl}
                      size={180}
                      bgColor={theme.palette.background.paper}
                      fgColor={theme.palette.text.primary}
                    />
                  </Paper>
                  <Typography sx={{ mt: 1, color: theme.palette.text.secondary }}>
                    Scan this QR code to open the feedback form
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    width: '100%',
                    maxWidth: 620,
                    mx: 'auto',
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography
                    title={feedbackUrl}
                    sx={{
                      px: 1.5,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                    }}
                  >
                    {feedbackUrl}
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => navigator.clipboard?.writeText(feedbackUrl)}
                    sx={{
                      minWidth: 120,
                      borderRadius: 2,
                      color: theme.palette.primary.contrastText,
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        )}
      </Box>

    </Box>
  );
};

export default EventDetail;
