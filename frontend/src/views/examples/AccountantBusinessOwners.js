import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Snackbar,
  Alert,
  CardHeader
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
        const res = await axios.get("http://localhost:5000/api/users/assigned-business-owners2", {
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
    <div className="px-8 py-6 mt-6">
      <Card className="shadow-md">
        <CardHeader title="My Assigned Business Owners" />
        <CardContent>
          {loading ? (
            <Box className="flex justify-center my-6">
              <CircularProgress />
            </Box>
          ) : businessOwners.length === 0 ? (
            <Typography color="text.secondary">No assigned business owners found.</Typography>
          ) : (
            <Box className="mt-6" style={{ height: 450, width: "100%" }}>
              <DataGrid
                rows={businessOwners}
                getRowId={(row) => row._id}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 5, page: 0 },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                sx={{
                  fontFamily: "inherit",
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'grey.100',
                    fontWeight: 'bold',
                  },
                  '& .MuiDataGrid-row:nth-of-type(odd)': {
                    backgroundColor: 'grey.50',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  },
                  '& .MuiDataGrid-footerContainer': {
                     borderTop: '1px solid rgba(224, 224, 224, 1)',
                  },
                }}
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
