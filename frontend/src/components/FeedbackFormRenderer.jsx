import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Model } from 'survey-core';
import 'survey-core/survey-core.min.css';
import { Survey } from 'survey-react-ui';
import axios from '../api/axiosInstance';

const FeedbackFormRenderer = ({ eventId, onComplete }) => {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eventData, setEventData] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadForm = async () => {
      try {
        const response = await axios.get(`/feedback/forms/${eventId}`);
        const { schema, event } = response.data;

        if (!schema) {
          setError('No feedback form found for this event');
          return;
        }

        setEventData(event);

        // Check if user has already submitted feedback
        try {
          const checkResponse = await axios.get(`/feedback/responses/${eventId}/check`);
          if (checkResponse.data.hasSubmitted) {
            setAlreadySubmitted(true);
            setSuccess('You have already submitted feedback for this event. Thank you!');
            return;
          }
        } catch (err) {
          // If check fails, continue with form loading
          console.log('Could not check submission status:', err);
        }

        // Configure survey for file uploads
        const surveyModel = new Model(schema);

        // Custom styling for better readability
        surveyModel.css = {
          root: "sv_main",
          header: "sv_header",
          body: "sv_body",
          footer: "sv_footer",
          navigation: {
            root: "sv_nav",
            prev: "sv_nav_prev",
            next: "sv_nav_next",
            complete: "sv_nav_complete"
          },
          question: {
            root: "sv_q",
            title: "sv_q_title",
            description: "sv_q_description",
            content: "sv_q_content",
            required: "sv_q_required"
          },
          text: {
            root: "sv_q_text",
            input: "sv_q_text_input"
          },
          comment: {
            root: "sv_q_comment",
            input: "sv_q_comment_input"
          },
          radio: {
            root: "sv_q_radio",
            item: "sv_q_radio_item",
            label: "sv_q_radio_label"
          },
          checkbox: {
            root: "sv_q_checkbox",
            item: "sv_q_checkbox_item",
            label: "sv_q_checkbox_label"
          },
          rating: {
            root: "sv_q_rating",
            item: "sv_q_rating_item"
          },
          boolean: {
            root: "sv_q_boolean",
            item: "sv_q_boolean_item"
          },
          file: {
            root: "sv_q_file",
            input: "sv_q_file_input"
          },
          email: {
            root: "sv_q_email",
            input: "sv_q_email_input"
          },
          number: {
            root: "sv_q_number",
            input: "sv_q_number_input"
          }
        };

        surveyModel.onUploadFiles.add(async (sender, options) => {
          const files = options.files;
          const urls = [];

          for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);

            try {
              const uploadResponse = await axios.post('/feedback/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              urls.push(uploadResponse.data.fileUrl);
            } catch (err) {
              console.error('File upload failed:', err);
            }
          }

          options.callback('success', urls);
        });

        surveyModel.onComplete.add(async (sender, options) => {
          setSubmitting(true);
          try {
            await axios.post(`/feedback/responses/${eventId}`, {
              answers: sender.data
            });
            setHasSubmitted(true);
            setSuccess('Thank you for your feedback! Your response has been submitted successfully.');
            if (onComplete) onComplete();
          } catch (err) {
            setError('Failed to submit feedback. Please try again.');
          } finally {
            setSubmitting(false);
          }
        });

        setSurvey(surveyModel);
      } catch (err) {
        setError('Failed to load feedback form');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [eventId, onComplete]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#3498db' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{
        m: 2,
        backgroundColor: '#fdf2f2',
        color: '#c53030',
        '& .MuiAlert-icon': { color: '#c53030' }
      }}>
        {error}
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert severity="success" sx={{
        m: 2,
        backgroundColor: '#f0fff4',
        color: '#2f855a',
        '& .MuiAlert-icon': { color: '#2f855a' }
      }}>
        {success}
      </Alert>
    );
  }

  if (alreadySubmitted) {
    return (
      <Paper sx={{
        p: 4,
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <Typography variant="h5" sx={{
          mb: 2,
          color: '#2c3e50',
          fontWeight: 'bold'
        }}>
          Already Submitted
        </Typography>
        <Typography variant="body1" sx={{
          color: '#7f8c8d',
          mb: 3
        }}>
          You have already submitted feedback for this event. Thank you for your participation!
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => window.history.back()}
            sx={{
              borderColor: '#3498db',
              color: '#3498db',
              '&:hover': { borderColor: '#2980b9', backgroundColor: 'rgba(52, 152, 219, 0.1)' }
            }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/'}
            sx={{
              backgroundColor: '#27ae60',
              '&:hover': { backgroundColor: '#229954' }
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{
      p: 3,
      background: 'rgba(255,255,255,0.98)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      {eventData && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            mb: 1,
            color: '#2c3e50'
          }}>
            {eventData.title}
          </Typography>
          <Typography variant="body1" sx={{
            color: '#7f8c8d',
            fontSize: '1.1rem'
          }}>
            {eventData.description}
          </Typography>
        </Box>
      )}

      {submitting && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress sx={{ color: '#3498db' }} />
        </Box>
      )}

      {survey && (
        <Box sx={{
          maxWidth: 800,
          mx: 'auto',
          '& .sv_main': {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            color: '#2c3e50'
          },
          '& .sv_q_title': {
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#34495e',
            marginBottom: '8px'
          },
          '& .sv_q_description': {
            color: '#7f8c8d',
            fontSize: '0.9rem',
            marginBottom: '12px'
          },
          '& .sv_q_required': {
            color: '#e74c3c',
            fontWeight: 600
          },
          '& .sv_q_text_input, & .sv_q_comment_input, & .sv_q_email_input, & .sv_q_number_input': {
            border: '2px solid #ecf0f1',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '1rem',
            '&:focus': {
              borderColor: '#3498db',
              outline: 'none',
              boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
            }
          },
          '& .sv_q_radio_item, & .sv_q_checkbox_item': {
            marginBottom: '8px',
            padding: '8px',
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: '#f8f9fa'
            }
          },
          '& .sv_q_radio_label, & .sv_q_checkbox_label': {
            fontSize: '1rem',
            color: '#2c3e50',
            marginLeft: '8px'
          },
          '& .sv_q_rating_item': {
            fontSize: '1.5rem',
            color: '#f39c12',
            margin: '0 4px'
          },
          '& .sv_q_boolean_item': {
            padding: '12px',
            border: '2px solid #ecf0f1',
            borderRadius: '8px',
            margin: '4px 0',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#3498db',
              backgroundColor: '#f8f9fa'
            }
          },
          '& .sv_q_file_input': {
            border: '2px dashed #bdc3c7',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#3498db',
              backgroundColor: '#f8f9fa'
            }
          },
          '& .sv_nav': {
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '2px solid #ecf0f1'
          },
          '& .sv_nav_next, & .sv_nav_complete': {
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#2980b9'
            }
          },
          '& .sv_nav_prev': {
            backgroundColor: 'transparent',
            color: '#7f8c8d',
            border: '2px solid #bdc3c7',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#3498db',
              color: '#3498db'
            }
          }
        }}>
          <Survey model={survey} />
        </Box>
      )}
    </Paper>
  );
};

export default FeedbackFormRenderer;
