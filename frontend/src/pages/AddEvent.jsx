import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert,
  CircularProgress,
  Container,
  Paper
} from "@mui/material";
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";

export default function AddEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    date: "", 
    time: "" 
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

    // console.log("Form Data before submission:", form);
    // console.log("Banner file before submission:", banner);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("date", form.date);
      data.append("time", form.time);
      if (banner) {
        data.append("banner", banner); // Appending the file
      } else {
        console.warn("No banner selected for upload."); // Log if no banner
      }

      const res = await axios.post("/events", data);
      setSuccess("Event created successfully!");
      
      // Reset form
      setForm({ title: "", description: "", date: "", time: "" });
      setBanner(null);
      
      // Redirect to events list after 2 seconds (or use onCreated prop if you integrated it with Dashboard)
      setTimeout(() => {
        navigate("/my-events"); // Or use the onCreated prop to notify parent
      }, 2000);
    } catch (err) {
      console.error("Error creating event:", err); // Log full error
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        sx={{
          p: 4,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
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
              slotProps={{ // Improved label shrinking
                inputLabel: { shrink: true },
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
              slotProps={{ // Improved label shrinking
                inputLabel: { shrink: true },
              }}
            />
          </Box>
          
          <Button
            component="label"
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ my: 3 }}
            startIcon={<AddIcon />}
          >
            Upload Event Banner
            <input
              type="file"
              accept="image/*"
              hidden
              name="banner" // <--- CRITICAL FIX: ADDED NAME ATTRIBUTE
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
            color="primary"
            fullWidth
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            {uploading ? "Creating Event..." : "Create Event"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}