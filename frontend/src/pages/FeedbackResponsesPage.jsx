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
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import QuestionAnalytics from '../components/QuestionAnalyticsChart';
import AIFeedbackSummary from '../components/AIFeedbackSummary';


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


const renderAnswer = answer => {
  if (typeof answer === 'string' && answer.startsWith('http')) {
    const fileName = decodeURIComponent(answer.split('/').pop());
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>📎 {fileName}</Typography>
        <Button variant="outlined" size="small" href={answer} target="_blank" rel="noopener noreferrer"
          sx={{ borderColor: '#3498db', color: '#3498db', '&:hover': { borderColor: '#2980b9', backgroundColor: 'rgba(52, 152, 219, 0.08)' } }}>
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


const FeedbackResponses = () => {
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
        setError('');
        const [eventRes, respRes] = await Promise.all([
          axios.get(`/events/${eventId}`),
          axios.get(`/feedback/responses/${eventId}`)
        ]);
        setEvent(eventRes.data);
        const schemaData = eventRes.data?.feedbackForm?.schema || {};
        setSchema(schemaData);
        setResponses(respRes.data);
      } catch (error) {
        setError(error.response?.status === 403 ? 'Not authorized to view responses.' : 'Failed to load responses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const getQuestionAggregates = () => {
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
  };

  const aggregates = getQuestionAggregates();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback form and all responses?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/feedback/forms/${eventId}`);
      alert('Deleted successfully');
      navigate(-1);
    } catch {
      alert('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4">{event?.title || 'Event'}</Typography>
      </Box>

      {/* AI-powered summary here */}
      <AIFeedbackSummary eventId={eventId} />

      <Paper sx={{ mt: 3, p: 2, borderRadius: 2 }}>
        <Tabs value={viewMode} onChange={(e, val) => setViewMode(val)} centered>
          <Tab icon={<PersonIcon />} iconPosition="start" label="By User" value="user" />
          <Tab icon={<HelpOutlineIcon />} iconPosition="start" label="By Question" value="question" />
        </Tabs>
      </Paper>

      {/* Responses */}
      {responses.length === 0 ? (
        <Paper sx={{ mt: 3, p: 5, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 60, color: 'gray' }} />
          <Typography sx={{ mt: 2 }}>No feedback responses yet.</Typography>
        </Paper>
      ) : (
        <Box sx={{ mt: 3 }}>
          {viewMode === 'user' ? (
            responses.map((resp, i) => (
              <Paper key={resp.id} sx={{ mb: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={`Response #${i + 1}`} />
                      <Typography>{resp.user?.name || 'Anonymous'}</Typography>
                      <Typography sx={{ ml: 'auto' }}>{formatDate(resp.submittedAt)}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(resp.answers).map(([qName, answer]) => {
                      const qMeta = getQuestionMeta(schema, qName);
                      const qNum = getQuestionNumber(schema, qName);
                      return (
                        <Box key={qName} sx={{ mb: 2 }}>
                          <Typography sx={{ fontWeight: 'bold' }}>{`Q${qNum}. ${qMeta?.title || qMeta?.label || qName}`}</Typography>
                          <Typography>{renderAnswer(answer)}</Typography>
                        </Box>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              </Paper>
            ))
          ) : (
            aggregates.map(({ question, answers }, idx) => (
              <Paper key={question.name || idx} sx={{ mb: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={`Q${idx + 1}. ${question.title || question.label || question.name}`} />
                      <Typography>{`(${answers.length} responses)`}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <QuestionAnalytics
                      question={question}
                      answers={answers.map(a => a.answer)}
                    />

                    <Typography sx={{ mt: 2, fontWeight: 'bold' }}>Individual Responses:</Typography>
                    {answers.map((a, i) => (
                      <Box key={i} sx={{ mt: 1, mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption">{`${a.submittedBy} (${formatDate(a.submittedAt)})`}</Typography>
                        <Typography>{renderAnswer(a.answer)}</Typography>
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
