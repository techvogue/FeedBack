import { Add as AddIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const FeedbackFormCreator = ({ eventId, onSave, onCancel }) => {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState([
    { id: 1, type: 'text', question: '', required: false, options: [] }
  ]);

  // Ensure the form can scroll properly
  useEffect(() => {
    // Remove any height restrictions from body and html
    document.body.style.height = 'auto';
    document.body.style.overflow = 'visible';
    document.documentElement.style.height = 'auto';
    document.documentElement.style.overflow = 'visible';

    return () => {
      // Reset styles when component unmounts
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions(prev => {
      const newId = Math.max(...prev.map(q => q.id), 0) + 1;
      return [...prev, { id: newId, type: 'text', question: '', required: false, options: [] }];
    });
  }, []);

  const removeQuestion = useCallback((id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const updateQuestion = useCallback((id, field, value) => {
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  }, []);

  const addOption = useCallback((questionId) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
        : q
    ));
  }, []);

  const updateOption = useCallback((questionId, optionIndex, value) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.map((opt, idx) =>
            idx === optionIndex ? value : opt
          )
        }
        : q
    ));
  }, []);

  const removeOption = useCallback((questionId, optionIndex) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    ));
  }, []);

  const handleSave = useCallback(async () => {
    if (questions.length === 0 || questions.some(q => !q.question.trim())) {
      setError('Please add at least one question and fill in all question texts');
      return;
    }

    // Validate MCQ questions have options
    const mcqQuestions = questions.filter(q => ['radio', 'checkbox'].includes(q.type));
    if (mcqQuestions.some(q => q.options.length < 2)) {
      setError('Multiple choice questions must have at least 2 options');
      return;
    }

    // Validate number questions have proper configuration
    const numberQuestions = questions.filter(q => q.type === 'number');
    if (numberQuestions.some(q => !q.question.trim())) {
      setError('Number questions must have a question text');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const schema = {
        pages: [{
          name: "page1",
          elements: questions.map(q => {
            // Create a clean name from the question text
            const cleanName = q.question.trim()
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, '') // Remove special characters
              .replace(/\s+/g, '_') // Replace spaces with underscores
              .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

            // Normalize type for SurveyJS compatibility and analytics
            let normalizedType = q.type;
            let inputType = undefined;

            switch (q.type) {
              case 'text':
                normalizedType = 'text';
                inputType = 'text';
                break;
              case 'comment':
                normalizedType = 'comment';
                break;
              case 'radio':
                normalizedType = 'radiogroup';
                break;
              case 'checkbox':
                normalizedType = 'checkbox';
                break;
              case 'rating':
                normalizedType = 'rating';
                break;
              case 'boolean':
                normalizedType = 'boolean';
                break;
              case 'number':
                normalizedType = 'text';
                inputType = 'number';
                break;
              case 'file':
                normalizedType = 'file';
                break;
              case 'email':
                normalizedType = 'text';
                inputType = 'email';
                break;
              default:
                normalizedType = 'text';
                inputType = 'text';
            }

            const element = {
              type: normalizedType,
              name: cleanName || `question_${q.id}`,
              title: q.question.trim(),
              isRequired: q.required,
              ...(inputType && { inputType }),
              ...(q.type === 'rating' && { rateMax: 5, rateMin: 1 }),
              ...(q.type === 'boolean' && {
                labelTrue: 'Yes',
                labelFalse: 'No',
                valueTrue: true,
                valueFalse: false
              }),
              ...(q.type === 'file' && {
                maxSize: 10485760, // 10MB
                acceptedTypes: '*/*'
              }),
              ...(q.type === 'number' && {
                inputType: 'number',
                min: 0,
                max: 999999,
                step: 1
              })
            };

            if (['radio', 'checkbox'].includes(q.type) && q.options.length > 0) {
              element.choices = q.options.map((option, idx) => ({
                value: option.trim() || `option_${idx + 1}`,
                text: option.trim() || `Option ${idx + 1}`
              }));
            }

            console.log(`Creating element for question "${q.question}" with type "${q.type}":`, element);
            return element;
          })
        }]
      };

      console.log('Final schema being sent:', schema);
      await axios.post(`/feedback/forms/${eventId}`, { schema });
      setSuccess('Feedback form saved successfully!');
      if (onSave) onSave();
    } catch (err) {
      console.error('Save form error:', err);
      setError(err.response?.data?.message || 'Failed to save feedback form');
    } finally {
      setSaving(false);
    }
  }, [questions, eventId, onSave]);

  return (
    <>
      <Box sx={{
        backgroundColor: theme.palette.background.default,
        py: 4,
        px: 2,
        minHeight: '100vh',
        height: 'auto',
        overflow: 'visible',
        position: 'relative'
      }}>
        <Paper sx={{
          p: 4,
          background: theme.palette.background.paper,
          borderRadius: 4,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.palette.divider}`,
          maxHeight: 'none',
          height: 'auto',
          overflow: 'visible',
          position: 'relative',
          '& .MuiFormControl-root': {
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider,
              },
            },
            '& .MuiSelect-select': {
              backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            },
          },
          '& .MuiMenuItem-root': {
            backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#f5f5f5',
            },
          },
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onCancel}
                variant="outlined"
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  cursor: 'pointer',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: theme.palette.text.primary,
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
            <Button
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              variant="contained"
              disabled={saving}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#4ade80' : '#27ae60',
                cursor: 'pointer',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#22c55e' : '#229954',
                },
                '&:disabled': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(0,0,0,0.12)',
                  cursor: 'not-allowed',
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Form'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{
            mb: 4,
            overflow: 'visible',
            maxHeight: 'none',
            minHeight: 'auto'
          }}>
            <Typography variant="h5" sx={{
              mb: 3,
              color: theme.palette.text.primary,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              📝 Form Questions
            </Typography>

            {questions.map((question, index) => (
              <Box key={question.id} sx={{
                mb: 3,
                p: 4,
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 3,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(0,0,0,0.2)'
                  : '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.3)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    label={`Question ${index + 1}`}
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder="Enter your question here..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? '#333333'
                            : '#f5f5f5',
                        },
                        '&.Mui-focused': {
                          borderColor: theme.palette.primary.main,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.text.secondary,
                        '&.Mui-focused': {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: theme.palette.text.primary }}>Type</InputLabel>
                    <Select
                      value={question.type}
                      label="Type"
                      onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                        borderRadius: 2,
                        '& .MuiSelect-icon': {
                          color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? '#333333'
                            : '#f5f5f5',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MenuItem value="text">Short Text</MenuItem>
                      <MenuItem value="comment">Long Text</MenuItem>
                      <MenuItem value="radio">Single Choice</MenuItem>
                      <MenuItem value="checkbox">Multiple Choice</MenuItem>
                      <MenuItem value="rating">Rating (1-5)</MenuItem>
                      <MenuItem value="boolean">Yes/No</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="file">File Upload</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ color: theme.palette.text.primary }}>Required</InputLabel>
                    <Select
                      value={question.required}
                      label="Required"
                      onChange={(e) => updateQuestion(question.id, 'required', e.target.value)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                        borderRadius: 2,
                        '& .MuiSelect-icon': {
                          color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? '#333333'
                            : '#f5f5f5',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                  {questions.length > 1 && (
                    <IconButton
                      onClick={() => removeQuestion(question.id)}
                      sx={{
                        color: theme.palette.error.main,
                        cursor: 'pointer',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(239,68,68,0.08)'
                            : 'rgba(239,68,68,0.04)',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Options for MCQ questions */}
                {['radio', 'checkbox'].includes(question.type) && (
                  <Box sx={{ mt: 3, p: 3, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{
                      mb: 2,
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      ⚙️ Options
                    </Typography>
                    {question.options.map((option, optionIndex) => (
                      <Box key={optionIndex} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        <TextField
                          size="small"
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? '#333333'
                                  : '#f5f5f5',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.divider,
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.text.secondary,
                              '&.Mui-focused': {
                                color: theme.palette.primary.main,
                              },
                            },
                          }}
                        />
                        {question.options.length > 2 && (
                          <IconButton
                            size="small"
                            onClick={() => removeOption(question.id, optionIndex)}
                            sx={{
                              color: theme.palette.error.main,
                              cursor: 'pointer',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(239,68,68,0.08)'
                                  : 'rgba(239,68,68,0.04)',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <Button
                      size="small"
                      onClick={() => addOption(question.id)}
                      sx={{
                        mt: 1,
                        color: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        cursor: 'pointer',
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(25, 118, 210, 0.08)'
                            : 'rgba(25, 118, 210, 0.04)',
                        }
                      }}
                      variant="outlined"
                    >
                      + Add Option
                    </Button>
                  </Box>
                )}

                {/* Question type indicator */}
                <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={question.type === 'radio' ? 'Single Choice' :
                      question.type === 'checkbox' ? 'Multiple Choice' :
                        question.type === 'comment' ? 'Long Text' :
                          question.type === 'text' ? 'Short Text' :
                            question.type === 'rating' ? 'Rating (1-5)' :
                              question.type === 'boolean' ? 'Yes/No' :
                                question.type === 'number' ? 'Number' :
                                  question.type === 'file' ? 'File Upload' :
                                    question.type === 'email' ? 'Email' : question.type}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.error.main,
                      color: 'white',
                      fontWeight: 500,
                      borderRadius: 2
                    }}
                  />
                  {question.required && (
                    <Chip
                      label="Required"
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.error.main,
                        color: 'white',
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    />
                  )}
                </Box>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addQuestion}
              variant="outlined"
              sx={{
                mt: 3,
                borderColor: theme.palette.mode === 'dark' ? '#4ade80' : '#27ae60',
                color: theme.palette.mode === 'dark' ? '#4ade80' : '#27ae60',
                cursor: 'pointer',
                borderRadius: 2,
                py: 1.5,
                px: 3,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? '#22c55e' : '#229954',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(74, 222, 128, 0.08)'
                    : 'rgba(39, 174, 96, 0.04)',
                  transform: 'translateY(-1px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 12px rgba(74, 222, 128, 0.2)'
                    : '0 4px 12px rgba(39, 174, 96, 0.2)',
                }
              }}
            >
              Add Question
            </Button>
          </Box>
        </Paper>
      </Box>


    </>
  );
};

export default FeedbackFormCreator;
