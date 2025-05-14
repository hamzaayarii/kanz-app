import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Paper,
  Chip,
  Badge,
  LinearProgress
} from "@mui/material";
import axios from "axios";
import { 
  BusinessCenter, 
  RemoveCircleOutline, 
  VolumeUp, 
  CheckCircle, 
  PersonSearch, 
  Email as EmailIcon,
  AccessTime,
  Star,
  StarBorder
} from "@mui/icons-material";
import { useTTS } from "../../components/TTS/TTSContext";
import HoverSpeakText from "../../components/TTS/HoverSpeakText";
// import { Helmet } from "react-helmet";

// New component for accountant cards
const AccountantCard = ({ 
  accountant, 
  isAssigned, 
  onAssign, 
  onRemove, 
  isAssigning, 
  isRemoving,
  isTTSEnabled,
  speak,
  disabled,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <Paper 
      elevation={3} 
      className="h-full transition-all duration-300 hover:shadow-lg"
      sx={{ 
        borderRadius: '10px',
        borderLeft: isAssigned ? '5px solid #2dce89' : '5px solid transparent',
        bgcolor: isAssigned ? 'rgba(45, 206, 137, 0.05)' : 'white'
      }}
    >
      <Box p={2.5} className="h-full flex flex-col">
        <Box display="flex" alignItems="center" mb={2}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isAssigned ? 
                <Tooltip title="Currently assigned">
                  <CheckCircle color="success" fontSize="small" />
                </Tooltip> : null
            }
          >
            <Avatar
              alt={`Profile picture of ${accountant.fullName}`}
              src={accountant.avatarUrl || ''}
              sx={{ width: 56, height: "56px", bgcolor: isAssigned ? 'primary.main' : 'grey.400' }}
              aria-label={`Profile picture of ${accountant.fullName}`}
            />
          </Badge>
          
          <Box ml={2} flex="1">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="h3" fontWeight="500">
                {accountant.fullName}
              </Typography>
              <IconButton 
                size="small"
                onClick={() => onToggleFavorite(accountant._id)}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                color={isFavorite ? "warning" : "default"}
              >
                {isFavorite ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" mt={0.5}>
              <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} aria-hidden="true" />
              <Typography 
                variant="body2" 
                color="text.secondary"
                aria-label={`Email: ${accountant.email}`}
              >
                {accountant.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box mb={2}>
          <Divider />
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} aria-hidden="true" />
          <Typography variant="body2" color="text.secondary">
            {accountant.experience || 'Experience: 3+ years'}
          </Typography>
        </Box>
        
        <Box 
          display="flex" 
          mt="auto" 
          pt={1} 
          justifyContent="space-between"
          alignItems="center"
        >
          <Tooltip title={isTTSEnabled ? "Read accountant info aloud" : "Text-to-speech is disabled"}>
            <span>
              <IconButton 
                size="small" 
                onClick={() => {
                  if (isTTSEnabled) {
                    speak(`Accountant details: ${accountant.fullName}. Email: ${accountant.email}.`);
                  }
                }}
                disabled={!isTTSEnabled}
                color={isTTSEnabled ? "primary" : "default"}
                aria-label={`Read information about ${accountant.fullName} aloud`}
              >
                <VolumeUp fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          {isAssigned ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={isRemoving ? <CircularProgress size={16} /> : <RemoveCircleOutline aria-hidden="true" />}
              onClick={() => onRemove(accountant._id)}
              disabled={isRemoving}
              aria-label={`Remove ${accountant.fullName} as your accountant`}
              sx={{ minWidth: '120px' }}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => onAssign(accountant._id)}
              disabled={isAssigning === accountant._id || disabled}
              startIcon={isAssigning === accountant._id ? <CircularProgress size={16} color="inherit" /> : <BusinessCenter aria-hidden="true" />}
              aria-label={`Assign ${accountant.fullName} as your accountant${disabled ? ' (disabled while you have an accountant assigned)' : ''}`}
              sx={{ minWidth: '120px' }}
            >
              {isAssigning === accountant._id ? "Assigning..." : "Assign"}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const AssignAccountant = () => {
  const [accountants, setAccountants] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedId, setAssignedId] = useState(null);
  const [notification, setNotification] = useState({ message: "", severity: "info" });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  
  // Import TTS functions from context
  const { isTTSEnabled, isSpeaking, speak, stop } = useTTS();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userRes = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(userRes.data);
        setAssignedId(userRes.data.assignedTo);
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem("favoriteAccountants");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }

        const accRes = await axios.get(
          "http://localhost:5000/api/users/getUsersByRole?role=accountant",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Add sample data for demonstration
        const enhancedAccountants = accRes.data.map((acc, index) => ({
          ...acc,
          experience: `Experience: ${3 + (index % 5)}+ years`,
          specialization: ["Tax", "Audit", "Advisory", "Corporate", "Small Business"][index % 5],
          rating: (3 + (index % 3)),
        }));
        
        setAccountants(enhancedAccountants);
        
        // Announce page loaded with TTS
        if (isTTSEnabled) {
          speak("Assign accountant page loaded successfully.");
        }
      } catch (err) {
        console.error("Error:", err);
        setNotification({ message: "Error loading data", severity: "error" });
        
        // TTS error message
        if (isTTSEnabled) {
          speak("Error loading data. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, isTTSEnabled, speak]);

  const handleAssign = async (id) => {
    try {
      setAssigningId(id);
      await axios.post(
        "http://localhost:5000/api/users/assign",
        { accountantId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedId(id);
      setNotification({ message: "Accountant assigned successfully!", severity: "success" });
      
      // TTS confirmation
      if (isTTSEnabled) {
        speak("Accountant assigned successfully.");
      }
    } catch (err) {
      console.error("Assign error:", err);
      setNotification({ message: "Failed to assign accountant.", severity: "error" });
      
      // TTS error message
      if (isTTSEnabled) {
        speak("Failed to assign accountant.");
      }
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemove = async (id) => {
    try {
      setRemoving(true);
      await axios.post(
        "http://localhost:5000/api/users/removeAssignment",
        { accountantId: id || assignedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedId(null);
      setNotification({ message: "Assignment removed successfully.", severity: "info" });
      
      // TTS confirmation
      if (isTTSEnabled) {
        speak("Assignment removed successfully.");
      }
    } catch (err) {
      console.error("Remove error:", err);
      setNotification({ message: "Failed to remove assignment.", severity: "error" });
      
      // TTS error message
      if (isTTSEnabled) {
        speak("Failed to remove assignment.");
      }
    } finally {
      setRemoving(false);
    }
  };
  
  const toggleFavorite = (accountantId) => {
    let newFavorites;
    if (favorites.includes(accountantId)) {
      newFavorites = favorites.filter(id => id !== accountantId);
      if (isTTSEnabled) speak("Removed from favorites");
    } else {
      newFavorites = [...favorites, accountantId];
      if (isTTSEnabled) speak("Added to favorites");
    }
    setFavorites(newFavorites);
    localStorage.setItem("favoriteAccountants", JSON.stringify(newFavorites));
  };

  // Function to read all accountants list
  const readAccountantsList = () => {
    if (!isTTSEnabled || accountants.length === 0) return;
    
    // Stop any current speech
    if (isSpeaking) {
      stop();
      return;
    }
    
    const introText = `List of available accountants. Total: ${accountants.length}.`;
    const accountantsText = accountants.map((acc, index) => 
      `Number ${index + 1}: ${acc.fullName}. Email: ${acc.email}.`
    ).join(' ');
    
    speak(`${introText} ${accountantsText}`);
  };

  if (!currentUser || currentUser.role !== "business_owner") return null;

  // Filter accountants by search term
  const filteredAccountants = accountants.filter(accountant =>
    accountant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Add page title for screen readers (WCAG 2.4.2) */}
      {/* <Helmet>
        <title>Assign an Accountant | Argon Dashboard</title>
        <meta name="description" content="Assign or manage your accountant connections" />
      </Helmet> */}
      
      <div className="px-6 py-4" role="main" aria-label="Assign accountant page">
        <Card className="shadow-lg border-0" sx={{ borderRadius: '0.5rem', overflow: 'visible' }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <BusinessCenter sx={{ mr: 1.5, color: 'primary.main' }} aria-hidden="true" />
                <Typography variant="h5" component="h1" fontWeight="500">
                  Assign an Accountant
                </Typography>
              </Box>
            }
            action={
              <Tooltip title={isTTSEnabled ? "Read accountants list" : "Text-to-speech is disabled"}>
                <span>
                  <Button 
                    variant="outlined" 
                    startIcon={<VolumeUp aria-hidden="true" />}
                    onClick={readAccountantsList}
                    disabled={!isTTSEnabled || accountants.length === 0}
                    color={isSpeaking ? "secondary" : "primary"}
                    aria-label={isSpeaking ? "Stop reading list" : "Read accountants list aloud"}
                    size="small"
                  >
                    {isSpeaking ? "Stop Reading" : "Read List"}
                  </Button>
                </span>
              </Tooltip>
            }
            sx={{ 
              bgcolor: 'background.paper',  
              borderBottom: '1px solid rgba(0,0,0,0.07)',
              pb: 1
            }}
          />
          
          {isLoading ? (
            <CardContent>
              <Box py={2} px={1}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Loading accountants...
                </Typography>
                <LinearProgress aria-label="Loading accountants" />
              </Box>
            </CardContent>
          ) : (
            <CardContent>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Choose from our registered accountants or refer to the{" "}
                  <a
                    className="text-blue-600 hover:underline"
                    href="https://www.oect.org.tn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Répertoire des experts comptables agréés en Tunisie (opens in new tab)"
                  >
                    Répertoire des experts comptables agréés en Tunisie
                  </a>
                </Typography>
                
                {/* Search accountants */}
                <Box className="relative" mb={3}>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <PersonSearch color="action" sx={{ ml: 1, mr: 2 }} aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search accountants by name or email..."
                      className="w-full bg-transparent border-0 focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search accountants"
                    />
                  </div>
                </Box>
                
                {/* Stats summary */}
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        p: 2,
                        borderRadius: '8px'
                      }}
                    >
                      <Typography variant="h4" fontWeight="500">{accountants.length}</Typography>
                      <Typography variant="body2">Available Accountants</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        bgcolor: assignedId ? 'success.main' : 'grey.200', 
                        color: assignedId ? 'white' : 'text.secondary',
                        p: 2,
                        borderRadius: '8px'
                      }}
                    >
                      <Typography variant="h4" fontWeight="500">{assignedId ? 1 : 0}</Typography>
                      <Typography variant="body2">Currently Assigned</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        bgcolor: '#5e72e4', 
                        color: 'white',
                        p: 2,
                        borderRadius: '8px'
                      }}
                    >
                      <Typography variant="h4" fontWeight="500">{favorites.length}</Typography>
                      <Typography variant="body2">Favorites</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {filteredAccountants.length === 0 ? (
                <Box className="p-8 text-center" aria-live="polite">
                  <Typography variant="h6" color="text.secondary">No accountants found</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {searchTerm ? "Try changing your search query" : "No accountants are available at the moment"}
                  </Typography>
                </Box>
              ) : (
                <Box aria-label="Accountants listing" role="region">
                  <Grid container spacing={3}>
                    {filteredAccountants.map((accountant) => (
                      <Grid item xs={12} sm={6} md={4} key={accountant._id}>
                        <AccountantCard
                          accountant={accountant}
                          isAssigned={assignedId === accountant._id}
                          onAssign={handleAssign}
                          onRemove={handleRemove}
                          isAssigning={assigningId === accountant._id}
                          isRemoving={removing && assignedId === accountant._id}
                          isTTSEnabled={isTTSEnabled}
                          speak={speak}
                          disabled={!!assignedId && assignedId !== accountant._id}
                          isFavorite={favorites.includes(accountant._id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          )}
        </Card>

        {/* Notification with proper ARIA for screen readers */}
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
            role="alert"
            aria-live="assertive"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default AssignAccountant;