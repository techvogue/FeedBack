import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';

const FeedbackShare = ({ eventId, open, onClose, className = '' }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  // Generate the feedback URL with validation
  const feedbackUrl = eventId ? `${window.location.origin}/feedback/${eventId}` : '';

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (open) {
      // Lock the background
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Unlock the background
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup function to ensure body is unlocked when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [open]);

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (showCopied) {
      const timer = setTimeout(() => {
        setShowCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  const copyToClipboard = async () => {
    if (!feedbackUrl) {
      setCopyError('Invalid feedback URL');
      return;
    }

    try {
      // Check if navigator.clipboard is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(feedbackUrl);
        setShowCopied(true);
        setCopyError('');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = feedbackUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setShowCopied(true);
          setCopyError('');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          setCopyError('Failed to copy link. Please copy it manually.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setCopyError('Failed to copy link. Please copy it manually.');
    }
  };

  const shareLink = async () => {
    if (!feedbackUrl) {
      setCopyError('Invalid feedback URL');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Event Feedback Form',
          text: 'Please provide your feedback for this event',
          url: feedbackUrl,
        });
      } catch (err) {
        console.error('Failed to share:', err);
        // If sharing fails, fall back to copying
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const handleClose = () => {
    setShowCopied(false);
    setCopyError('');
    onClose();
  };

  const handleUrlClick = () => {
    // Select the URL text when clicked
    const textField = document.getElementById('feedback-url-field');
    if (textField) {
      textField.select();
    }
  };

  // Don't render if no eventId or not open
  if (!eventId || !open) {
    return null;
  }

  return (
    <>
      {/* Modal */} 
      <div className="mt-16 fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className={`bg-white border border-black/20 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto relative ${className}`}>
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-5 p-2 pr-4 text-black hover:text-white hover:bg-black rounded-lg transition-all duration-200 cursor-pointer"
            title="Close"
          >
            <CloseIcon  />
          </button>

          {/* Header */}
          <div className="pt-6 text-center">
            <h2 className="text-3xl font-bold text-black mb-6">
              Share Feedback Form
            </h2>
          </div>

          {/* QR Code */}
          <div className="px-6 mb-6">
            <div className="p-6 bg-white border border-black/20 rounded-xl flex justify-center items-center mb-4">
              <QRCodeSVG
                value={feedbackUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-center text-black font-medium">
              Scan this QR code to access the feedback form
            </p>
          </div>

          {/* URL Field */}
          <div className="px-6 mb-6">
            <p className="mb-3 font-bold text-black text-center">
              Or share this link:
            </p>
            <div className="relative">
              <input
                id="feedback-url-field"
                type="text"
                value={feedbackUrl}
                readOnly
                onClick={handleUrlClick}
                className="w-full p-3 pr-16 bg-white border border-black/30 rounded-lg text-black cursor-text hover:bg-black/5 transition-all duration-200"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-0  p-2 bg-black h-full w-12 text-white rounded-r-md hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-200 shadow-md hover:scale-105 cursor-pointer"
                title="Copy to clipboard"
              >
                <CopyIcon />
              </button>
            </div>
            {copyError && (
              <p className="mt-2 text-sm text-red-600">
                {copyError}
              </p>
            )}
          </div>

          {/* Share Button */}
          <div className="px-6 pb-6">
            <button
              onClick={shareLink}
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl "
            >
              <ShareIcon />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showCopied && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-white/20 animate-in slide-in-from-bottom-2 duration-300">
            <CheckCircleIcon />
            Link copied to clipboard!
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackShare;
