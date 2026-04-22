// Is this file obsolete? 

// It seems to be a simple form component that submits data to the backend.
// If it's not being used anywhere, we might consider removing it to keep the codebase clean. However, if it's intended for future use or as a template, we can keep it for now.
// Let's check if it's being imported or used in any other part of the application before deleting it. Apr 14th


import { useState } from "react";

export default function FormComponent() {
  const questions = [
  { key: "name", label: "What is your name?" },
  { key: "email", label: "What is your email?" },
  { key: "reason_for_visit", label: "What is your reason for visiting?" },
  { key: "date", label: "date of visit" },
  { key: "insurance_provider", label: "What is your insurance provider?" },
  { key: "allergies", label: "Do you have any allergies?" },
];

  const [answers, setAnswers] = useState({});

  const handleChange = (key, value) => {
  setAnswers({
    ...answers,
    [key]: value
  });
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      formId: "default-survey",
      answers: answers
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/submit-form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Server response:", data);

  } catch (err) {
    console.error("Submission failed:", err);
  }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>default form</h1>

      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
  <div key={question.key} style={{ marginBottom: "20px" }}>
    <label>
      <strong>{question.label}</strong>
    </label>

    <br />

    <input
      type="text"
      value={answers[question.key] || ""}
      onChange={(e) => handleChange(question.key, e.target.value)}
      style={{
        width: "100%",
        padding: "8px",
        marginTop: "5px"
      }}
    />
  </div>
))}

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}