import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
function DisplayForm() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  const { formId } = useParams();
  //const formId = "form_smiles_intake";

  useEffect(() => {
    fetch("http://127.0.0.1:5000/built-forms")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch forms");
        return res.json();
      })
      .then((data) => {
        setForms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading form...</div>;
  if (error) return <div>Error: {error}</div>;

  // Find the specific form
  const selectedForm = forms.find((f) => f.id === formId);

  if (!selectedForm) return <div>Form not found</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const responses = {};

    selectedForm.fields.forEach((field) => {
      if (field.type === "radio") {
        const selected = e.target.querySelector(
          `input[name="${field.id}"]:checked`
        );
        responses[field.id] = selected ? selected.value : "";
      } else {
        responses[field.id] = e.target[field.id]?.value || "";
      }
    });
     // Extract organization from formId: "form_Smiles_test2" -> "Smiles"
  const orgFromId = selectedForm.id.split("_")[1] || "Unknown";
    const submissionPayload = {
      organization: orgFromId,
      formId: selectedForm.id,
      submittedAt: new Date().toISOString(),
      responses: responses,
    };

    console.log("Submitting:", submissionPayload);

    try {
      const res = await fetch("http://127.0.0.1:5000/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await res.json();
      console.log("Success:", data);

      alert("Form submitted successfully!");
      e.target.reset(); // clear form after submit
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error submitting form");
    }
  };

  return (
    <div>
      <h2>{selectedForm.title}</h2>
      <p>{selectedForm.description}</p>

      <form onSubmit={handleSubmit}>
        {selectedForm.fields.map((field) => {
          switch (field.type) {
            case "text":
            case "email":
              return (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    required={field.required}
                  />
                </div>
              );

            case "number":
              return (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input
                    type="number"
                    id={field.id}
                    name={field.id}
                    min={field.validation?.min}
                    max={field.validation?.max}
                    required={field.required}
                  />
                </div>
              );

            case "date":
              return (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input
                    type="date"
                    id={field.id}
                    name={field.id}
                    required={field.required}
                  />
                </div>
              );

            case "textarea":
              return (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <textarea
                    id={field.id}
                    name={field.id}
                    required={field.required}
                  />
                </div>
              );

            case "select":
              return (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <select
                    id={field.id}
                    name={field.id}
                    required={field.required}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );

            case "radio":
              return (
                <div key={field.id}>
                  <label>{field.label}</label>
                  {field.options.map((opt) => (
                    <label key={opt.value} style={{ marginLeft: "10px" }}>
                      <input
                        type="radio"
                        name={field.id}
                        value={opt.value}
                        required={field.required}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              );

            default:
              return null;
          }
        })}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default DisplayForm;