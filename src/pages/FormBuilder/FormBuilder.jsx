//a dynamic page that allows a simple (for now) series of questions to be inputed and packages into a json 'builtform'
import { useState } from "react";

function FormBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("Smiles");

  const [fields, setFields] = useState([
    {
      id: "",
      label: "",
      type: "text",
      required: false,
    },
  ]);

  // Add new field
  const addField = () => {
    setFields([
      ...fields,
      { id: "", label: "", type: "text", required: false },
    ]);
  };

  // Remove field
  const removeField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  // Handle field changes
  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formId = `form_${organization}_${title
      .toLowerCase()
      .replace(/\s+/g, "_")}`;

    const payload = {
      organization,
      id: formId,
      title,
      description,
      createdAt: new Date().toISOString(),
      fields,
    };

    console.log("Form JSON:", payload);

    try {
      const res = await fetch("https://formbuilderbackend-d26n.onrender.com/built-forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      alert("Form created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setFields([{ id: "", label: "", type: "text", required: false }]);
    } catch (err) {
      console.error(err);
      alert("Error creating form: " + err.message);
    }
  };

  return (
    <div>
      <h2>Create New Form</h2>

      <form onSubmit={handleSubmit}>
        {/* FORM INFO */}
        <div>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <h3>Fields</h3>

        {/* DYNAMIC FIELDS */}
        {fields.map((field, index) => (
          <div key={index} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <input
              placeholder="Field ID (e.g. first_name)"
              value={field.id}
              onChange={(e) =>
                handleFieldChange(index, "id", e.target.value)
              }
              required
            />

            <input
              placeholder="Label (e.g. First Name)"
              value={field.label}
              onChange={(e) =>
                handleFieldChange(index, "label", e.target.value)
              }
              required
            />

            <select
              value={field.type}
              onChange={(e) =>
                handleFieldChange(index, "type", e.target.value)
              }
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
            </select>

            <label>
              Required
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  handleFieldChange(index, "required", e.target.checked)
                }
              />
            </label>

            <button type="button" onClick={() => removeField(index)}>
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addField}>
          + Add Field
        </button>

        <br /><br />
        <button type="submit">Create Form</button>
      </form>
    </div>
  );
}

export default FormBuilder;