import React, { useEffect, useRef } from "react";
import { CreatorModel } from "survey-creator-core";
import { SurveyCreatorComponent } from "survey-creator-react-ui";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import axios from "../api/axiosInstance";

export default function FeedbackFormBuilder({ eventId, existingSchema, onSave }) {
  const creatorRef = useRef();

  useEffect(() => {
    // Initial schema (if any) from database
    if (creatorRef.current && existingSchema) {
      creatorRef.current.JSON = existingSchema;
    }
  }, [existingSchema]);

  const handleSave = async () => {
    const schema = creatorRef.current.JSON;
    await axios.post(`/api/feedback-form/${eventId}`, { schema });
    if (onSave) onSave(schema);
    alert("Form Saved!");
  };

  const creator = new CreatorModel();
  creator.showSaveButton = true;
  creator.saveSurveyFunc = handleSave;
  creatorRef.current = creator;

  return (
    <SurveyCreatorComponent creator={creatorRef.current} />
  );
}
