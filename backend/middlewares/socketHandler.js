const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling']
  });
  
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token missing'));
      }
      
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      socket.userId = decoded._id;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication failed: ' + error.message));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store active users
    socket.join(`user_${socket.userId}`);
    
    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });
    
    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });
    
    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        const sender = socket.userId;
       
        // Create new message
        const newMessage = new Message({
          conversationId,
          sender,
          content
        });
       
        const savedMessage = await newMessage.save();
       
        // Update conversation's lastMessage and updatedAt
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: savedMessage._id,
          updatedAt: Date.now()
        }).populate('participants', '_id');
       
        // Populate the sender info
        await savedMessage.populate('sender', 'name avatar');
        
        // Get conversation participants
        const conversation = await Conversation.findById(conversationId).populate('participants', '_id');
        
        // Emit to all participants in the conversation
        io.to(conversationId).emit('receive_message', savedMessage);
        
        // Notify participants who might not be in the conversation room
        conversation.participants.forEach(participant => {
          if (participant._id.toString() !== socket.userId) {
            io.to(`user_${participant._id}`).emit('new_message_notification', {
              conversationId,
              message: savedMessage
            });
          }
        });
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });
    
    // Handle typing indicators
    socket.on('typing', async (data) => {
      try {
        const { conversationId, isTyping } = data;
        
        // Get conversation participants
        const conversation = await Conversation.findById(conversationId).select('participants');
        
        // Broadcast to all other participants
        conversation.participants.forEach(participant => {
          if (participant._id.toString() !== socket.userId) {
            socket.to(`user_${participant._id}`).emit('user_typing', {
              conversationId,
              userId: socket.userId,
              isTyping
            });
          }
        });
      } catch (error) {
        console.error('Error handling typing event:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
  
  return io;
}

module.exports = initializeSocket;