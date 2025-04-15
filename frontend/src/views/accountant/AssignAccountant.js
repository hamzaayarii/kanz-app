import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Avatar
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { BusinessCenter, RemoveCircleOutline } from "@mui/icons-material";

const AssignAccountant = () => {
  const [accountants, setAccountants] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedId, setAssignedId] = useState(null);
  const [notification, setNotification] = useState({ message: "", severity: "info" });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(userRes.data);
        setAssignedId(userRes.data.assignedTo);

        const accRes = await axios.get(
          "http://localhost:5000/api/users/getUsersByRole?role=accountant",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAccountants(accRes.data);
      } catch (err) {
        console.error("Error:", err);
        setNotification({ message: "Error loading data", severity: "error" });
      }
    };

    fetchData();
  }, [token]);

  const handleAssign = async (id) => {
    try {
      setAssigningId(id);
      await axios.post(
        "http://localhost:5000/api/users/assign",
        { accountantId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedId(id);
      setNotification({ message: "Accountant assigned!", severity: "success" });
    } catch (err) {
      console.error("Assign error:", err);
      setNotification({ message: "Failed to assign accountant.", severity: "error" });
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      await axios.post(
        "http://localhost:5000/api/users/removeAssignment",
        { accountantId: assignedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedId(null);
      setNotification({ message: "Assignment removed.", severity: "info" });
    } catch (err) {
      console.error("Remove error:", err);
      setNotification({ message: "Failed to remove assignment.", severity: "error" });
    } finally {
      setRemoving(false);
    }
  };

  if (!currentUser || currentUser.role !== "business_owner") return null;

  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <Avatar alt={params.row.fullName} src={params.row.avatarUrl} />
      )
    },
    { field: "fullName", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      renderCell: (params) => {
        const isAssigned = assignedId === params.row._id;
        return isAssigned ? (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={removing ? <CircularProgress size={16} /> : <RemoveCircleOutline />}
            onClick={handleRemove}
            disabled={removing}
          >
            Remove
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => handleAssign(params.row._id)}
            disabled={assigningId === params.row._id || assignedId}
            startIcon={assigningId === params.row._id ? <CircularProgress size={16} /> : <BusinessCenter />}
          >
            {assigningId === params.row._id ? "Assigning..." : "Assign"}
          </Button>
        );
      }
    }
  ];

  return (
    <div className="px-8 py-6">
      <Card className="shadow-md">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Assign an Accountant
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose from the registered accountants or refer to the{" "}
            <a
              className="text-blue-600 hover:underline"
              href="https://www.oect.org.tn/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Répertoire des experts comptables agréés en Tunisie
            </a>
          </Typography>

          <Box className="mt-6" style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={accountants}
              getRowId={(row) => row._id}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableRowSelectionOnClick
              sx={{ fontFamily: "inherit" }}
            />
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={!!notification.message}
        autoHideDuration={4000}
        onClose={() => setNotification({ message: "", severity: "info" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ message: "", severity: "info" })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AssignAccountant;
