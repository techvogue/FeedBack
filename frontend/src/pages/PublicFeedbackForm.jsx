import React, { useEffect, useState } from "react";
import { Model as SurveyModel } from "survey-core";
import { Survey } from "survey-react-ui";
import axios from "../api/axiosInstance";

export default function PublicFeedbackForm({ eventId }) {
  const [schema, setSchema] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    axios.get(`/api/feedback-form/${eventId}`)
      .then(res => setSchema(res.data.schema));
  }, [eventId]);

  if (!schema) return <div>Loading form...</div>;

  const handleComplete = async (survey) => {
    await axios.post(`/api/feedback-response/${eventId}`, { answers: survey.data });
    setSubmitted(true);
  };

  if (submitted) return <div>Thank you for your feedback!</div>;

  const survey = new SurveyModel(schema);

  survey.onComplete.add(handleComplete);

  return <Survey model={survey} />;
}
