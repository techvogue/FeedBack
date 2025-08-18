import { ArrowBack as ArrowBackIcon, Login as LoginIcon } from '@mui/icons-material';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import FeedbackFormRenderer from '../components/FeedbackFormRenderer';

// Constants
const LOGIN_PROMPT_DELAY = 2000;
const GRADIENT_CLASSES = 'min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-8 px-4';
const CONTAINER_CLASSES = 'max-w-6xl mx-auto';
const BACK_BUTTON_CLASSES = 'flex items-center gap-2 px-4 py-2 text-white border border-white/30 rounded-lg hover:border-white hover:bg-white/10 transition-all duration-200';
const TITLE_CLASSES = 'text-4xl md:text-5xl font-bold text-center mb-8 text-white drop-shadow-lg';
const LOGIN_PROMPT_CLASSES = 'mb-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg max-w-2xl mx-auto';
const LOGIN_BUTTON_CLASSES = 'flex items-center gap-2 px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 hover:border-white transition-all duration-200 ml-4';

const FeedbackPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // Memoized callback for login navigation
  const handleLogin = useCallback(() => {
    const currentPath = `/feedback/${eventId}`;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }, [eventId, navigate]);

  // Memoized callback for back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    // Set page as ready after a short delay to prevent flash
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, LOGIN_PROMPT_DELAY);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Early return for invalid eventId
  if (!eventId) {
    return (
      <div className={GRADIENT_CLASSES}>
        <div className={CONTAINER_CLASSES}>
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Invalid Event</h1>
            <p>Event not found. Please check the URL and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state until page is ready
  if (!pageReady) {
    return (
      <div className={GRADIENT_CLASSES}>
        <div className={CONTAINER_CLASSES}>
          <div className="mb-6">
            <button onClick={handleBack} className={BACK_BUTTON_CLASSES}>
              <ArrowBackIcon />
              Back
            </button>
          </div>
          <h1 className={TITLE_CLASSES}>
            Event Feedback
          </h1>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={GRADIENT_CLASSES}>
      <div className={CONTAINER_CLASSES}>
        {/* Navigation */}
        <div className="mb-6">
          <button onClick={handleBack} className={BACK_BUTTON_CLASSES}>
            <ArrowBackIcon />
            Back
          </button>
        </div>

        {/* Page Title */}
        <h1 className={TITLE_CLASSES}>
          Event Feedback
        </h1>

        {/* Login Prompt */}
        {!isAuthenticated && showLoginPrompt && (
          <div className={LOGIN_PROMPT_CLASSES}>
            <div className="flex items-center justify-between">
              <p className="text-white text-sm">
                You can submit feedback anonymously, or login to track your submissions and access additional features.
              </p>
              <button onClick={handleLogin} className={LOGIN_BUTTON_CLASSES}>
                <LoginIcon />
                Login
              </button>
            </div>
          </div>
        )}

        {/* Feedback Form - Only render when page is ready */}
        {pageReady && <FeedbackFormRenderer eventId={eventId} />}
      </div>
    </div>
  );
};

export default FeedbackPage; 