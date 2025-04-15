import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Snackbar,
  Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const AccountantBusinessOwners = () => {
  const [businessOwners, setBusinessOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", severity: "info" });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;

    const fetchBusinessOwners = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/users/assigned-business-owners", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBusinessOwners(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setNotification({
          message: err.response?.data?.message || "Failed to load assigned business owners.",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessOwners();
  }, [token]);

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
    { field: "email", headerName: "Email", flex: 1.5 }
  ];

  return (
    <div className="px-8 py-6">
      <Card className="shadow-md">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            My Assigned Business Owners
          </Typography>

          {loading ? (
            <Box className="flex justify-center my-6">
              <CircularProgress />
            </Box>
          ) : businessOwners.length === 0 ? (
            <Typography color="text.secondary">No assigned business owners found.</Typography>
          ) : (
            <Box className="mt-6" style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={businessOwners}
                getRowId={(row) => row._id}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableRowSelectionOnClick
                sx={{ fontFamily: "inherit" }}
              />
            </Box>
          )}
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

export default AccountantBusinessOwners;
