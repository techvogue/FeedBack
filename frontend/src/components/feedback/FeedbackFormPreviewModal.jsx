import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

const FeedbackFormPreviewModal = ({ open, onClose, formData }) => {
  const theme = useTheme();

  // Lock background when modal is open
  useEffect(() => {
    if (!open) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  // Create survey model for preview
  let surveyModel = null;
  try {
    if (formData?.schema) {

      surveyModel = new Model(formData.schema);
    } else if (formData?.elements || formData?.pages) {

      surveyModel = new Model(formData);
    } else {
      console.error('No valid survey data found. formData structure:', formData);
    }
  } catch (error) {
    console.error('Error creating survey model:', error);
  }

  // Configure survey model if it exists
  if (surveyModel) {
    try {
      surveyModel.mode = 'display'; // Read-only mode for preview
      surveyModel.showQuestionNumbers = true;
      surveyModel.showProgressBar = false;
      surveyModel.allowCompleteSurveyAutomatic = false;
      surveyModel.autoGrowComment = true;
      surveyModel.focusFirstQuestionAutomatic = false;

      // Additional preview-specific settings
      surveyModel.showNavigationButtons = false;
      surveyModel.showTitle = false;
      surveyModel.showPageTitles = false;
      surveyModel.showCompletedPage = false;
      surveyModel.showPreviewBeforeComplete = false;
      surveyModel.showStartPage = false;
      surveyModel.showEndPage = false;
    } catch (error) {
      console.error('Error configuring survey model:', error);
    }
  }

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-black/50 backdrop-blur-sm mt-20">
        <div
          className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl shadow-2xl border"
          style={{
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 p-4 px-10 border-b"
            style={{
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-3xl font-bold mb-3"
                  style={{ color: theme.palette.text.primary }}
                >
                  Preview Feedback Form
                </h2>

              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  color: theme.palette.text.primary,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.palette.action.hover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
                title="Close preview"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <Box sx={{ p: 4, backgroundColor: theme.palette.background.paper }}>
            {surveyModel ? (
              <Box
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  '& .sd-root-modern': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    fontFamily: 'inherit',
                  },
                  '& .sd-question': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    borderRadius: 1.25,
                    padding: 1.5,
                    paddingLeft: '20px',
                    margin: '8px 0',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '16px',
                    lineHeight: 1.5,
                  },
                  '& .sd-question__title': {
                    color: theme.palette.text.primary,
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexWrap: 'nowrap',
                    width: '100%',
                    minHeight: '24px',
                    paddingLeft: '16px',
                  },
                  '& .sd-question__title-container': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                  },
                  '& .sd-question__number': {
                    color: theme.palette.primary.main,
                    fontSize: '32px',
                    fontWeight: 900,
                    marginRight: '0px',
                    flexShrink: 0,
                    display: 'inline-block',
                  },
                  // Target the actual SurveyJS question number class
                  '& .sd-question__num': {
                    color: theme.palette.primary.main,
                    fontSize: '32px',
                    fontWeight: 900,
                    marginRight: '0px',
                    flexShrink: 0,
                    display: 'inline-block',
                  },
                  // More specific targeting for SurveyJS question numbers
                  '& .sd-question .sd-question__num': {
                    color: theme.palette.primary.main,
                    fontSize: '32px',
                    fontWeight: 900,
                    marginRight: '0px',
                    flexShrink: 0,
                    display: 'inline-block',
                  },
                  // Target any element that might contain the question number
                  '& .sd-question__title .sd-question__num, & .sd-question__title .sd-question__number': {
                    color: theme.palette.primary.main,
                    fontSize: '32px',
                    fontWeight: 900,
                    marginRight: '0px',
                    flexShrink: 0,
                    display: 'inline-block',
                  },
                  '& .sd-question__title-text': {
                    color: theme.palette.text.primary,
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    flex: 1,
                    display: 'inline-block',
                  },
                  '& .sd-question__description': {
                    color: theme.palette.text.secondary,
                    fontSize: '18px',
                    marginBottom: 2,
                    opacity: 0.9,
                    lineHeight: 1.5,
                  },
                  '& .sd-question__required': {
                    color: '#ef4444',
                    fontWeight: 700,
                    marginLeft: 0.5,
                  },
                  '& .sd-input': {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    borderRadius: 1.25,
                    padding: 1.5,
                    margin: '6px 0',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      outline: 'none',
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
                    },
                    '&::placeholder': {
                      color: theme.palette.text.secondary,
                      opacity: 0.7,
                    },
                    '& input': {
                      color: theme.palette.text.primary,
                      backgroundColor: 'transparent',
                    },
                    '& textarea': {
                      color: theme.palette.text.primary,
                      backgroundColor: 'transparent',
                    },
                  },
                  '& .sd-text_input, & .sd-email_input, & .sd-number_input, & .sd-password_input': {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    borderRadius: 1.25,
                    padding: 1.5,
                    margin: '6px 0',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      outline: 'none',
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
                    },
                    '&::placeholder': {
                      color: theme.palette.text.secondary,
                      opacity: 0.7,
                    },
                  },
                  '& .sd-radio, & .sd-checkbox': {
                    margin: '14px 0',
                    padding: 2.25,
                    borderRadius: 1.25,
                    border: `2px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                    },
                  },
                  '& .sd-radio__label, & .sd-checkbox__label': {
                    color: theme.palette.text.primary,
                    marginLeft: 1.75,
                    fontSize: '18px',
                    fontWeight: 500,
                    lineHeight: 1.4,
                  },
                  '& .sd-radio__input, & .sd-checkbox__input': {
                    width: '22px',
                    height: '22px',
                    marginRight: 1.25,
                  },
                  '& .sd-btn': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    borderColor: theme.palette.primary.main,
                    borderRadius: 1.25,
                    padding: '16px 28px',
                    margin: 1.25,
                    fontWeight: 600,
                    fontSize: '16px',
                    border: `2px solid ${theme.palette.primary.main}`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      color: theme.palette.primary.contrastText,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 6px 16px rgba(255, 255, 255, 0.2)'
                        : '0 6px 16px rgba(0, 0, 0, 0.2)',
                    },
                  },
                  '& .sd-text': {
                    color: theme.palette.text.primary,
                    fontSize: '18px',
                    lineHeight: 1.6,
                  },
                  '& .sd-comment': {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    borderRadius: 1.25,
                    padding: 1.5,
                    minHeight: '100px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '16px',
                    resize: 'vertical',
                    '&:focus': {
                      outline: 'none',
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
                    },
                    '&::placeholder': {
                      color: theme.palette.text.secondary,
                      opacity: 0.7,
                    },
                  },
                  '& .sd-dropdown': {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    borderRadius: 1.25,
                    padding: 1.5,
                    margin: '6px 0',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      outline: 'none',
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
                    },
                    '& option': {
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                      color: theme.palette.text.primary,
                    },
                  },
                  '& .sd-rating__item': {
                    fontSize: '28px',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    margin: '0 10px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.2)',
                    },
                  },
                  '& .sd-progress': {
                    backgroundColor: theme.palette.divider,
                    borderRadius: 1.25,
                    height: '10px',
                    margin: '24px 0',
                  },
                  '& .sd-progress__bar': {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.25,
                  },
                  '& .sd-element': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    display: 'block !important',
                    visibility: 'visible !important',
                  },
                  '& *': {
                    visibility: 'visible !important',
                    opacity: '1 !important',
                  },
                  // Global text color override for all survey elements
                  '& .sd-root-modern *': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  '& .sd-root-modern input': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  '& .sd-root-modern textarea': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  '& .sd-root-modern select': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  '& .sd-root-modern option': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  '& .sd-root-modern label': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  '& .sd-root-modern span': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  '& .sd-root-modern div': {
                    color: `${theme.palette.text.primary} !important`,
                  },
                  // Force question numbers to be large and bold
                  '& .sd-root-modern .sd-question__num': {
                    fontSize: '32px !important',
                    fontWeight: '900 !important',
                    color: `${theme.palette.primary.main} !important`,
                  },
                  '& .sd-root-modern .sd-question__number': {
                    fontSize: '32px !important',
                    fontWeight: '900 !important',
                    color: `${theme.palette.primary.main} !important`,
                  },
                  // Fix for the teal circle and other survey elements
                  '& .sd-container-modern': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                  },
                  '& .sd-container-modern__header': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                  },
                  '& .sd-container-modern__body': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                  },
                  '& .sd-container-modern__footer': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                  },
                  '& .sd-container-modern__title': {
                    color: theme.palette.text.primary,
                  },
                  '& .sd-container-modern__description': {
                    color: theme.palette.text.secondary,
                  },
                  '& .sd-container-modern__counter': {
                    color: theme.palette.text.secondary,
                  },
                  '& .sd-container-modern__progress': {
                    backgroundColor: theme.palette.divider,
                  },
                  '& .sd-container-modern__progress-bar': {
                    backgroundColor: theme.palette.primary.main,
                  },
                  '& .sd-container-modern__navigation': {
                    backgroundColor: theme.palette.background.default,
                    borderColor: theme.palette.divider,
                  },
                  '& .sd-container-modern__navigation-button': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                }}
              >
                <Survey
                  model={surveyModel}
                  onError={(error) => {
                    console.error('Survey rendering error:', error);
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  color: theme.palette.text.secondary,
                }}
              >
                <Box
                  component="svg"
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    opacity: 0.5,
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.text.secondary,
                  }}
                >
                  No form data available for preview
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.75,
                    mb: 3,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {formData ? 'Form data structure is invalid' : 'Form data is missing'}
                </Typography>
                <Paper
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 2,
                    textAlign: 'left',
                    maxWidth: '800px',
                    mx: 'auto',
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.secondary,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                    }}
                  >
                    Debug Info: {JSON.stringify(formData, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>



        </div>
      </div>


    </>
  );
};

export default FeedbackFormPreviewModal;
