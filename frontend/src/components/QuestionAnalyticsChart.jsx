import React from "react";
import { Box, Typography } from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import {
  ArcElement, BarElement, CategoryScale, LinearScale,
  Chart as ChartJS, Legend, Title, Tooltip
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const getOptionLabel = opt => {
  if (!opt) return "";
  if (typeof opt === "object") return opt.text || opt.value || String(opt);
  return String(opt);
};

export default function QuestionAnalyticsChart({ question, answers }) {
  // DEBUG: Show what is passed in for question and answers
  console.log(">>> [QuestionAnalyticsChart] question:", question);
  console.log(">>> [QuestionAnalyticsChart] answers:", answers);

  if (!question || !answers || answers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Not enough data for chart analytics.
      </Typography>
    );
  }

  const type = question.inputType || question.type || "mcq";
  console.log(">>> [QuestionAnalyticsChart] type used:", type);

  let choices = question.choices || question.options || [];
  choices = choices.map(getOptionLabel);

  let counts = {};

  if (["mcq", "radiogroup", "dropdown", "rating", "boolean", "checkbox"].includes(type)) {
    if (type === "boolean") {
      counts = { Yes: 0, No: 0 };
      answers.forEach(a => {
        if (a === true || a === "Yes" || a === "yes" || a === "1") counts.Yes++;
        else counts.No++;
      });
      choices = ["Yes", "No"];
    }
    else if (type === "rating") {
      // DEBUG: Show what rateMin/rateMax are being used
      const minRating = question.rateMin || 1;
      const maxRating = question.rateMax || 5;
      console.log(">>> [QuestionAnalyticsChart] RATING: min", minRating, "max", maxRating);

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
      // DEBUG: Show rating counts
      console.log(">>> [QuestionAnalyticsChart] rating counts:", counts);
    }
    else if (type === "checkbox") {
      choices.forEach(opt => (counts[opt] = 0));
      answers.forEach(a => {
        (Array.isArray(a) ? a : [a]).forEach(val => {
          const optLabel = getOptionLabel(val);
          counts[optLabel] = (counts[optLabel] || 0) + 1;
        });
      });
    }
    else {
      // MCQ, Dropdown, Radio
      choices.forEach(opt => (counts[opt] = 0));
      answers.forEach(a => {
        const optLabel = getOptionLabel(a);
        counts[optLabel] = (counts[optLabel] || 0) + 1;
      });
    }

    // DEBUG: Show final labels & data counts (what will be charted)
    const finalLabels = choices.filter(label => typeof label === "string" && label.length);
    const finalData = finalLabels.map(label => counts[label] || 0);
    console.log(">>> [QuestionAnalyticsChart] chart labels:", finalLabels);
    console.log(">>> [QuestionAnalyticsChart] chart data:", finalData);

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
        }
      ],
    };

    const chartHeight = (type === "rating" || type === "checkbox") ? 290 : 260;
    const ChartComponent = ["mcq", "dropdown", "radiogroup", "boolean"].includes(type) ? Pie : Bar;

    return (
      <Box sx={{ maxWidth: 450, height: chartHeight, mx: "auto", my: 3 }}>
        <ChartComponent
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: "bottom",
                labels: { color: "#333", font: { size: 12 }, }
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

  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      This question type is not suitable for chart analytics.
    </Typography>
  );
}
