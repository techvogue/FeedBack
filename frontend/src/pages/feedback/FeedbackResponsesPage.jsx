import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import QuestionAnalytics from '../../components/feedback/QuestionAnalyticsChart';
import { getApiErrorMessage } from '../../utils/errorHandling';
import { notifyError, notifySuccess } from '../../utils/notify';

const AIFeedbackSummary = lazy(() => import('../../components/feedback/AIFeedbackSummary'));

const formatDate = dateString =>
  new Date(dateString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

const getQuestionMeta = (schema, qName) => {
  if (schema?.questions) {
    return schema.questions.find(q => q.name === qName);
  }
  if (Array.isArray(schema)) {
    return schema.find(q => q.name === qName);
  }
  if (schema?.pages) {
    for (const page of schema.pages) {
      const found = page.elements?.find(q => q.name === qName);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const getQuestionNumber = (schema, qName) => {
  if (schema?.questions) return schema.questions.findIndex(q => q.name === qName) + 1;
  if (Array.isArray(schema)) return schema.findIndex(q => q.name === qName) + 1;
  if (schema?.pages) {
    let counter = 1;
    for (const page of schema.pages) {
      for (const q of page.elements || []) {
        if (q.name === qName) return counter;
        counter++;
      }
    }
  }
  return '';
};

const renderAnswer = (answer, theme) => {
  // Handle file uploads - check if it's a string URL or an object with URL
  let fileUrl = null;
  let fileName = null;

  if (typeof answer === 'string' && answer.startsWith('http')) {
    fileUrl = answer;
    fileName = decodeURIComponent(answer.split('/').pop());
  } else if (typeof answer === 'object' && answer !== null) {
    // Handle case where file URL is stored as an object
    if (answer.fileUrl || answer.url) {
      fileUrl = answer.fileUrl || answer.url;
      fileName = answer.fileName || answer.name || decodeURIComponent(fileUrl.split('/').pop());
    } else if (answer.toString && answer.toString().startsWith('http')) {
      fileUrl = answer.toString();
      fileName = decodeURIComponent(fileUrl.split('/').pop());
    }
  }

  if (fileUrl) {
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.primary }}>📎 {fileName}</Typography>
        <Button
          variant="outlined"
          size="small"
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(25, 118, 210, 0.16)'
                : 'rgba(25, 118, 210, 0.08)'
            }
          }}
        >
          View
        </Button>
      </Box>
    );
  }

  if (Array.isArray(answer)) return answer.join(', ');
  if (typeof answer === 'object') return JSON.stringify(answer);
  if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
  return String(answer ?? '');
};

const FeedbackResponses = ({ eventId: propEventId, embedded = false }) => {
  const params = useParams();
  const eventId = propEventId || params.eventId || params.id;
  const navigate = useNavigate();
  const theme = useTheme();

  const [responses, setResponses] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('user');
  const [deleting, setDeleting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const [eventRes, respRes] = await Promise.all([
          axios.get(`/events/${eventId}`),
          axios.get(`/feedback/responses/${eventId}`)
        ]);
        const schemaData = eventRes.data?.feedbackForm?.schema || {};
        setSchema(schemaData);
        setResponses(respRes.data);
      } catch (error) {
        const message = error.response?.status === 403
          ? 'Not authorized to view responses.'
          : getApiErrorMessage(error, 'Failed to load responses.');
        setError(message);
        notifyError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const aggregates = useMemo(() => {
    if (!responses.length) return [];
    let elements = [];

    if (schema?.pages) {
      schema.pages.forEach(p => elements.push(...(p.elements || [])));
    } else if (Array.isArray(schema)) {
      elements = schema;
    } else if (schema?.questions) {
      elements = schema.questions;
    }

    const map = new Map();

    elements.forEach(el => el?.name && map.set(el.name, { question: el, answers: [] }));

    responses.forEach(resp => {
      Object.entries(resp.answers).forEach(([qName, answer]) => {
        if (!map.has(qName)) {
          const fallback = getQuestionMeta(schema, qName) || { name: qName, label: qName, type: 'text' };
          map.set(qName, { question: fallback, answers: [] });
        }
        map.get(qName).answers.push({
          answer, submittedBy: resp.user?.name || 'Anonymous', submittedAt: resp.submittedAt
        });
      });
    });

    return [...map.values()].sort((a, b) => {
      if (!elements.length) {
        return (a.question.label || a.question.name).localeCompare(b.question.label || b.question.name);
      }
      return elements.findIndex(e => e.name === a.question.name) - elements.findIndex(e => e.name === b.question.name);
    });
  }, [responses, schema]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback form and all responses?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/feedback/forms/${eventId}`);
      notifySuccess('Deleted successfully');
      navigate(-1);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to delete'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, color: theme.palette.text.primary }}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh'
      }}>
        <Typography sx={{ m: 3, color: theme.palette.error.main }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      backgroundColor: theme.palette.background.default,
      minHeight: embedded ? 'auto' : '100vh',
      p: embedded ? 0 : 3,
      width: '100%'
    }}>
      {!embedded && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.04)'
            }
          }}
          variant="outlined"
        >
          Back
        </Button>
      )}

      {/* Action Buttons */}
      <Box sx={{ textAlign: 'center', mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => setShowAnalytics(!showAnalytics)}
          startIcon={<AssessmentIcon />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          {showAnalytics ? 'Hide AI Insights' : 'Show AI Insights'}
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={deleting}
          sx={{
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark
            },
            '&:disabled': {
              backgroundColor: theme.palette.action.disabledBackground
            }
          }}
        >
          {deleting ? 'Deleting...' : 'Delete Form & Responses'}
        </Button>
      </Box>

      {/* AI-powered summary here - only load when AI insights is enabled */}
      {showAnalytics && (
        <Suspense
          fallback={(
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          )}
        >
          <AIFeedbackSummary eventId={eventId} />
        </Suspense>
      )}

      <Paper sx={{
        mt: embedded ? 0 : 3,
        p: 2,
        borderRadius: 0,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <Tabs
          value={viewMode}
          onChange={(e, val) => setViewMode(val)}
          centered
          sx={{
            '& .MuiTab-root': {
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main
            }
          }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="By User" value="user" />
          <Tab icon={<HelpOutlineIcon />} iconPosition="start" label="By Question" value="question" />
        </Tabs>
      </Paper>

      {/* Responses */}
      {responses.length === 0 ? (
        <Paper sx={{
          mt: 0,
          p: 5,
          borderRadius: 0,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <AssessmentIcon sx={{
            fontSize: 60,
            color: theme.palette.text.secondary
          }} />
          <Typography sx={{
            mt: 2,
            color: theme.palette.text.primary
          }}>
            No feedback responses yet.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mt: 0, width: '100%' }}>
          {viewMode === 'user' ? (
            responses.map((resp, i) => (
              <Paper key={resp.id} sx={{
                mb: 2,
                borderRadius: 0,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <Accordion sx={{
                  backgroundColor: 'transparent',
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.04)'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    backgroundColor: 'transparent'
                  }
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.text.primary }} />} sx={{ px: 5 }}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={`Response #${i + 1}`}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText
                        }}
                      />
                      <Typography sx={{ color: theme.palette.text.primary }}>
                        {resp.user?.name || 'Anonymous'}
                      </Typography>
                      <Typography sx={{
                        ml: 'auto',
                        color: theme.palette.text.secondary
                      }}>
                        {formatDate(resp.submittedAt)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 3, sm: 4, md: 6 }, py: 2.5 }}>
                    {Object.entries(resp.answers).map(([qName, answer]) => {
                      const qMeta = getQuestionMeta(schema, qName);
                      const qNum = getQuestionNumber(schema, qName);
                      return (
                        <Box key={qName} sx={{ mb: 2 }}>
                          <Typography sx={{
                            fontWeight: 'bold',
                            color: theme.palette.text.primary
                          }}>
                            {`Q${qNum}. ${qMeta?.title || qMeta?.label || qName}`}
                          </Typography>
                          <Typography sx={{ color: theme.palette.text.primary }}>
                            {renderAnswer(answer, theme)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              </Paper>
            ))
          ) : (
            aggregates.map(({ question, answers }, idx) => (
              <Paper key={question.name || idx} sx={{
                mb: 2,
                borderRadius: 0,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <Accordion sx={{
                  backgroundColor: 'transparent',
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.04)'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    backgroundColor: 'transparent'
                  }
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.text.primary }} />} sx={{ px: 5 }}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={`Q${idx + 1}. ${question.title || question.label || question.name}`}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText
                        }}
                      />
                      <Typography sx={{ color: theme.palette.text.primary }}>
                        {`(${answers.length} responses)`}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 3, sm: 4, md: 5 }, py: 2.5 }}>
                    <QuestionAnalytics
                      question={question}
                      answers={answers.map(a => a.answer)}
                    />

                    <Typography sx={{
                      mt: 2,
                      fontWeight: 'bold',
                      color: theme.palette.text.primary
                    }}>
                      Individual Responses:
                    </Typography>
                    {answers.map((a, i) => (
                      <Box key={i} sx={{
                        mt: 1,
                        mb: 1,
                        p: 1,
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                        borderRadius: 0,
                        border: `1px solid ${theme.palette.divider}`
                      }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {`${a.submittedBy} (${formatDate(a.submittedAt)})`}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.primary }}>
                          {renderAnswer(a.answer, theme)}
                        </Typography>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Paper>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default FeedbackResponses;