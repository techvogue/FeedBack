import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Model } from 'survey-core';
import 'survey-core/survey-core.min.css';
import { Survey } from 'survey-react-ui';
import axios from '../api/axiosInstance';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

const FeedbackFormRenderer = ({ eventId, onComplete }) => {
  const { user } = useSelector((state) => state.auth);

  // State management
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eventData, setEventData] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUploadError, setShowUploadError] = useState(false);

  // File validation function
  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Allowed types: Images (JPG, PNG, WebP, GIF), Documents (PDF, DOC, DOCX, TXT), Spreadsheets (XLS, XLSX), Presentations (PPT, PPTX)`
      };
    }

    return { valid: true };
  }, []);

  // Show upload error message
  const showError = useCallback((message) => {
    setUploadError(message);
    setShowUploadError(true);
    setTimeout(() => {
      setShowUploadError(false);
      setUploadError('');
    }, 5000);
  }, []);

  // Load form data
  const loadForm = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError('');

      // Load event details
      try {
        const eventResponse = await axios.get(`/feedback/event/${eventId}`);
        setEventData(eventResponse.data);
      } catch (eventErr) {
        console.log('Could not load event details:', eventErr);
      }

      // Load feedback form
      const response = await axios.get(`/feedback/forms/${eventId}`);
      const { schema, event } = response.data;

      if (!schema) {
        setError('No feedback form found for this event');
        return;
      }

      if (event) {
        setEventData(event);
      }

      if (!schema.pages || !Array.isArray(schema.pages) || schema.pages.length === 0) {
        setError('Invalid survey schema format');
        return;
      }

      const firstPage = schema.pages[0];
      if (!firstPage.elements || !Array.isArray(firstPage.elements) || firstPage.elements.length === 0) {
        setError('Survey contains no questions');
        return;
      }

      // Check submission status for authenticated users
      if (user) {
        try {
          const checkResponse = await axios.get(`/feedback/responses/${eventId}/check`);
          if (checkResponse.data.hasSubmitted) {
            setAlreadySubmitted(true);
            setSuccess('You have already submitted feedback for this event. Thank you!');
            return;
          }
        } catch (err) {
          console.log('Could not check submission status:', err);
        }
      }

      // Create survey model
      const surveyModel = new Model(schema);

      if (!surveyModel || !surveyModel.pages || surveyModel.pages.length === 0) {
        setError('Failed to create survey model');
        return;
      }

      // Configure survey model
      surveyModel.showQuestionNumbers = false;
      surveyModel.showProgressBar = false;
      surveyModel.allowCompleteSurveyAutomatic = false;
      surveyModel.autoGrowComment = true;
      surveyModel.focusFirstQuestionAutomatic = false;
      surveyModel.showNavigationButtons = true;
      surveyModel.showTitle = false;
      surveyModel.showPageTitles = false;
      surveyModel.showCompletedPage = false;
      surveyModel.showPreviewBeforeComplete = false;
      surveyModel.showStartPage = false;
      surveyModel.showEndPage = false;

      const firstSurveyPage = surveyModel.pages[0];
      if (!firstSurveyPage.elements || firstSurveyPage.elements.length === 0) {
        setError('Survey contains no visible elements');
        return;
      }

      // Handle file uploads
      surveyModel.onUploadFiles.add(async (sender, options) => {
        const files = options.files;
        const urls = [];
        const errors = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const validation = validateFile(file);

          if (!validation.valid) {
            errors.push(`File "${file.name}": ${validation.error}`);
            continue;
          }

          const formData = new FormData();
          formData.append('file', file);

          try {
            const uploadResponse = await axios.post('/feedback/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            urls.push(uploadResponse.data.fileUrl);
          } catch (err) {
            console.error('File upload failed:', err);
            let errorMessage = 'File upload failed';

            if (err.response?.status === 413) {
              errorMessage = `File "${file.name}" is too large. Maximum size is 5MB.`;
            } else if (err.response?.status === 400) {
              errorMessage = err.response.data.message || `File "${file.name}" format not supported`;
            } else if (err.response?.status === 500) {
              errorMessage = `Server error while uploading "${file.name}". Please try again.`;
            } else if (err.code === 'NETWORK_ERROR') {
              errorMessage = `Network error while uploading "${file.name}". Please check your connection.`;
            }

            errors.push(errorMessage);
          }
        }

        if (errors.length > 0) {
          showError(errors.join('\n'));
        }

        if (urls.length > 0) {
          options.callback('success', urls);
        } else if (errors.length > 0) {
          options.callback('error', errors.join('\n'));
        } else {
          options.callback('error', 'No files were uploaded successfully');
        }
      });

      // Handle form completion
      surveyModel.onComplete.add(async (sender, options) => {
        setSubmitting(true);
        try {
          if (!sender.data || Object.keys(sender.data).length === 0) {
            throw new Error('No survey data to submit');
          }

          const response = await axios.post(`/feedback/responses/${eventId}`, {
            answers: sender.data
          });

          setHasSubmitted(true);
          setSuccess('Thank you for your feedback! Your response has been submitted successfully.');
          if (onComplete) onComplete();
        } catch (err) {
          console.error('Submission error:', err);
          setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
          setSubmitting(false);
        }
      });

      setSurvey(surveyModel);
    } catch (err) {
      console.error('Load form error:', err);

      if (err.response?.status === 404) {
        const errorData = err.response.data;
        if (errorData.event && !errorData.hasFeedbackForm) {
          setError('This event exists but does not have a feedback form yet. The organizer may still be setting it up.');
          setEventData(errorData.event);
        } else {
          setError('No feedback form found for this event');
        }
      } else if (err.response?.status === 500) {
        setError('Server error while loading the feedback form. Please try again later.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error: Cannot connect to the server. Please check if the backend is running.');
      } else if (err.message?.includes('timeout')) {
        setError('Request timeout: The server is taking too long to respond.');
      } else {
        setError(`Failed to load feedback form: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, onComplete, user, validateFile, showError]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Feedback Form Not Available
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {error}
        </p>

        {eventData && error.includes('does not have a feedback form yet') && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Event: <span className="font-semibold">{eventData.title}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {eventData.description}
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                This event doesn't have a feedback form yet.
              </p>
              {user && eventData.ownerId === user.id ? (
                <button
                  onClick={async () => {
                    try {
                      const response = await axios.post(`/feedback/forms/${eventId}/default`);
                      if (response.data.success) {
                        window.location.reload();
                      }
                    } catch (err) {
                      console.error('Failed to create default form:', err);
                      setError('Failed to create default feedback form. Please try again.');
                    }
                  }}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
                >
                  Create Default Feedback Form
                </button>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Only the event organizer can create a feedback form. Please contact the event organizer to set up feedback collection.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Thank You!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {success}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Already submitted state
  if (alreadySubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Already Submitted
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          You have already submitted feedback for this event. Thank you for your participation!
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main form render
  if (!survey) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Preparing feedback form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {eventData && (
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {eventData.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {eventData.description}
          </p>
        </div>
      )}

      {submitting && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black dark:border-white"></div>
        </div>
      )}

      {showUploadError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm whitespace-pre-line">{uploadError}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <style>
          {`
            .survey-container .sv-progress,
            .survey-container .sv-progress-bar,
            .survey-container .sv-page__counter,
            .survey-container .sv-progress-buttons,
            .survey-container .sv-progress-buttons__container,
            .survey-container .sv-progress-buttons__list,
            .survey-container .sv-progress-buttons__page-title,
            .survey-container .sv-progress-buttons__button,
            .survey-container .sv-progress-buttons__connector,
            .survey-container .sv-progress-buttons__image-button-left,
            .survey-container .sv-progress-buttons__image-button-right {
              display: none !important;
            }
            
            .survey-container .sv-root-modern {
              background: transparent !important;
            }
            
            .survey-container .sv-container-modern {
              background: transparent !important;
              box-shadow: none !important;
              border: none !important;
            }
            
            .survey-container .sv-btn {
              background-color: #000000 !important;
              color: #ffffff !important;
              border: 2px solid #000000 !important;
              border-radius: 8px !important;
              padding: 12px 24px !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
            }
            
            .survey-container .sv-btn:hover {
              background-color: #333333 !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
            }
            
            .survey-container .sv-btn:active {
              transform: translateY(0) !important;
            }
          `}
        </style>
        <Survey
          model={survey}
          onError={(error) => {
            console.error('Survey rendering error:', error);
          }}
          style={{
            '--sjs-font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '--sjs-font-size': '16px',
            '--sjs-font-weight': '400',
            '--sjs-line-height': '1.5',
            '--sjs-background-color': 'transparent',
            '--sjs-foreground-color': '#000000',
            '--sjs-border-color': '#e5e7eb',
            '--sjs-border-radius': '8px',
            '--sjs-shadow': 'none',
            '--sjs-margin': '0',
            '--sjs-padding': '0',
          }}
          className="survey-container"
        />
      </div>
    </div>
  );
};

export default FeedbackFormRenderer;
