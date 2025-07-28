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

        // FIX: Set validation to happen on complete to avoid "Response required" on load
        surveyModel.validateOn = 'onComplete'; // or 'valueChanged' if you prefer validation as user types/selects

        // Custom styling for better readability - Modern, Easy, Clean
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh', // Ensure it takes up enough space to center
        p: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Match page background
      }}>
        <CircularProgress sx={{ color: '#3498db' }} />
        <Typography variant="body1" sx={{ ml: 2, color: 'white' }}>Loading feedback form...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{
        m: 2,
        backgroundColor: '#fdf2f2',
        color: '#c53030',
        '& .MuiAlert-icon': { color: '#c53030' },
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
        '& .MuiAlert-icon': { color: '#2f855a' },
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
        textAlign: 'center',
        maxWidth: 600, // Constrain width for better appearance
        mx: 'auto', // Center the paper
        my: 4, // Add vertical margin
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
              borderRadius: 2, // Rounded buttons
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
              color: 'white', // Ensure text is white
              borderRadius: 2, // Rounded buttons
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
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Full page background
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start', // Align to top, not center vertically
      py: 4, // Padding top/bottom
      px: 2, // Padding left/right
    }}>
      <Paper sx={{
        p: { xs: 2, sm: 4 }, // Responsive padding
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 3, // More rounded corners
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)', // Enhanced shadow
        width: '100%',
        maxWidth: 800, // Max width for the form container
      }}>
        {eventData && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{
              fontWeight: 'bold',
              mb: 1,
              color: '#2c3e50',
              fontSize: { xs: '1.8rem', sm: '2.2rem' } // Responsive font size
            }}>
              {eventData.title}
            </Typography>
            <Typography variant="body1" sx={{
              color: '#7f8c8d',
              fontSize: { xs: '0.95rem', sm: '1.1rem' } // Responsive font size
            }}>
              {eventData.description}
            </Typography>
          </Box>
        )}

        {submitting && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress sx={{ color: '#3498db' }} />
            <Typography variant="body1" sx={{ ml: 2, color: '#3498db' }}>Submitting feedback...</Typography>
          </Box>
        )}

        {survey && (
          <Box sx={{
            // SurveyJS overrides for modern look
            '& .sv_main': {
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', // Use Inter if available, fallback to Roboto
              color: '#2c3e50',
              backgroundColor: 'transparent', // Ensure SurveyJS background is transparent
              border: 'none', // Remove default border
              padding: 0, // Remove default padding
            },
            '& .sv_header': {
              display: 'none', // Hide default SurveyJS header if eventData title is used
            },
            '& .sv_body': {
              padding: 0, // Remove body padding
            },
            '& .sv_q': {
              marginBottom: '24px', // More space between questions
              padding: '16px', // Padding around each question
              border: '1px solid #e0e0e0', // Subtle border for questions
              borderRadius: '12px', // Rounded corners for question boxes
              backgroundColor: '#ffffff', // White background for question boxes
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', // Subtle shadow for question boxes
            },
            '& .sv_q_title': {
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#34495e',
              marginBottom: '12px',
              borderBottom: '1px solid #f0f0f0', // Separator for question title
              paddingBottom: '8px',
            },
            '& .sv_q_description': {
              color: '#7f8c8d',
              fontSize: '0.9rem',
              marginBottom: '12px'
            },
            '& .sv_q_required': {
              color: '#e74c3c',
              fontWeight: 600,
              marginLeft: '4px',
            },
            '& .sv_q_text_input, & .sv_q_comment_input, & .sv_q_email_input, & .sv_q_number_input': {
              border: '1px solid #dcdcdc', // Lighter border
              borderRadius: '8px',
              padding: '12px',
              fontSize: '1rem',
              width: '100%', // Full width
              boxSizing: 'border-box', // Include padding in width
              transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:focus': {
                borderColor: '#3498db',
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)' // More prominent focus shadow
              }
            },
            '& .sv_q_comment_input': {
              minHeight: '100px', // Min height for comment box
              resize: 'vertical', // Allow vertical resizing
            },
            '& .sv_q_radio_item, & .sv_q_checkbox_item': {
              marginBottom: '8px',
              padding: '8px 12px', // Slightly more padding
              borderRadius: '8px', // More rounded
              transition: 'background-color 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f8f9fa'
              },
              '&.checked': { // Style for checked items
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                border: '1px solid #3498db',
              }
            },
            '& .sv_q_radio_label, & .sv_q_checkbox_label': {
              fontSize: '1rem',
              color: '#2c3e50',
              marginLeft: '8px',
              cursor: 'pointer', // Indicate clickable
            },
            '& .sv_q_rating_item': {
              fontSize: '1.8rem', // Larger rating stars/numbers
              color: '#f39c12',
              margin: '0 6px', // More space between rating items
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.1)', // Slight scale on hover
              },
              '&.active': { // Style for selected rating
                color: '#e67e22', // Darker orange when active
                transform: 'scale(1.2)',
              }
            },
            '& .sv_q_boolean_item': {
              padding: '12px',
              border: '1px solid #dcdcdc',
              borderRadius: '8px',
              margin: '4px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 500,
              color: '#34495e',
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#3498db',
                backgroundColor: '#f8f9fa'
              },
              '&.sv-boolean__checked': { // SurveyJS class for checked boolean
                backgroundColor: '#e8f5e9', // Light green for checked
                borderColor: '#27ae60',
                color: '#27ae60',
              },
            },
            '& .sv_q_file_input': {
              border: '2px dashed #bdc3c7',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease-in-out, background-color 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#3498db',
                backgroundColor: '#f8f9fa'
              }
            },
            '& .sv_nav': {
              marginTop: '32px', // More space above navigation
              paddingTop: '20px',
              borderTop: '1px solid #e0e0e0', // Lighter separator
              display: 'flex',
              justifyContent: 'space-between', // Space out buttons
              gap: '16px', // Gap between buttons
              flexWrap: 'wrap', // Allow wrapping on small screens
            },
            '& .sv_nav_next, & .sv_nav_complete, & .sv_nav_prev': {
              flexGrow: 1, // Allow buttons to grow
              minWidth: '120px', // Minimum width for buttons
              padding: '14px 28px', // More padding for buttons
              borderRadius: '8px', // More rounded buttons
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
            },
            '& .sv_nav_next, & .sv_nav_complete': {
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              '&:hover': {
                backgroundColor: '#2980b9',
                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)'
              }
            },
            '& .sv_nav_prev': {
              backgroundColor: 'transparent',
              color: '#7f8c8d',
              border: '2px solid #bdc3c7',
              '&:hover': {
                borderColor: '#3498db',
                color: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.05)'
              }
            }
          }}>
            <Survey model={survey} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FeedbackFormRenderer;
