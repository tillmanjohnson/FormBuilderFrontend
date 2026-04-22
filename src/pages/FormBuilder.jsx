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
import DownloadIcon from '@mui/icons-material/Download';
import { QRCodeCanvas } from 'qrcode.react'; 
import Layout from "../components/Layout";

function FormBuilder({ setLoggedIn, organization }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Notice we added a default 'options' array to the base state
  const [fields, setFields] = useState([{ id: "", label: "", type: "text", required: false, options: [] }]);
  
  // Modal States
  const [openConfirm, setOpenConfirm] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(""); 

  const addField = () => setFields([...fields, { id: "", label: "", type: "text", required: false, options: [] }]);

  const removeField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    
    // If they change the type away from select/radio, we can clear the options to keep data clean
    if (key === "type" && value !== "select" && value !== "radio") {
      updated[index].options = [];
    }
    
    setFields(updated);
  };

  // --- NEW: Option Handlers ---
  const addOption = (fieldIndex) => {
    const updated = [...fields];
    if (!updated[fieldIndex].options) updated[fieldIndex].options = [];
    updated[fieldIndex].options.push(`Option ${updated[fieldIndex].options.length + 1}`);
    setFields(updated);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updated = [...fields];
    updated[fieldIndex].options.splice(optionIndex, 1);
    setFields(updated);
  };

  const handleOptionChange = (fieldIndex, optionIndex, value) => {
    const updated = [...fields];
    updated[fieldIndex].options[optionIndex] = value;
    setFields(updated);
  };
  // ----------------------------

  const handleRequestPublish = (e) => {
    e.preventDefault();
    setOpenConfirm(true);
  };

  const handleFinalSubmit = async () => {
    const lowerOrg = organization.toLowerCase(); 
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
        credentials: "include", 
        body: JSON.stringify(payload),
      });
      
      // --- NEW: Parse JSON error properly ---
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to publish form.");
      }

      // Generate the URL based on your routing structure
      const generatedUrl = `${window.location.origin}/form/${formId}`;
      
      setPublishedUrl(generatedUrl);
      setOpenConfirm(false); // Close the "Are you sure?" dialog

      // Reset the form in the background
      setTitle(""); 
      setDescription("");
      setFields([{ id: "", label: "", type: "text", required: false, options: [] }]);
      
    } catch (err) {
      // This will now display the clean error message from our Flask backend
      alert(err.message);
      setOpenConfirm(false); 
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
  };

  // Function to download the QR code as a PNG
  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${title.toLowerCase().replace(/\s+/g, "_")}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Layout setLoggedIn={setLoggedIn} userOrg={organization}>
      <Box maxWidth="800px" mx="auto" pb={6}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, position: "relative" }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary', textTransform: 'none', position: 'absolute', left: { xs: 0, md: -100 } }}>
            Back
          </Button>
          <Typography variant="h4" fontWeight="700" sx={{ width: '100%', textAlign: 'center' }}>Create New Form</Typography>
        </Box>
        
        <form onSubmit={handleRequestPublish}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" mb={2} fontWeight="600">Form Details</Typography>
            <Stack spacing={3}>
              <TextField label="Form Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Patient Intake" />
              <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the purpose of this form..." />
            </Stack>
          </Paper>

          <Typography variant="h6" mb={2} fontWeight="600">Form Questions</Typography>
          {fields.map((field, index) => (
            <Paper key={index} sx={{ p: 3, mb: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography color="primary" fontWeight="bold">Question #{index + 1}</Typography>
                <IconButton color="error" onClick={() => removeField(index)} size="small"><DeleteOutlineIcon /></IconButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField 
                  label="Data Column Header (Internal)" 
                  size="small" 
                  placeholder="e.g., patient_first_name"
                  helperText="What you'll see at the top of the data table."
                  value={field.id} 
                  onChange={(e) => handleFieldChange(index, "id", e.target.value)} 
                  required 
                />
                
                <TextField 
                  label="Question Text (Public)" 
                  size="small" 
                  placeholder="e.g., What is your first name?"
                  helperText="The actual question people will see on the form."
                  value={field.label} 
                  onChange={(e) => handleFieldChange(index, "label", e.target.value)} 
                  required 
                />
                
                <TextField select label="Input Type" size="small" value={field.type} onChange={(e) => handleFieldChange(index, "type", e.target.value)}>
                  <MenuItem value="text">Short Text</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="textarea">Long Text</MenuItem>
                  <MenuItem value="select">Dropdown</MenuItem>
                  <MenuItem value="radio">Multiple Choice</MenuItem>
                </TextField>
                
                <FormControlLabel 
                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                  control={<Checkbox checked={field.required} onChange={(e) => handleFieldChange(index, "required", e.target.checked)} />} 
                  label="Required Field" 
                />
              </Box>

              {/* NEW: Options Builder for Select & Radio types */}
              {(field.type === "select" || field.type === "radio") && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: '8px', border: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={2} color="text.secondary">
                    Configure Options
                  </Typography>
                  {(field.options || []).map((opt, optIdx) => (
                    <Box key={optIdx} display="flex" alignItems="center" gap={1} mb={1.5}>
                      <TextField
                        size="small"
                        value={opt}
                        onChange={(e) => handleOptionChange(index, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        fullWidth
                        required
                      />
                      <IconButton color="error" size="small" onClick={() => removeOption(index, optIdx)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<AddIcon />} onClick={() => addOption(index)} sx={{ textTransform: 'none', mt: 1 }}>
                    Add Option
                  </Button>
                </Box>
              )}
            </Paper>
          ))}

          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addField} sx={{ borderRadius: '8px', textTransform: 'none' }}>Add Question</Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ borderRadius: '8px', textTransform: 'none', px: 4 }}>Publish Form</Button>
          </Stack>
        </form>

        {/* DIALOGS REMAIN EXACTLY THE SAME... */}
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

        {/* SUCCESS DIALOG (SHOWS LINK & QR CODE) */}
        <Dialog 
          open={Boolean(publishedUrl)} 
          onClose={() => setPublishedUrl("")}
          PaperProps={{ sx: { borderRadius: '24px', p: 2, textAlign: 'center', minWidth: '350px' } }}
        >
          <DialogContent>
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
            <DialogTitle fontWeight="800" sx={{ p: 0, mb: 1 }}>Form Published!</DialogTitle>
            <DialogContentText sx={{ mb: 3 }}>
              Your form is live! Share the link or print the QR code below.
            </DialogContentText>

            {/* QR Code Display */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Paper 
                elevation={0} 
                sx={{ p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: '16px', display: 'inline-block' }}
              >
                <QRCodeCanvas 
                  id="qr-code-canvas" 
                  value={publishedUrl} 
                  size={160} 
                  level={"H"} // High error correction so it scans easily on phones
                  includeMargin={true}
                />
              </Paper>
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={downloadQRCode} 
                sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Download QR Code
              </Button>
            </Box>
            
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
                sx: { borderRadius: '12px', bgcolor: 'action.hover', color: 'text.secondary' }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={() => navigate(`/${organization}`)} 
              variant="contained"
              sx={{ borderRadius: '8px', px: 4, textTransform: 'none', fontWeight: 600 }}
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