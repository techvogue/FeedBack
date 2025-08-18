import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axiosInstance';

export const useFeedbackForm = (eventId) => {
  const [hasFeedbackForm, setHasFeedbackForm] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const checkFeedbackForm = useCallback(async () => {
    if (!eventId) {
      setIsChecking(false);
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsChecking(true);
      setError(null);
      
      const response = await axios.get(`/feedback/forms/${eventId}`, {
        signal: abortControllerRef.current.signal
      });
      
      // Only update state if this is still the current request
      if (!abortControllerRef.current.signal.aborted) {
        setHasFeedbackForm(true);
      }
    } catch (err) {
      // Don't update state if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (err.response?.status === 404) {
        // This is expected behavior - no feedback form exists yet
        setHasFeedbackForm(false);
        setError(null); // Clear any previous errors
      } else {
        // This is a real error
        setError(err.message || 'Failed to check feedback form');
        setHasFeedbackForm(false);
      }
    } finally {
      // Only update checking state if this is still the current request
      if (!abortControllerRef.current?.signal.aborted) {
        setIsChecking(false);
      }
    }
  }, [eventId]);

  useEffect(() => {
    checkFeedbackForm();

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkFeedbackForm]);

  const refresh = useCallback(() => {
    checkFeedbackForm();
  }, [checkFeedbackForm]);

  return { hasFeedbackForm, isChecking, error, refresh };
};
