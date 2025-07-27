import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Add as AddIcon, ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "" });
  const [banner, setBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentBannerUrl, setCurrentBannerUrl] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/events/${id}`);
        const event = res.data;
        setForm({
          title: event.title || "",
          description: event.description || "",
          date: event.date ? event.date.slice(0, 10) : "",
          time: event.date ? new Date(event.date).toISOString().slice(11, 16) : "",
        });
        setCurrentBannerUrl(event.bannerUrl || "");
      } catch (err) {
        setError("Failed to load event data");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setBanner(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("date", form.date);
      data.append("time", form.time);
      if (banner) {
        data.append("banner", banner);
      }
      const res = await axios.patch(`/events/${id}`, data);
      setSuccess("Event updated successfully!");
      setTimeout(() => {
        navigate("/my-events");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

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
            onClick={() => navigate("/my-events")}
            sx={{ mr: 2 }}
          >
            Back to My Events
          </Button>
         
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
              slotProps={{ inputLabel: { shrink: true } }}
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
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <Button
            component="label"
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ my: 3 }}
            startIcon={<SaveIcon />}
          >
            {banner ? 'Change Banner' : 'Change Banner (optional)'}
            <input
              type="file"
              accept="image/*"
              hidden
              name="banner"
              onChange={handleFile}
            />
          </Button>
          {banner ? (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Selected: {banner.name}
              </Typography>
            </Box>
          ) : currentBannerUrl ? (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <img src={currentBannerUrl} alt="Current Banner" style={{ maxWidth: 200, maxHeight: 80, borderRadius: 8 }} />
              <Typography variant="body2" color="textSecondary">
                Current Banner
              </Typography>
            </Box>
          ) : null}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            {uploading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 