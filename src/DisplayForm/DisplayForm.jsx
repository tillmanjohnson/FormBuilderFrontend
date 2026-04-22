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
  Container,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions
} from "@mui/material";

function DisplayForm() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formId } = useParams();

  // --- NEW STATE VARIABLES ---
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionPayload, setSubmissionPayload] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/built-forms`)
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

  // STEP 1: Intercept the form submission to build the payload and open the dialog
  const handleRequestSubmit = (e) => {
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
    const payload = {
      organization: orgFromId.toLowerCase(),
      formId: selectedForm.id,
      submittedAt: new Date().toISOString(),
      responses: responses,
    };

    setSubmissionPayload(payload);
    setOpenConfirm(true); // Open the "Are you sure?" box
  };

  // STEP 2: The actual API call runs only if they click "Yes, Submit"
  const handleFinalSubmit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/submit-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });
      if (!res.ok) throw new Error("Failed to submit form");
      
      // Success! Close the dialog and change the UI to the "Thank You" dead end.
      setOpenConfirm(false);
      setIsSubmitted(true);
    } catch (err) {
      alert("Error submitting form. Please try again.");
      setOpenConfirm(false);
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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      py: { xs: 4, md: 8 }, 
      px: 2 
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '24px', 
            border: 1, 
            borderColor: 'divider', 
            bgcolor: 'background.paper' 
          }}
        >
          {/* CONDITIONAL RENDERING: Show "Dead End" if submitted, otherwise show the form */}
          {isSubmitted ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h5" fontWeight="700" color="text.primary" gutterBottom>
                Thank You!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your response has been received. You may now close this page.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Header Section */}
              <Box mb={4} textAlign="center">
                <Typography variant="h4" fontWeight="800" gutterBottom color="text.primary">
                  {selectedForm.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedForm.description}
                </Typography>
              </Box>

              <form onSubmit={handleRequestSubmit}>
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
            </>
          )}
        </Paper>
        
        {/* Optional Branding or Footer */}
        <Box mt={4} textAlign="center">
          <Typography variant="caption" color="text.disabled">
            Powered by YourApp Secure Forms
          </Typography>
        </Box>
      </Container>

      {/* --- CONFIRMATION DIALOG --- */}
      <Dialog 
        open={openConfirm} 
        onClose={() => setOpenConfirm(false)} 
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle fontWeight="700">Submit Responses?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you are ready to submit? You will be <strong>unable to edit</strong> your responses after submitting.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setOpenConfirm(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleFinalSubmit} variant="contained" sx={{ borderRadius: '8px' }}>
            Yes, Submit
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default DisplayForm;