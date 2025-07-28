import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
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

// --- Utility: Format Date ---
const formatDate = dateString =>
  new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

// --- Helper to get question meta from schema by field name ---
function getQuestionMeta(schema, qName) {
  if (schema && Array.isArray(schema.questions)) {
    return schema.questions.find(q => q.name === qName);
  }
  if (schema && Array.isArray(schema)) {
    return schema.find(q => q.name === qName);
  }
  if (schema && schema.pages) {
    for (const page of schema.pages) {
      if (!page.elements) continue;
      const found = page.elements.find(q => q.name === qName);
      if (found) return found;
    }
  }
  return null;
}

// --- Helper to get Q number for display ---
function getQuestionNumber(schema, qName) {
  if (schema && Array.isArray(schema.questions)) {
    const idx = schema.questions.findIndex(q => q.name === qName);
    return idx !== -1 ? idx + 1 : '';
  }
  if (schema && Array.isArray(schema)) {
    const idx = schema.findIndex(q => q.name === qName);
    return idx !== -1 ? idx + 1 : '';
  }
  if (schema && schema.pages) {
    let counter = 1;
    for (const page of schema.pages) {
      if (!page.elements) continue;
      for (const q of page.elements) {
        if (q.name === qName) return counter;
        counter += 1;
      }
    }
  }
  return '';
}

const renderAnswer = answer => {
  if (typeof answer === "string" && (answer.startsWith("http") || answer.startsWith("https"))) {
    const fileName = decodeURIComponent(answer.split("/").pop());
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📎 {fileName}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          href={answer}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            borderColor: "#3498db",
            color: "#3498db",
            "&:hover": { borderColor: "#2980b9", backgroundColor: "rgba(52, 152, 219, 0.08)" },
          }}
        >
          View File
        </Button>
      </Box>
    );
  }
  if (Array.isArray(answer)) return answer.join(", ");
  if (typeof answer === "object" && answer !== null) return JSON.stringify(answer);
  if (typeof answer === "boolean") return answer ? "Yes" : "No";
  if (typeof answer === "number") return answer.toString();
  return String(answer ?? "");
};

const FeedbackResponsesPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [schema, setSchema] = useState([]); // stores form schema
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("user"); // "user" or "question"

  // Fetch event details, feedback answers & schema
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [eventRes, respRes] = await Promise.all([
          axios.get(`/events/${eventId}`),
          axios.get(`/feedback/responses/${eventId}`),
        ]);
        setEvent(eventRes.data);
        // Extract schema from event or /feedback-form/:eventId
        let qSchema = [];
        if (eventRes.data.feedbackForm?.schema) {
          qSchema = eventRes.data.feedbackForm.schema;
        } else {
          try {
            const formRes = await axios.get(`/feedback-form/${eventId}`);
            qSchema = formRes.data.schema || [];
          } catch {}
        }
        setSchema(qSchema);
        setResponses(respRes.data);
      } catch (err) {
        if (err.response?.status === 403) setError("Not authorized to view responses.");
        else setError("Failed to load feedback responses.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [eventId]);

  // --- For "question" view: group all answers by question name, supporting all schema shapes ---
  const getQuestionsAndAnswers = () => {
    if (!responses.length) return [];
    // Dynamically flatten all valid schema shapes
    let elements = [];
    if (schema && schema.pages) {
      schema.pages.forEach(page => {
        if (page.elements) elements = elements.concat(page.elements);
      });
    }
    // Fallback: flat array
    if (!elements.length && Array.isArray(schema)) { elements = schema; }
    // Fallback: custom schema.questions (YOUR main schema shape)
    if (!elements.length && Array.isArray(schema.questions)) { elements = schema.questions; }

    // DEV DEBUG: show what elements we are about to map
    console.log("[FeedbackResponsesPage] elements for mapping:", elements);

    // Build map: name -> { question, answers: [...] }
    const map = new Map();

    // Put all known questions from schema with their metadata in map
    if (elements.length) {
      elements.forEach(el => {
        if (el && el.name) {
          map.set(el.name, { question: el, answers: [] });
        }
      });
    }
    // Add answers to each question
    responses.forEach(resp => {
      Object.entries(resp.answers).forEach(([qName, answer]) => {
        if (!map.has(qName)) {
          let fallbackMeta = { name: qName, label: qName, type: 'text' };
          if (Array.isArray(schema.questions)) {
            const found = schema.questions.find(q => q.name === qName);
            if (found) fallbackMeta = found;
          }
          if (elements.length) {
            const found = elements.find(q => q.name === qName);
            if (found) fallbackMeta = found;
          }
          map.set(qName, { question: fallbackMeta, answers: [] });
        }
        map.get(qName).answers.push({
          answer: answer,
          submittedBy: resp.user?.name || "Anonymous",
          submittedAt: resp.submittedAt,
        });
      });
    });

    // Output as array in schema order, fallback by question label
    const arr = [];
    map.forEach(v => arr.push(v));
    arr.sort((a, b) => {
      if (!elements.length) {
        const labelA = a.question.label || a.question.name;
        const labelB = b.question.label || b.question.name;
        return labelA.localeCompare(labelB);
      }
      return (elements.findIndex(e => e.name === a.question.name) - elements.findIndex(e => e.name === b.question.name));
    });
    return arr;
  };

  const questionAggregates = getQuestionsAndAnswers();

  // --- Tab logic ---
  const handleTabChange = (e, nv) => setViewMode(nv);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress sx={{ color: "#3498db" }} />
        <Typography variant="body1" sx={{ color: "#7f8c8d" }}>Loading feedback responses...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2, background: "#fdf2f2", color: "#c53030", "& .MuiAlert-icon": { color: "#c53030" } }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      py: 4, px: 2
    }}>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* Back Btn + Title */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.25)",
              "&:hover": { borderColor: "white", background: "rgba(255,255,255,0.09)" }
            }}
          >
            Back
          </Button>
        </Box>
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.25)",
              mb: 1
            }}
          >Feedback Responses</Typography>
          {event && (
            <Typography
              variant="h5"
              sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
            >{event.title}</Typography>
          )}
        </Box>
        {/* Tabs */}
        <Paper sx={{ mb: 3, background: "rgba(255,255,255,0.98)", borderRadius: 3 }}>
          <Tabs
            value={viewMode}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            sx={{ "& .MuiTabs-indicator": { background: "#9b59b6" } }}
          >
            <Tab
              label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><PersonIcon /> Responses by User</Box>}
              value="user"
            />
            <Tab
              label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><HelpOutlineIcon /> Responses by Question</Box>}
              value="question"
            />
          </Tabs>
        </Paper>
        {responses.length === 0 ? (
          <Paper sx={{
            p: 4, textAlign: "center",
            background: "rgba(255,255,255,0.98)", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
          }}>
            <AssessmentIcon sx={{ fontSize: 64, color: "#bdc3c7", mb: 2 }} />
            <Typography variant="h6" sx={{ mt: 1, color: "#7f8c8d" }}>No Responses Yet</Typography>
            <Typography variant="body1" sx={{ color: "#95a5a6" }}>
              Share your feedback form to start receiving responses!
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* VIEW BY USER */}
            {viewMode === "user" && (
              responses.map((response, idx) => (
                <Paper key={response.id} sx={{ background: "rgba(255,255,255,0.98)", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: "#f8f9fa" }}>
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
                        <Chip label={`Response #${idx + 1}`} color="primary" size="small" />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: "#7f8c8d" }} />
                          <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                            {response.user?.name || "Anonymous"}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: "#7f8c8d" }} />
                          <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                            {formatDate(response.submittedAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ p: 2 }}>
                        {Object.entries(response.answers).map(([questionName, answer]) => (
                          <Box key={questionName} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#2c3e50", mb: 0.5 }}>
                              {/* Use Q number and question text from schema, fallback to name */}
                              {(() => {
                                const qMeta = getQuestionMeta(schema, questionName);
                                const qNum = getQuestionNumber(schema, questionName);
                                return qMeta
                                  ? `Q${qNum}. ${qMeta.title || qMeta.label || qMeta.question || questionName}`
                                  : questionName.replace(/question_/i, "Question ");
                              })()}
                            </Typography>
                            <Box sx={{
                              color: "#34495e", background: "#f8f9fa", p: 1.5,
                              borderRadius: 1, border: "1px solid #e9ecef"
                            }}>
                              {renderAnswer(answer)}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              ))
            )}
            {/* VIEW BY QUESTION W/ CHARTS */}
            {viewMode === "question" && (
              questionAggregates.map(({ question, answers }, idx) => {
                // Console logs for debugging mapping and analytics
                console.log(
                  "[FeedbackResponsesPage] Question type for",
                  question.name,
                  ":",
                  question.type
                );
                return (
                  <Paper key={question.name || idx} sx={{ background: "rgba(255,255,255,0.98)", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: "#f8f9fa" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                          <Chip
                            label={`Q${idx + 1}. ${question.title || question.label || question.question || question.name}`}
                            color="secondary" size="small" />
                          <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                            ({answers.length} responses)
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ p: 2 }}>
                          <QuestionAnalyticsChart
                            question={question}
                            answers={answers.map(a => a.answer)}
                          />
                          {/* --- Raw list of answers --- */}
                          <Typography variant="subtitle2" sx={{
                            fontWeight: 600,
                            color: "#2c3e50",
                            mb: 1
                          }}>
                            Individual Responses:
                          </Typography>
                          {answers.map((qa, ansIdx) => (
                            <Box key={ansIdx} sx={{ mb: 2, pb: 1, borderBottom: "1px dashed #e0e0e0", "&:last-child": { borderBottom: "none" } }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <PersonIcon sx={{ fontSize: 14, color: "#7f8c8d" }} />
                                <Typography variant="caption" sx={{ color: "#7f8c8d", fontWeight: 600 }}>
                                  {qa.submittedBy}
                                </Typography>
                                <ScheduleIcon sx={{ fontSize: 14, color: "#7f8c8d", ml: 2 }} />
                                <Typography variant="caption" sx={{ color: "#7f8c8d" }}>
                                  {formatDate(qa.submittedAt)}
                                </Typography>
                              </Box>
                              <Box sx={{
                                color: "#34495e", background: "#fdfdfe", p: 1.5,
                                borderRadius: 1, border: "1px solid #e9ecef"
                              }}>
                                {renderAnswer(qa.answer)}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                );
              })
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FeedbackResponsesPage;
