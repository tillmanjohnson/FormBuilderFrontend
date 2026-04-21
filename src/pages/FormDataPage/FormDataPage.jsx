import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridRowModes,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { 
  Typography, Box, Button, IconButton, Tooltip,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions // <-- NEW IMPORTS
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import QrCodeIcon from '@mui/icons-material/QrCode'; // <-- NEW IMPORT
import DownloadIcon from '@mui/icons-material/Download'; // <-- NEW IMPORT
import { QRCodeCanvas } from 'qrcode.react'; // <-- NEW IMPORT

import Layout from "../../components/Layout";


export default function FormDataPage({ setLoggedIn }) {
  const { formId, orgName } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // 1. Initialize with "Loading..." instead of an empty string
  const [title, setTitle] = useState("Loading..."); 
  
  const [userOrg, setUserOrg] = useState(null);
  const [rowModesModel, setRowModesModel] = useState({});
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formUrl, setFormUrl] = useState("");
  const [copied, setCopied] = useState(false);
  
  // --- NEW STATE: Controls the QR Modal ---
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const isEditing =
    selectedRowId !== null &&
    rowModesModel[selectedRowId]?.mode === GridRowModes.Edit;

  function handleLogout() {
    fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => setLoggedIn(false));
  }

  const handleEditClick = () => {
    if (!selectedRowId) return;
    setRowModesModel((prev) => ({
      ...prev,
      [selectedRowId]: { mode: GridRowModes.Edit },
    }));
  };

  const handleSaveClick = () => {
    if (!selectedRowId) return;
    setRowModesModel((prev) => ({
      ...prev,
      [selectedRowId]: { mode: GridRowModes.View },
    }));
    setSelectedRowId(null);
  };

  const handleCancelClick = () => {
    if (!selectedRowId) return;
    setRowModesModel((prev) => ({
      ...prev,
      [selectedRowId]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
    setSelectedRowId(null);
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = async (updatedRow, originalRow) => {
    const { id, ...responseFields } = updatedRow;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/form-submissions/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }, 
        body: JSON.stringify({ formId, responses: responseFields }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Update failed:", text);
        return originalRow;
      }
      return updatedRow;
    } catch (err) {
      console.error("Error updating row:", err);
      return originalRow;
    }
  };

  const handleProcessRowUpdateError = (err) => {
    console.error("Row update error:", err);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Swaps icon back after 2 seconds
  };

  // --- NEW FUNCTION: Download QR Code ---
  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas-data");
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

  useEffect(() => {
    async function fetchData() {
      try {
        const authRes = await fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        const authData = await authRes.json();
        const realOrg = authData.organization;
        setUserOrg(realOrg);

        if (orgName !== realOrg) {
          navigate(`/${realOrg}/${formId}`, { replace: true });
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/form-submissions`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const filtered = data.filter((f) => f.formId === formId);

        const allKeys = [];
        filtered.forEach((submission) => {
          Object.keys(submission.responses || {}).forEach((key) => {
            if (!allKeys.includes(key)) allKeys.push(key);
          });
        });

        const cols = allKeys.map((key) => ({
          field: key,
          headerName: key,
          minWidth: 150, // Minimum they can shrink to
          flex: 1,       // They will grow to fill the 900px container
          editable: true,
        }));
        setColumns(cols);

        const generatedRows = filtered.map((s) => {
          const row = { id: s._id };
          Object.keys(s.responses || {}).forEach((key) => {
            row[key] = s.responses[key];
          });
          return row;
        });
        setRows(generatedRows);

        const formsRes = await fetch(`${import.meta.env.VITE_API_URL}/built-forms-list`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        const formsData = await formsRes.json();
        const match = formsData.find((f) => f.id === formId);
        if (match) {
          setTitle(match.title);
          setFormUrl(`${window.location.origin}/form/${formId}`);
        } else {
          setTitle("Form not found");
        }
      } catch (err) {
        console.error(err);
        setTitle("Error loading title"); // Added fallback in case of fetch error
      } finally {
        setLoading(false); // Ensure loading state is turned off after fetch attempts
      }
    }
    setLoading(true);
    fetchData();
  }, [formId, orgName, navigate]);

  return (
    <Layout userOrg={userOrg} setLoggedIn={setLoggedIn}>
      <Box maxWidth="900px" mx="auto">
        
        {/* PAGE HEADER ROW */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            position: "relative",
            mb: -3, 
            minHeight: "48px"
          }}
        >
          {/* LEFT: BACK BUTTON */}
          <Box sx={{ position: "absolute", left: 0 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate(`/${userOrg}`)}
              sx={{ color: 'text.secondary' }}
            >
              Back
            </Button>
          </Box>

          {/* CENTER: TITLE */}
          <Typography variant="h4" fontWeight="600" sx={{ m: 0 }}>
            {title}
          </Typography>
        </Box>

        {/* DATAGRID AREA */}
        <Box sx={{ width: '100%' }}>
          
          {/* EDITABILITY TOOLBAR */}
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              alignItems: "center", 
              mb: 0.5,
              minHeight: "40px" 
            }}
          >
            {!selectedRowId && (
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                Select a row to edit
              </Typography>
            )}
            {selectedRowId && !isEditing && (
              <Tooltip title="Edit selected row">
                <IconButton onClick={handleEditClick} color="primary">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {isEditing && (
              <>
                <Tooltip title="Save">
                  <IconButton onClick={handleSaveClick} color="success">
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton onClick={handleCancelClick} color="error">
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {/* DATAGRID */}
          <Box sx={(theme) => ({ 
            height: 500,
            borderRadius: '12px', 
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            
            '& .MuiDataGrid-columnHeader:first-of-type, & .MuiDataGrid-cell:first-of-type': {
              pl: '24px !important',
            },

            // 1. Uses native paper background instead of hardcoded grays
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },

            // 2. Uses MUI's built-in subtle hover opacity for zebra stripes
            '& .MuiDataGrid-row:nth-of-type(even)': {
              bgcolor: theme.palette.action.hover,
            },

            // 3. Uses MUI's slightly darker 'selected' opacity for the actual hover state
            '& .MuiDataGrid-row:hover': {
              bgcolor: `${theme.palette.action.selected} !important`, 
              cursor: 'pointer',
            },

            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },

            '& .MuiDataGrid-overlay': {
              bgcolor: theme.palette.background.default,
              fontSize: '1.1rem',
              color: 'text.secondary',
            }
          })}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              localeText={{ 
                noRowsLabel: 'No Data',
              }}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              editMode="row"
              rowModesModel={rowModesModel}
              onRowModesModelChange={setRowModesModel}
              onRowEditStop={handleRowEditStop}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              onRowSelectionModelChange={(selection) => {
                const id = selection.ids
                  ? [...selection.ids][0] ?? null
                  : selection[0] ?? null;
                setSelectedRowId(id);
              }}
              sx={{ 
                borderRadius: '12px', 
                overflow: 'hidden' 
              }}
            />
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-start', 
              alignItems: 'center', 
              mb: 4, 
              mt: 1,
              gap: 1 
            }}
          >
            <Typography 
              variant="body2" 
              sx={(theme) => ({ 
                color: 'text.secondary', 
                bgcolor: theme.palette.action.hover, // Auto-adapts perfectly
                px: 1.5, 
                py: 0.5, 
                borderRadius: '4px', 
                border: `1px solid ${theme.palette.divider}`,
                fontSize: '0.8rem'
              })}
            >
              {formUrl}
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy Link"}>
              <IconButton size="small" onClick={handleCopyLink} color={copied ? "success" : "primary"}>
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            {/* --- NEW: QR Code Trigger Button --- */}
            {formUrl && (
              <Tooltip title="View QR Code">
                <IconButton size="small" onClick={() => setQrDialogOpen(true)} color="primary">
                  <QrCodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* --- NEW: QR Code Modal --- */}
        <Dialog 
          open={qrDialogOpen} 
          onClose={() => setQrDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: '24px', p: 2, textAlign: 'center', minWidth: '300px' } }}
        >
          <DialogTitle fontWeight="800">Form QR Code</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '2px dashed', 
                  borderColor: 'divider',
                  borderRadius: '16px',
                  display: 'inline-block'
                }}
              >
                <QRCodeCanvas 
                  id="qr-code-canvas-data" 
                  value={formUrl || "https://"} 
                  size={160} 
                  level={"H"} 
                  includeMargin={true}
                />
              </Paper>
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={downloadQRCode} 
                variant="contained"
                sx={{ mt: 3, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Download PNG
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={() => setQrDialogOpen(false)} color="inherit" sx={{ fontWeight: 600, textTransform: 'none' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
}