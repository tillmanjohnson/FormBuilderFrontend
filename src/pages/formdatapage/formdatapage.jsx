import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridRowModes,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { Typography, Box, Button, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

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

  const isEditing =
    selectedRowId !== null &&
    rowModesModel[selectedRowId]?.mode === GridRowModes.Edit;

  function handleLogout() {
    fetch("https://formbuilderbackend-d26n.onrender.com/logout", {
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
      const res = await fetch(`https://formbuilderbackend-d26n.onrender.com/form-submissions/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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

  useEffect(() => {
    async function fetchData() {
      try {
        const authRes = await fetch("https://formbuilderbackend-d26n.onrender.com/check-auth", {
          credentials: "include",
        });
        const authData = await authRes.json();
        const realOrg = authData.organization;
        setUserOrg(realOrg);

        if (orgName !== realOrg) {
          navigate(`/${realOrg}/${formId}`, { replace: true });
          return;
        }

        const res = await fetch("https://formbuilderbackend-d26n.onrender.com/form-submissions", {
          credentials: "include",
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

        const formsRes = await fetch("https://formbuilderbackend-d26n.onrender.com/built-forms-list", {
          credentials: "include",
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
        </Box>
        </Box>

      </Box>
    </Layout>
  );
}