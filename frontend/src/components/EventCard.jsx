// src/components/EventCard.jsx
import {
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { date: formattedDate, time: formattedTime };
};

const EventCard = ({ event, onDelete, onEdit, onEventClick }) => {
  const { date, time } = formatDateTime(event.date);
  const navigate = useNavigate();
  const theme = useTheme();

  const stopPropagation = (e) => e.stopPropagation();

  const handleCardClick = () => {
    if (onEventClick) {
      onEventClick(event.id);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 320,
        width: '100%',
        minWidth: 260,
        maxWidth: 400,
        margin: 'auto',
        transition: 'transform 0.4s ease, box-shadow 0.4s ease',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 14px rgba(0,0,0,0.3)'
          : '0 4px 14px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 6px 20px rgba(0,0,0,0.4)'
            : '0 6px 20px rgba(0,0,0,0.2)',
        },
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
            filter: 'brightness(95%)',
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
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {event.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
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
            <CalendarIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {date}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {time}
            </Typography>
          </Box>

          {event.ticketPrice && event.ticketPrice > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 2 }}>

              <CurrencyRupeeIcon
                sx={{
                  fontSize: 16,
                  color: theme.palette.mode === 'dark' ? '#4ade80' : '#2ecc71',
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#4ade80' : '#2ecc71',
                  fontWeight: 'bold',
                  fontSize: '0.9rem' 
                }}
              >
                {parseFloat(event.ticketPrice).toFixed(2)}
              </Typography>


            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="caption" sx={{
                color: theme.palette.mode === 'dark' ? '#4ade80' : '#2ecc71',
                fontWeight: 'bold'
              }}>
                Free Event
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {onEdit && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={(e) => {
                  stopPropagation(e);
                  onEdit(event.id);
                }}
                sx={{
                  fontSize: '0.75rem',
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                    borderColor: theme.palette.text.primary,
                  },
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
                onClick={(e) => {
                  stopPropagation(e);
                  onDelete(event.id);
                }}
                sx={{
                  fontSize: '0.75rem',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(239,68,68,0.08)'
                      : 'rgba(239,68,68,0.04)',
                  }
                }}
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
