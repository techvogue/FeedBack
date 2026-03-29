import { Add as AddIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { getApiErrorMessage } from "../../utils/errorHandling";
import { notifyError, notifySuccess } from "../../utils/notify";

export default function AddEvent() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: ""
  });
  const [banner, setBanner] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setBanner(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setUploading(true);

    if (!banner) {
      notifyError("Please select a banner image for the event.");
      setUploading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("date", form.date);
      data.append("time", form.time);
      if (banner) {
        data.append("banner", banner);
      } else {
        console.warn("No banner selected for upload.");
      }

      await axios.post("/events", data);
      notifySuccess("Event created successfully!");

      // Reset form
      setForm({ title: "", description: "", date: "", time: "" });
      setBanner(null);

      // Redirect to events list after 2 seconds
      setTimeout(() => {
        navigate("/dashboard/my-events");
      }, 2000);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to create event");
      notifyError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100%',
      backgroundColor: theme.palette.background.default,
      width: '100%'
    }}>
      <Paper
        sx={{
          width: '100%',
          px: { xs: 2, sm: 4, lg: 14, xl: 16 },
          minHeight: '100%',
          py: { xs: 2, sm: 4 },
          pb: { xs: 5, sm: 6 },
          background: theme.palette.background.paper,
          borderRadius: 0,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}>
            Create New Event
          </Typography>
        </Box>

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

          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{
              py: 1.5,
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
    </Box>
  );
}