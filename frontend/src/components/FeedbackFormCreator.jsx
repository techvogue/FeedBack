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
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import axios from '../api/axiosInstance';

const FeedbackFormCreator = ({ eventId, onSave, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState([
    { id: 1, type: 'text', question: '', required: false, options: [] }
  ]);

  const addQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    setQuestions([...questions, { id: newId, type: 'text', question: '', required: false, options: [] }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
        : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.map((opt, idx) =>
            idx === optionIndex ? value : opt
          )
        }
        : q
    ));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    ));
  };

  const handleSave = async () => {
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

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const schema = {
        questions: questions.map(q => {
          // Create a clean name from the question text
          const cleanName = q.question.trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

          // Normalize type for SurveyJS compatibility and analytics
          let normalizedType = q.type;
          let inputType = undefined;

          if (q.type === 'radio') normalizedType = 'radiogroup';
          if (q.type === 'checkbox') normalizedType = 'checkbox';
          if (q.type === 'comment') normalizedType = 'text';
          if (q.type === 'number') {
            normalizedType = 'number';
            inputType = 'number';
          }
          if (q.type === 'boolean') normalizedType = 'boolean';
          if (q.type === 'rating') normalizedType = 'rating';

          const questionObj = {
            name: cleanName,
            type: normalizedType,
            title: q.question,
            isRequired: q.required
          };

          // Add choices for multiple choice questions
          if (['radio', 'checkbox'].includes(q.type) && q.options.length > 0) {
            questionObj.choices = q.options;
          }

          // Add inputType for number questions
          if (inputType) {
            questionObj.inputType = inputType;
          }

          // Add specific properties for rating questions
          if (q.type === 'rating') {
            questionObj.rateMax = 5;
            questionObj.rateMin = 1;
            questionObj.rateStep = 1;
          }

          return questionObj;
        })
      };

      await axios.post(`/feedback/forms/${eventId}`, { schema });
      setSuccess('Feedback form saved successfully!');
      if (onSave) onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save feedback form');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{
      p: 3,
      background: 'rgba(255,255,255,0.98)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onCancel}
            variant="outlined"
            sx={{
              borderColor: '#3498db',
              color: '#3498db',
              '&:hover': { borderColor: '#2980b9', backgroundColor: 'rgba(52, 152, 219, 0.1)' }
            }}
          >
            Cancel
          </Button>
          <Button
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{
              backgroundColor: '#27ae60',
              '&:hover': { backgroundColor: '#229954' },
              '&:disabled': { backgroundColor: '#bdc3c7' }
            }}
          >
            {saving ? 'Saving...' : 'Save Form'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, backgroundColor: '#fdf2f2', color: '#c53030' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, backgroundColor: '#f0fff4', color: '#2f855a' }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#34495e', fontWeight: 600 }}>
          Form Questions
        </Typography>

        {questions.map((question, index) => (
          <Box key={question.id} sx={{
            mb: 3,
            p: 3,
            border: '2px solid #ecf0f1',
            borderRadius: 2,
            backgroundColor: '#fafbfc',
            '&:hover': { borderColor: '#3498db', backgroundColor: '#f8f9fa' }
          }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                label={`Question ${index + 1}`}
                value={question.question}
                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                placeholder="Enter your question here..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': { borderColor: '#bdc3c7' },
                    '&:hover fieldset': { borderColor: '#3498db' },
                    '&.Mui-focused fieldset': { borderColor: '#3498db' }
                  },
                  '& .MuiInputLabel-root': { color: '#7f8c8d' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#3498db' }
                }}
              />
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel sx={{ color: '#7f8c8d' }}>Type</InputLabel>
                <Select
                  value={question.type}
                  label="Type"
                  onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bdc3c7' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3498db' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3498db' }
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
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: '#7f8c8d' }}>Required</InputLabel>
                <Select
                  value={question.required}
                  label="Required"
                  onChange={(e) => updateQuestion(question.id, 'required', e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bdc3c7' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3498db' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3498db' }
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
                    color: '#e74c3c',
                    '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.1)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            {/* Options for MCQ questions */}
            {['radio', 'checkbox'].includes(question.type) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#34495e', fontWeight: 600 }}>
                  Options:
                </Typography>
                {question.options.map((option, optionIndex) => (
                  <Box key={optionIndex} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      value={option}
                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '& fieldset': { borderColor: '#bdc3c7' },
                          '&:hover fieldset': { borderColor: '#3498db' }
                        }
                      }}
                    />
                    {question.options.length > 2 && (
                      <IconButton
                        size="small"
                        onClick={() => removeOption(question.id, optionIndex)}
                        sx={{ color: '#e74c3c' }}
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
                    color: '#3498db',
                    borderColor: '#3498db',
                    '&:hover': { borderColor: '#2980b9', backgroundColor: 'rgba(52, 152, 219, 0.1)' }
                  }}
                  variant="outlined"
                >
                  Add Option
                </Button>
              </Box>
            )}

            {/* Question type indicator */}
            <Box sx={{ mt: 2 }}>
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
                  backgroundColor: question.required ? '#e74c3c' : '#3498db',
                  color: 'white',
                  fontWeight: 500
                }}
              />
              {question.required && (
                <Chip
                  label="Required"
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    fontWeight: 500
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
            mt: 2,
            borderColor: '#27ae60',
            color: '#27ae60',
            '&:hover': {
              borderColor: '#229954',
              backgroundColor: 'rgba(39, 174, 96, 0.1)'
            }
          }}
        >
          Add Question
        </Button>
      </Box>
    </Paper>
  );
};

export default FeedbackFormCreator;
