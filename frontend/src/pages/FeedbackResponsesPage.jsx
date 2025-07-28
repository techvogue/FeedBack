import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  HelpOutline as HelpOutlineIcon,
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
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import QuestionAnalyticsChart from '../components/QuestionAnalyticsChart'; // Import the chart component


/// --- Utility: Format Date ---
const formatDate = dateString =>
  new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

/// --- Utility: renderAnswer, file previews etc ---
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
  const [schema, setSchema] = useState([]); // State to store the survey schema
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

        // Get SurveyJS schema for this event's form (find best source)
        // If not included in event, request from /feedback-form/:eventId
        let qSchema = [];
        if (eventRes.data.feedbackForm?.schema) {
          qSchema = eventRes.data.feedbackForm.schema;
        } else {
          try {
            const formRes = await axios.get(`/feedback-form/${eventId}`);
            qSchema = formRes.data.schema || [];
          } catch (fetchSchemaError) {
            console.error("Failed to fetch feedback form schema:", fetchSchemaError);
            // Continue without schema if fetching fails
          }
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

  // --- For "question" view: group all answers by question name ---
  const getQuestionsAndAnswers = () => {
    if (!responses.length) return [];

    const questionsAggregated = new Map();

    // Populate questionsAggregated with metadata from schema first
    if (schema && schema.pages) {
      schema.pages.forEach(page => {
        if (page.elements) {
          page.elements.forEach(element => {
            // Use 'name' as the key for consistency with responses
            const qName = element.name;
            if (qName) {
              questionsAggregated.set(qName, {
                question: element, // Store full question metadata
                answers: [],
              });
            }
          });
        }
      });
    }

    // Then, populate with answers from responses
    responses.forEach(r => {
      Object.entries(r.answers).forEach(([questionName, answer]) => {
        // If questionName exists in schema, use its metadata. Otherwise, create basic metadata.
        if (!questionsAggregated.has(questionName)) {
          questionsAggregated.set(questionName, {
            question: { name: questionName, label: questionName, type: 'text' }, // Default to text type
            answers: [],
          });
        }
        questionsAggregated.get(questionName).answers.push({
          answer: answer,
          submittedBy: r.user?.name || "Anonymous",
          submittedAt: r.submittedAt,
        });
      });
    });

    // Convert map to array and sort by question label/name
    return Array.from(questionsAggregated.values()).sort((a, b) => {
      const labelA = a.question.label || a.question.name;
      const labelB = b.question.label || b.question.name;
      return labelA.localeCompare(labelB);
    });
  };
  const questionAggregates = getQuestionsAndAnswers();

  // --- Tab logic ---
  const handleTabChange = (e, nv) => setViewMode(nv);

  /// --- Loading/Error UI ---
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
              textShadow: "0 2px 4px rgba(0,0,0,0.25)", mb: 1
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
            <Typography variant="h6" sx={{ mt:1, color: "#7f8c8d" }}>No Responses Yet</Typography>
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
                      <Box sx={{ display: "flex", alignItems: "center", width:"100%", gap: 2 }}>
                        <Chip label={`Response #${idx + 1}`} color="primary" size="small" />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color:"#7f8c8d" }} />
                          <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                            {response.user?.name || "Anonymous"}
                          </Typography>
                        </Box>
                        <Box sx={{ ml:"auto", display:"flex", alignItems:"center", gap:1 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color:"#7f8c8d" }}/>
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
                              {questionName.replace(/question_/i, "Question ")}
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
              questionAggregates.map(({ question, answers }, idx) => (
                <Paper key={question.name || idx} sx={{ background: "rgba(255,255,255,0.98)", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: "#f8f9fa" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                        <Chip
                          label={question.label || question.title || question.name || `Q${idx + 1}`}
                          color="secondary" size="small" />
                        <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                          ({answers.length} responses)
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ p: 2 }}>
                        {/* --- Chart.js analytics, auto-detect for MCQ/Rating/Dropdown/Checkbox --- */}
                        <QuestionAnalyticsChart
                          question={question} // Pass the full question object (metadata)
                          responses={responses} // Pass all responses for internal filtering
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
              ))
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FeedbackResponsesPage;
