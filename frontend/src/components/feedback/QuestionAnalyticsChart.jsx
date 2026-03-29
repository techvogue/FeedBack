import { Box, Typography, useTheme } from "@mui/material";
import {
  ArcElement, BarElement, CategoryScale,
  Chart as ChartJS, Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title, Tooltip
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement);

export default function QuestionAnalyticsChart({ question, answers }) {
  const theme = useTheme();

  // Check for number type using inputType or chartType property
  let type = question.type || "text";
  if (question.inputType === 'number' || question.chartType === 'number') {
    type = 'number';
  }

  // Only chart for recognized chartable types
  if (["text", "comment", "email", "file"].includes(type)) {
    return (
      <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
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
      if (Object.prototype.hasOwnProperty.call(counts, optLabel)) counts[optLabel]++;
    });
  }

  // Multiple Choice (checkbox)
  else if (type === "checkbox") {
    choices.forEach(opt => { counts[opt] = 0; });
    answers.forEach(a => {
      const arr = Array.isArray(a) ? a : (a ? [a] : []);
      arr.forEach(val => {
        const optLabel = typeof val === "object" ? val.text || val.value || String(val) : String(val);
        if (Object.prototype.hasOwnProperty.call(counts, optLabel)) counts[optLabel]++;
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
      if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key]++;
    });
  } else if (type === "number") {

    // Convert all answers to numbers and filter out invalid values
    const numericAnswers = answers
      .map(a => {
        const num = parseFloat(a);
        return isNaN(num) ? null : num;
      })
      .filter(num => num !== null);

    if (numericAnswers.length === 0) {
      return (
        <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
          No valid numeric data found for chart analytics.
        </Typography>
      );
    }

    // Create frequency distribution
    counts = {};
    numericAnswers.forEach(num => {
      const key = String(num);
      counts[key] = (counts[key] || 0) + 1;
    });

    // Sort choices numerically
    choices = Object.keys(counts).sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      return numA - numB;
    });
  } else {
    // Any other type fallback: do not chart
    return (
      <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
        This question type is not suitable for chart analytics.
      </Typography>
    );
  }

  const finalLabels = choices;
  const finalData = choices.map(opt => counts[opt] ?? 0);
  const totalResponses = finalData.reduce((sum, val) => sum + val, 0);

  if (finalData.every(val => val === 0)) {
    return (
      <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
        Not enough diverse data for chart analytics.
      </Typography>
    );
  }

  // Calculate percentages
  const percentages = finalData.map(count =>
    totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : '0.0'
  );

  // Theme-aware colors for chart
  const chartColors = theme.palette.mode === 'dark'
    ? [
      "#7C3AED", "#4F46E5", "#38BDF8", "#34D399", "#F59E42", "#EF4444", "#E5E7EB",
      "#FDE047", "#A78BFA", "#F472B6", "#6EE7B7", "#9CA3AF"
    ]
    : [
      "#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#6B7280",
      "#EAB308", "#A855F7", "#EC4899", "#14B8A6", "#9CA3AF"
    ];

  const chartData = {
    labels: finalLabels,
    datasets: [
      {
        label: "Responses",
        data: finalData,
        backgroundColor: type === "number" ? '#7C3AED' : chartColors,
        borderColor: type === "number" ? '#5B21B6' : (theme.palette.mode === 'dark' ? '#374151' : '#ffffff'),
        borderWidth: type === "number" ? 2 : 2,
        borderRadius: type === "number" ? 4 : 0,
        borderSkipped: false,
        barThickness: type === "number" ? 35 : 'flex',
        maxBarThickness: type === "number" ? 40 : 50,
      },
    ],
  };

  // Chart type auto-selection
  let ChartComponent = Bar;
  let chartHeight = 260;
  let chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: theme.palette.text.primary,
          font: { size: 12 },
          usePointStyle: true,
          padding: 15,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets && data.datasets[0]) {
              return data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                const percentage = percentages[index];
                return {
                  text: `${label} (${value} - ${percentage}%)`,
                  fillStyle: type === "number" ? '#7C3AED' : chartColors[index % chartColors.length],
                  strokeStyle: type === "number" ? '#7C3AED' : chartColors[index % chartColors.length],
                  lineWidth: 0,
                  hidden: false,
                  index: index,
                  color: theme.palette.text.primary,
                  fontColor: theme.palette.text.primary
                };
              });
            }
            return [];
          }
        },
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF',
        titleColor: theme.palette.mode === 'dark' ? '#F9FAFB' : '#111827',
        bodyColor: theme.palette.mode === 'dark' ? '#F9FAFB' : '#374151',
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed.y || context.parsed;
            const percentage = percentages[context.dataIndex];
            return `${label}: ${value} responses (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: question.title || question.label || "Response Analytics",
        font: { size: 16, weight: 'bold' },
        color: theme.palette.text.primary,
        padding: { top: 10, bottom: 10 }
      },
    },
    layout: { padding: 12 },
    // Global color configuration
    color: theme.palette.text.primary,
  };

  if (type === "boolean" || type === "radiogroup" || type === "dropdown") {
    ChartComponent = Pie;
    chartHeight = 260;
  } else if (type === "checkbox" || type === "rating") {
    ChartComponent = Bar;
    chartHeight = 290;
    // Add scales for Bar charts
    chartOptions.scales = {
      x: {
        ticks: {
          color: theme.palette.text.primary,
          font: { size: 11 }
        },
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: theme.palette.text.primary,
          font: { size: 11 },
          callback: function (value) {
            return Math.round(value);
          },
          stepSize: 1,
          min: 0,
          max: function (context) {
            const maxValue = Math.max(...context.chart.data.datasets[0].data);
            if (maxValue <= 5) return 5;
            if (maxValue <= 10) return 10;
            if (maxValue <= 15) return 15;
            if (maxValue <= 20) return 20;
            return Math.ceil(maxValue / 5) * 5;
          }
        },
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        }
      }
    };
  } else if (type === "number") {
    ChartComponent = Bar;
    chartHeight = 290;
    // Add scales for Bar charts (number type)
    chartOptions.scales = {
      x: {
        ticks: {
          color: theme.palette.text.primary,
          font: { size: 11 }
        },
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: theme.palette.text.primary,
          font: { size: 11 },
          callback: function (value) {
            return Math.round(value);
          },
          stepSize: 1,
          min: 0,
          max: function (context) {
            const maxValue = Math.max(...context.chart.data.datasets[0].data);
            if (maxValue <= 5) return 5;
            if (maxValue <= 10) return 10;
            if (maxValue <= 15) return 15;
            if (maxValue <= 20) return 20;
            return Math.ceil(maxValue / 5) * 5;
          }
        },
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        }
      }
    };
  }

  return (
    <Box sx={{ maxWidth: 450, height: chartHeight, mx: "auto", my: 3 }}>
      <ChartComponent
        data={chartData}
        options={chartOptions}
      />
    </Box>
  );
}
