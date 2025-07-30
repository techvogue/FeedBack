import { Box, Typography } from "@mui/material";
import {
  ArcElement, BarElement, CategoryScale,
  Chart as ChartJS, Legend,
  LinearScale,
  Title, Tooltip
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function QuestionAnalyticsChart({ question, answers }) {
  // One key log: always see what data/metadata you're working with
  console.log("[AnalyticsChart] Question type:", question.type, "for question:", question.title || question.label || question.name);

  const type = question.type || "text";

  // Only chart for recognized chartable types
  if (["text", "comment", "email", "file"].includes(type)) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This question type is not suitable for chart analytics.
      </Typography>
    );
  }

  let choices = question.choices || question.options || [];
  choices = choices.map(opt => typeof opt === "object" ? opt.text || opt.value || String(opt) : String(opt));
  let counts = {};

  // Single Choice (radiogroup)
  if (type === "radiogroup" || type === "dropdown") {
    choices.forEach(opt => { counts[opt] = 0; });
    answers.forEach(a => {
      // Match answer to choice
      const optLabel = typeof a === "object" ? a.text || a.value || String(a) : String(a);
      if (counts.hasOwnProperty(optLabel)) counts[optLabel]++;
    });
  }

  // Multiple Choice (checkbox)
  else if (type === "checkbox") {
    choices.forEach(opt => { counts[opt] = 0; });
    answers.forEach(a => {
      const arr = Array.isArray(a) ? a : (a ? [a] : []);
      arr.forEach(val => {
        const optLabel = typeof val === "object" ? val.text || val.value || String(val) : String(val);
        if (counts.hasOwnProperty(optLabel)) counts[optLabel]++;
      });
    });
  } else if (type === "boolean") {
    counts = { Yes: 0, No: 0 };
    answers.forEach(a => {
      if (a === true || a === "Yes" || a === "yes" || a === "1") counts.Yes++;
      else counts.No++;
    });
    choices = ["Yes", "No"];
  } else if (type === "rating") {
    const minRating = question.rateMin ?? 1; // support 0 or custom min
    const maxRating = question.rateMax ?? 5;
    counts = {};
    choices = [];
    for (let i = minRating; i <= maxRating; i++) {
      counts[String(i)] = 0;
      choices.push(String(i));
    }
    answers.forEach(a => {
      const key = String(a);
      if (counts.hasOwnProperty(key)) counts[key]++;
    });
  } else if (type === "number") {
    // Show frequency bar chart for distinct numbers
    counts = {};
    answers.forEach(a => {
      const key = String(a).trim();
      counts[key] = (counts[key] || 0) + 1;
    });
    choices = Object.keys(counts);
  } else {
    // Any other type fallback: do not chart
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This question type is not suitable for chart analytics.
      </Typography>
    );
  }

  const finalLabels = choices;
  const finalData = choices.map(opt => counts[opt] ?? 0);

  if (finalData.every(val => val === 0)) {
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
          "#FDE047", "#A78BFA", "#F472B6", "#6EE7B7", "#9CA3AF"
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // Chart type auto-selection
  let ChartComponent = Bar;
  let chartHeight = 260;
  if (type === "boolean" || type === "radiogroup" || type === "dropdown") {
    ChartComponent = Pie;
    chartHeight = 260;
  } else if (type === "checkbox" || type === "number" || type === "rating") {
    ChartComponent = Bar;
    chartHeight = 290;
  }

  return (
    <Box sx={{ maxWidth: 450, height: chartHeight, mx: "auto", my: 3 }}>
      <ChartComponent
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: { color: "#333", font: { size: 12 } },
            },
            tooltip: {
              backgroundColor: "#111827",
              titleColor: "#FACC15",
              bodyColor: "#E5E7EB",
              padding: 10,
            },
            title: {
              display: true,
              text: question.title || question.label || "Response Analytics",
              font: { size: 16 },
            },
          },
          layout: { padding: 12 },
        }}
      />
    </Box>
  );
}
