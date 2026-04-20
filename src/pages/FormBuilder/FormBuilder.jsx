import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, Paper, MenuItem, 
  IconButton, Checkbox, FormControlLabel, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, InputAdornment, Tooltip
} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Layout from "../../components/Layout";

function FormBuilder({ setLoggedIn }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("Smiles");
  const [fields, setFields] = useState([{ id: "", label: "", type: "text", required: false }]);
  
  // Modal States
  const [openConfirm, setOpenConfirm] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(""); // Stores the URL after creation

  const addField = () => setFields([...fields, { id: "", label: "", type: "text", required: false }]);

  const removeField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const handleRequestPublish = (e) => {
    e.preventDefault();
    setOpenConfirm(true);
  };

  const handleFinalSubmit = async () => {
    const lowerOrg = organization.toLowerCase(); // Force lowercase
    const formId = `form_${lowerOrg}_${title.toLowerCase().replace(/\s+/g, "_")}`;
    
    const payload = { 
      organization: lowerOrg,
      id: formId,
      title,
      description,
      createdAt: new Date().toISOString(),
      fields
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/built-forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error(await res.text());

      // Generate the URL based on your routing structure
      // e.g., http://localhost:5173/form/form_Smiles_intake
      const generatedUrl = `${window.location.origin}/form/${formId}`;
      
      setPublishedUrl(generatedUrl);
      setOpenConfirm(false); // Close the "Are you sure?" dialog

      // Reset the form in the background
      setTitle(""); 
      setDescription("");
      setFields([{ id: "", label: "", type: "text", required: false }]);
      
    } catch (err) {
      alert("Error creating form: " + err.message);
      setOpenConfirm(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
    // You could add a small toast notification here if you wanted!
  };

  return (
    <Layout setLoggedIn={setLoggedIn}>
      <Box maxWidth="800px" mx="auto" pb={6}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, position: "relative" }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary', textTransform: 'none', position: 'absolute', left: { xs: 0, md: -100 } }}>
            Back
          </Button>
          <Typography variant="h4" fontWeight="700" sx={{ width: '100%', textAlign: 'center' }}>Create New Form</Typography>
        </Box>
        
        <form onSubmit={handleRequestPublish}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: '16px', border: '1px solid #eee', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" mb={2} fontWeight="600">Form Details</Typography>
            <Stack spacing={3}>
              <TextField label="Form Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Patient Intake" />
              <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the purpose of this form..." />
            </Stack>
          </Paper>

          <Typography variant="h6" mb={2} fontWeight="600">Form Questions</Typography>
          {fields.map((field, index) => (
            <Paper key={index} sx={{ p: 3, mb: 2, borderRadius: '12px', border: '1px solid #eee' }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography color="primary" fontWeight="bold">Question #{index + 1}</Typography>
                <IconButton color="error" onClick={() => removeField(index)} size="small"><DeleteOutlineIcon /></IconButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField label="Field ID" size="small" value={field.id} onChange={(e) => handleFieldChange(index, "id", e.target.value)} required />
                <TextField label="Display Label" size="small" value={field.label} onChange={(e) => handleFieldChange(index, "label", e.target.value)} required />
                <TextField select label="Input Type" size="small" value={field.type} onChange={(e) => handleFieldChange(index, "type", e.target.value)}>
                  <MenuItem value="text">Short Text</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="textarea">Long Text</MenuItem>
                  <MenuItem value="select">Dropdown</MenuItem>
                  <MenuItem value="radio">Multiple Choice</MenuItem>
                </TextField>
                <FormControlLabel control={<Checkbox checked={field.required} onChange={(e) => handleFieldChange(index, "required", e.target.checked)} />} label="Required Field" />
              </Box>
            </Paper>
          ))}

          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addField} sx={{ borderRadius: '8px', textTransform: 'none' }}>Add Question</Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ borderRadius: '8px', textTransform: 'none', px: 4 }}>Publish Form</Button>
          </Stack>
        </form>

        {/* STEP 1: CONFIRMATION DIALOG */}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
          <DialogTitle fontWeight="700">Publish Form?</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you certain you are happy with this form? You will be <strong>unable to edit</strong> it after publishing.</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ pb: 2, px: 3 }}>
            <Button onClick={() => setOpenConfirm(false)} color="inherit">Let me check again</Button>
            <Button onClick={handleFinalSubmit} variant="contained">Yes, Publish Now</Button>
          </DialogActions>
        </Dialog>

        {/* STEP 2: SUCCESS DIALOG (SHOWS THE LINK) */}
        <Dialog 
          open={Boolean(publishedUrl)} 
          onClose={() => setPublishedUrl("")}
          PaperProps={{ sx: { borderRadius: '24px', p: 2, textAlign: 'center' } }}
        >
          <DialogContent>
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <DialogTitle fontWeight="800" sx={{ p: 0, mb: 1 }}>Form Published!</DialogTitle>
            <DialogContentText sx={{ mb: 3 }}>
              Your form is live and ready to accept responses. Share the link below:
            </DialogContentText>
            
            <TextField
              fullWidth
              variant="outlined"
              value={publishedUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy Link">
                      <IconButton onClick={copyToClipboard} edge="end">
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={() => navigate(`/${organization}`)} 
              variant="contained"
              sx={{ borderRadius: '8px', px: 4 }}
            >
              Return to Dashboard
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
}

export default FormBuilder;