import { Add as AddIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

export default function AddEvent() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  console.log('📍 Current Page: Add Event Page');
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    ticketPrice: ""
  });
  const [banner, setBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setBanner(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");

    if (!banner) {
      setError("Please select a banner image for the event.");
      setUploading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("date", form.date);
      data.append("time", form.time);
      if (form.ticketPrice) {
        data.append("ticketPrice", form.ticketPrice);
      }
      if (banner) {
        data.append("banner", banner);
      } else {
        console.warn("No banner selected for upload.");
      }

      const res = await axios.post("/events", data);
      setSuccess("Event created successfully!");

      // Reset form
      setForm({ title: "", description: "", date: "", time: "", ticketPrice: "" });
      setBanner(null);

      // Redirect to events list after 2 seconds
      setTimeout(() => {
        navigate("/my-events");
      }, 2000);
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      py: 4,
      px: 2
    }}>
      <Container maxWidth="md">
        <Paper
          sx={{
            p: 4,
            background: theme.palette.background.paper,
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard")}
              variant="outlined"
              sx={{
                mr: 2,
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.04)',
                }
              }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" component="h1" sx={{
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}>
              Create New Event
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              name="title"
              label="Event Title"
              fullWidth
              value={form.title}
              onChange={handleInput}
              margin="normal"
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  },
                },
              }}
            />

            <TextField
              name="description"
              label="Event Description"
              fullWidth
              value={form.description}
              onChange={handleInput}
              margin="normal"
              multiline
              rows={4}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                name="date"
                label="Event Date"
                type="date"
                fullWidth
                value={form.date}
                onChange={handleInput}
                required
                variant="outlined"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.04)',
                    },
                  },
                }}
              />

              <TextField
                name="time"
                label="Event Time"
                type="time"
                fullWidth
                value={form.time}
                onChange={handleInput}
                required
                variant="outlined"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.04)',
                    },
                  },
                }}
              />
            </Box>

            <TextField
              name="ticketPrice"
              label="Ticket Price (Optional)"
              type="number"
              fullWidth
              value={form.ticketPrice}
              onChange={handleInput}
              margin="normal"
              variant="outlined"
              placeholder="0.00"
              inputProps={{
                min: 0,
                step: 0.01
              }}
              helperText="Leave empty for free events"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  },
                },
              }}
            />

            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{
                my: 3,
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.04)',
                  borderColor: theme.palette.text.primary,
                }
              }}
              startIcon={<AddIcon />}
            >
              Upload Event Banner
              <input
                type="file"
                accept="image/*"
                hidden
                name="banner"
                onChange={handleFile}
              />
            </Button>

            {banner && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Selected: {banner.name}
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(0,0,0,0.12)',
                }
              }}
            >
              {uploading ? "Creating Event..." : "Create Event"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}