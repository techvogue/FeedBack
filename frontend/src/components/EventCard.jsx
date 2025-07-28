// src/components/EventCard.jsx
import {
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return { date: formattedDate, time: formattedTime };
};

const EventCard = ({ event, onDelete, onEdit }) => {
  const { date, time } = formatDateTime(event.date);
  const navigate = useNavigate();

  // Handler to prevent click event from bubbling from buttons
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <Card
      onClick={() => navigate(`/events/${event.id}`)}
      sx={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 320,
        width: '100%',
        minWidth: 260,
        maxWidth: 400,
        margin: 'auto',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.03)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
        }
      }}
    >
      <Box sx={{ height: '30%', minHeight: 80, maxHeight: 100, width: '100%' }}>
        <CardMedia
          component="img"
          image={event.bannerUrl || 'https://via.placeholder.com/400x150?text=Event+Banner'}
          alt={event.title}
          sx={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: '#1f1f1f', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {event.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#333',
            mb: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 40,
          }}
        >
          {event.description}
        </Typography>
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CalendarIcon sx={{ fontSize: 16, color: '#555' }} />
            <Typography variant="caption" color="text.secondary">
              {date}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: '#555' }} />
            <Typography variant="caption" color="text.secondary">
              {time}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {onEdit && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={e => { stopPropagation(e); onEdit(event.id); }}
                sx={{
                  color: '#333',
                  borderColor: '#ccc',
                  fontSize: '0.75rem',
                  '&:hover': {
                    borderColor: '#999',
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  }
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={e => { stopPropagation(e); onDelete(event.id); }}
                sx={{ fontSize: '0.75rem' }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;
