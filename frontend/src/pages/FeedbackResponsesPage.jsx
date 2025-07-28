import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import QuestionAnalyticsChart from '../components/QuestionAnalyticsChart';

const formatDate = dateString =>
  new Date(dateString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

const getQuestionMeta = (schema, qName) => {
  if (schema?.questions) return schema.questions.find(q => q.name === qName);
  if (Array.isArray(schema)) return schema.find(q => q.name === qName);
  if (schema?.pages) {
    for (const page of schema.pages) {
      const found = page.elements?.find(q => q.name === qName);
      if (found) return found;
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

const renderAnswer = answer => {
  if (typeof answer === 'string' && answer.startsWith('http')) {
    const fileName = decodeURIComponent(answer.split('/').pop());
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>📎 {fileName}</Typography>
        <Button variant="outlined" size="small" href={answer} target="_blank" rel="noopener noreferrer"
          sx={{ borderColor: '#3498db', color: '#3498db', '&:hover': { borderColor: '#2980b9', backgroundColor: 'rgba(52, 152, 219, 0.08)' } }}>
          View File
        </Button>
      </Box>
    );
  }
  if (Array.isArray(answer)) return answer.join(', ');
  if (typeof answer === 'object') return JSON.stringify(answer);
  if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
  return String(answer ?? '');
};

const FeedbackResponsesPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);

  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('user');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Fetch] Loading event and responses...');
        setError('');
        const [eventRes, respRes] = await Promise.all([
          axios.get(`/events/${eventId}`),
          axios.get(`/feedback/responses/${eventId}`)
        ]);
        setEvent(eventRes.data);
        console.log('[Fetch] Event:', eventRes.data);
        console.log('[Fetch] Responses:', respRes.data);

        const qSchema = eventRes.data.feedbackForm?.schema;
        setSchema(qSchema);
        setResponses(respRes.data);
      } catch (err) {
        console.error('[Fetch Error]', err);
        setError(err.response?.status === 403 ? 'Not authorized to view responses.' : 'Failed to load feedback responses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const getQuestionsAndAnswers = () => {
    if (!responses.length) return [];
    console.log('[Analytics] Building questions and answers aggregate...');

    let elements = [];
    if (schema?.pages) schema.pages.forEach(p => elements.push(...(p.elements || [])));
    else if (Array.isArray(schema)) elements = schema;
    else if (schema?.questions) elements = schema.questions;

    const map = new Map();

    for (const el of elements) {
      if (el?.name) map.set(el.name, { question: el, answers: [] });
    }

    responses.forEach(resp => {
      Object.entries(resp.answers).forEach(([qName, answer]) => {
        if (!map.has(qName)) {
          const fallbackMeta = getQuestionMeta(schema, qName) || { name: qName, label: qName };
          map.set(qName, { question: fallbackMeta, answers: [] });
        }
        map.get(qName).answers.push({
          answer,
          submittedBy: resp.user?.name || 'Anonymous',
          submittedAt: resp.submittedAt
        });
      });
    });

    const sorted = Array.from(map.values()).sort((a, b) => {
      if (!elements.length) return (a.question.label || a.question.name).localeCompare(b.question.label || b.question.name);
      return elements.findIndex(e => e.name === a.question.name) - elements.findIndex(e => e.name === b.question.name);
    });

    console.log('[Analytics] Sorted Questions:', sorted.map(q => q.question.name));
    return sorted;
  };

  const handleDeleteForm = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback form and all its responses?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/feedback/forms/${eventId}`);
      alert('Feedback form and all responses deleted.');
      navigate(-1);
    } catch (err) {
      console.error('[Delete Error]', err);
      alert('Failed to delete feedback form.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
      <CircularProgress sx={{ color: '#3498db' }} />
      <Typography variant="body1" sx={{ color: '#7f8c8d' }}>Loading feedback responses...</Typography>
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  const questionAggregates = getQuestionsAndAnswers();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.25)', '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.09)' } }}>
            Back
          </Button>
          {user?.id === event?.ownerId && (
            <Button startIcon={<DeleteIcon />} onClick={handleDeleteForm} variant="contained" color="error" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Form'}
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.25)', mb: 1 }}>Feedback Responses</Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{event?.title}</Typography>
        </Box>

        <Paper sx={{ mb: 3, background: 'rgba(255,255,255,0.98)', borderRadius: 3 }}>
          <Tabs value={viewMode} onChange={(e, nv) => setViewMode(nv)} centered>
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon /> Responses by User</Box>} value="user" />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><HelpOutlineIcon /> Responses by Question</Box>} value="question" />
          </Tabs>
        </Paper>

        {!responses.length ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <AssessmentIcon sx={{ fontSize: 64, color: '#bdc3c7', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#7f8c8d' }}>No Responses Yet</Typography>
            <Typography variant="body1" sx={{ color: '#95a5a6' }}>Share your feedback form to start receiving responses!</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {viewMode === 'user' && responses.map((resp, idx) => (
              <Paper key={resp.id} sx={{ borderRadius: 3 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                      <Chip label={`Response #${idx + 1}`} color="primary" size="small" />
                      <Typography variant="body2">{resp.user?.name || 'Anonymous'}</Typography>
                      <Typography variant="body2" sx={{ ml: 'auto' }}>{formatDate(resp.submittedAt)}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ p: 2 }}>
                      {Object.entries(resp.answers).map(([qName, answer]) => {
                        const qMeta = getQuestionMeta(schema, qName);
                        const qNum = getQuestionNumber(schema, qName);
                        return (
                          <Box key={qName} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{`Q${qNum}. ${qMeta?.title || qMeta?.label || qMeta?.question || qName}`}</Typography>
                            <Box sx={{ background: '#f8f9fa', p: 1.5, borderRadius: 1 }}>{renderAnswer(answer)}</Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            ))}

            {viewMode === 'question' && questionAggregates.map(({ question, answers }, idx) => (
              <Paper key={question.name || idx} sx={{ borderRadius: 3 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip label={`Q${idx + 1}. ${question.title || question.label || question.question || question.name}`} color="secondary" size="small" />
                      <Typography variant="body2">({answers.length} responses)</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ p: 2 }}>
                      {(() => {
                        console.log('[Chart Render] Question:', question);
                        console.log('[Chart Render] Type:', question.type);
                        console.log('[Chart Render] Answers:', answers.map(a => a.answer));
                        return (
                          <QuestionAnalyticsChart
                            question={question}
                            answers={answers.map(a => a.answer)}
                          />
                        );
                      })()}

                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>Individual Responses:</Typography>
                      {answers.map((qa, i) => (
                        <Box key={i} sx={{ mb: 2, pb: 1, borderBottom: '1px dashed #e0e0e0' }}>
                          <Typography variant="caption">{qa.submittedBy} - {formatDate(qa.submittedAt)}</Typography>
                          <Box sx={{ p: 1, mt: 1, background: '#fdfdfe', borderRadius: 1 }}>{renderAnswer(qa.answer)}</Box>
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FeedbackResponsesPage;
