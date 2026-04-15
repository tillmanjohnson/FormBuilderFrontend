import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  MenuItem, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  CircularProgress,
  Container
} from "@mui/material";

function DisplayForm() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formId } = useParams();

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
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const selectedForm = forms.find((f) => f.id === formId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const responses = {};

    selectedForm.fields.forEach((field) => {
      if (field.type === "radio") {
        const selected = e.target.querySelector(`input[name="${field.id}"]:checked`);
        responses[field.id] = selected ? selected.value : "";
      } else {
        responses[field.id] = e.target[field.id]?.value || "";
      }
    });

    const orgFromId = selectedForm.id.split("_")[1] || "Unknown";
    const submissionPayload = {
      organization: orgFromId.toLowerCase(), // Force to lowercase for consistency
      formId: selectedForm.id,
      submittedAt: new Date().toISOString(),
      responses: responses,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });
      if (!res.ok) throw new Error("Failed to submit form");
      alert("Form submitted successfully!");
      e.target.reset();
    } catch (err) {
      alert("Error submitting form");
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  if (error || !selectedForm) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography color="error">{error || "Form not found"}</Typography>
    </Box>
  );

  return (
    /* We replaced <Layout> with this Box to provide a clean, standalone background */
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', // MUI natively swaps this between light/dark
      py: { xs: 4, md: 8 }, 
      px: 2 
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={4} // Use MUI's native shadow system instead of hardcoded hex shadows
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '24px', 
            border: 1, // Standard 1px border
            borderColor: 'divider', // Natively swaps between light gray and dark gray
            bgcolor: 'background.paper' // Ensures the form card itself is the correct surface color
          }}
        >
          {/* Header Section */}
          <Box mb={4} textAlign="center">
            <Typography variant="h4" fontWeight="800" gutterBottom color="text.primary">
              {selectedForm.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {selectedForm.description}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {selectedForm.fields.map((field) => {
                switch (field.type) {
                  case "text":
                  case "email":
                  case "date":
                  case "number":
                    return (
                      <TextField
                        key={field.id}
                        fullWidth
                        label={field.label}
                        type={field.type}
                        id={field.id}
                        name={field.id}
                        required={field.required}
                        variant="outlined"
                        InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                      />
                    );

                  case "textarea":
                    return (
                      <TextField
                        key={field.id}
                        fullWidth
                        multiline
                        rows={4}
                        label={field.label}
                        id={field.id}
                        name={field.id}
                        required={field.required}
                      />
                    );

                  case "select":
                    return (
                      <TextField
                        key={field.id}
                        select
                        fullWidth
                        label={field.label}
                        id={field.id}
                        name={field.id}
                        defaultValue=""
                        required={field.required}
                      >
                        {field.options.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </TextField>
                    );

                  case "radio":
                    return (
                      <FormControl key={field.id} component="fieldset">
                        {/* Fixed the closing tag below from </Typography> to </FormLabel> */}
                        <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          {field.label}
                        </FormLabel> 
                        <RadioGroup row name={field.id}>
                          {field.options.map((opt) => (
                            <FormControlLabel 
                              key={opt.value} 
                              value={opt.value} 
                              control={<Radio />} 
                              label={opt.label} 
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    );

                  default:
                    return null;
                }
              })}

              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                size="large" 
                sx={{ 
                  mt: 2, 
                  borderRadius: '12px', 
                  py: 1.8, 
                  fontWeight: '700', 
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.2)'
                }}
              >
                Submit Response
              </Button>
            </Box>
          </form>
        </Paper>
        
        {/* Optional Branding or Footer */}
        <Box mt={4} textAlign="center">
          <Typography variant="caption" color="text.disabled">
            Powered by YourApp Secure Forms
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default DisplayForm;