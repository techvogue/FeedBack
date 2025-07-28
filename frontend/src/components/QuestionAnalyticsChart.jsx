import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Box, Typography } from "@mui/material";

// Chart.js v4 registration (add at top level ONCE, e.g. in App.js or main entry point)
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function QuestionAnalyticsChart({ question, responses }) {
  // Ensure question and responses are valid
  if (!question || !responses || responses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Not enough data for chart analytics.
      </Typography>
    );
  }

  // Extract all answers for this specific question based on its name
  // The 'question' prop should contain the 'name' property from the survey definition
  const answers = responses
    .map(r => r.answers[question.name])
    .filter(a => a !== undefined && a !== null);

  // If no answers for this question, don't show chart
  if (answers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        No responses for this question yet.
      </Typography>
    );
  }

  // For various types:
  if (["mcq", "dropdown", "radiogroup", "rating", "boolean", "checkbox"].includes(question.type)) {
    let counts = {};
    let labels = [];

    if (question.type === "boolean") {
      counts = { Yes: 0, No: 0 };
      answers.forEach(a => { if (a === true || a === "Yes") counts.Yes++; else counts.No++; });
      labels = ["Yes", "No"];
    } else if (question.type === "rating") {
      // Ratings: count occurrences of each rating value
      for (let i = 1; i <= (question.rateMax || 5); i++) {
        counts[i] = 0;
        labels.push(String(i));
      }
      answers.forEach(a => {
        if (counts.hasOwnProperty(a)) { // Ensure rating is within expected range
          counts[a]++;
        }
      });
    } else { // mcq, dropdown, radiogroup, checkbox
      // Get options from question.choices or question.options, handling SurveyJS object format {value: 'v', text: 't'}
      const options = question.choices || question.options || [];
      options.forEach(opt => counts[opt.value || opt.text || opt] = 0);

      answers.forEach(a => {
        if (Array.isArray(a)) { // For checkbox (multiple selections)
          a.forEach(val => {
            const optionValue = typeof val === 'object' && val !== null ? val.value || val.text : val;
            counts[optionValue] = (counts[optionValue] || 0) + 1;
          });
        } else { // For single choice types
          const optionValue = typeof a === 'object' && a !== null ? a.value || a.text : a;
          counts[optionValue] = (counts[optionValue] || 0) + 1;
        }
      });
      labels = options.map(opt => opt.text || opt.value || opt); // Use text for labels if available
    }

    // Filter out labels with zero counts if they are not explicitly defined (e.g., for rating scales)
    const finalLabels = labels.length > 0 ? labels : Object.keys(counts).filter(key => counts[key] > 0 || labels.includes(key));
    const finalData = finalLabels.map(label => counts[label] || 0);

    // If there are less than 1 data point (e.g., no responses, or only one type of response),
    // a chart might not be very informative.
    if (finalData.filter(val => val > 0).length < 1) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Not enough diverse data for chart analytics.
        </Typography>
      );
    }

    const chartData = {
      labels: finalLabels,
      datasets: [
        {
          label: "Responses",
          data: finalData,
          backgroundColor: [
            "#7C3AED", "#4F46E5", "#38BDF8", "#34D399", "#F59E42", "#EF4444", "#E5E7EB",
            "#FDE047", "#A78BFA", "#F472B6", "#6EE7B7", "#9CA3AF" // More colors for more options
          ],
          borderColor: [
            "#6D28D9", "#4338CA", "#0EA5E9", "#10B981", "#D97706", "#DC2626", "#D1D5DB",
            "#FACC15", "#8B5CF6", "#EC4899", "#34D399", "#6B7280"
          ],
          borderWidth: 1,
        },
      ],
    };

    // Use Pie for MCQ/dropdown/boolean, Bar for rating/checkbox
    if (["mcq", "dropdown", "radiogroup", "boolean"].includes(question.type)) {
      return (
        <Box sx={{ maxWidth: 340, mx: 'auto', mb: 3 }}>
          <Pie data={chartData} />
        </Box>
      );
    }
    // Bar for rating/checkbox group
    return (
      <Box sx={{ maxWidth: 380, mx: 'auto', mb: 3 }}>
        <Bar data={chartData} />
      </Box>
    );
  }

  // For everything else (text, comment, file, etc.), just say "No chart available"
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      This question type is not suitable for chart analytics.
    </Typography>
  );
}
