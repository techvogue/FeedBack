// frontend/src/components/AIFeedbackSummary.jsx
import { Card, CardHeader, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchAISummary } from '../api/ai';

export default function AIFeedbackSummary({ eventId }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAISummary(eventId).then(s => {
      if (active) { setSummary(s); setLoading(false); }
    }).catch(() => {
      setSummary('AI summary unavailable.'); setLoading(false);
    });
    return () => { active = false; }
  }, [eventId]);

  return (
    <Card sx={{ mt: 4, background: "#FAFEE6", borderRadius: 2, boxShadow: "0 4px 16px #e6e7e8" }}>
      <CardHeader title="AI-Powered Feedback Insights"/>
      <CardContent>
        {loading
          ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={18}/> <Typography>Loading summary...</Typography>
            </Box>
          : <Typography sx={{ whiteSpace: "pre-line" }}>{summary}</Typography>
        }
      </CardContent>
    </Card>
  );
}
