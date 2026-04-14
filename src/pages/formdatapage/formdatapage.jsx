import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridRowModes,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { Typography, Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import Layout from "../../components/Layout";


export default function FormDataPage({ setLoggedIn }) {
  const { formId, orgName } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [title, setTitle] = useState("");
  const [userOrg, setUserOrg] = useState(null);
  const [rowModesModel, setRowModesModel] = useState({});
  const [selectedRowId, setSelectedRowId] = useState(null);

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
          width: 150,
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
        setTitle(match ? match.title : "Form not found");
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [formId, orgName, navigate]);

  return (
    <Layout userOrg={userOrg} setLoggedIn={setLoggedIn}>
      <Box maxWidth="900px" mx="auto">
        
        {/* Header */}
        <Typography variant="h4" gutterBottom>
          {title || formId}
        </Typography>

        {/* Editability toolbar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 4 }}>
          {!selectedRowId && (
            <span style={{ fontSize: 13, color: "#888", marginRight: 8 }}>
              Select a row to edit
            </span>
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
        </div>

        {/* DataGrid */}
        <div style={{ height: 500 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={!rows.length}
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
          />
        </div>

      </Box>
    </Layout>
  );
}