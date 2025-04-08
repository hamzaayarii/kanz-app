import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import mongoose from 'mongoose';

export const getConversations = async (req, res) => {
    try {
      const userId = req.user._id;
      
      const conversations = await Conversation.aggregate([
        { $match: { participants: new mongoose.Types.ObjectId(userId) } },
        { $lookup: {
            from: 'users',
            localField: 'participants',
            foreignField: '_id',
            as: 'participantsData'
          }
        },
        { $lookup: {
            from: 'messages',
            localField: 'lastMessage',
            foreignField: '_id',
            as: 'lastMessageData'
          }
        },
        { $addFields: {
            participant: {
              $arrayElemAt: [
                { $filter: {
                    input: '$participantsData',
                    as: 'participant',
                    cond: { $ne: ['$$participant._id', new mongoose.Types.ObjectId(userId)] }
                  }
                }, 0
              ]
            },
            lastMessage: { $arrayElemAt: ['$lastMessageData', 0] },
            unreadCount: 0
          }
        },
        { $project: {
            _id: 1,
            participant: {
              _id: 1,
              name: 1,
              avatar: 1,
              status: 1
            },
            lastMessage: {
              _id: 1,
              content: 1,
              createdAt: 1,
              sender: 1
            },
            updatedAt: 1,
            unreadCount: 1
          }
        },
        { $sort: { updatedAt: -1 } }
      ]);
      
      // Get unread counts for each conversation
      for (let convo of conversations) {
        const count = await Message.countDocuments({
          conversationId: convo._id,
          sender: { $ne: userId },
          read: false
        });
        convo.unreadCount = count;
      }
      
      res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
  };

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    // Update all unread messages from other participants to read
    await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: userId },
        read: false 
      },
      { $set: { read: true } }
    );
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const sender = req.user._id;
    
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
    });
    
    // Populate the sender info
    await savedMessage.populate('sender', 'name avatar');
    
    // Emit via socket.io
    req.io.to(conversationId).emit('receive_message', savedMessage);
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};
export const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;
    
    console.log("Request body:", req.body);
    console.log("Participant ID received:", participantId);
    console.log("Current user ID:", userId);
    
    // Check if participantId exists in the request
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is missing from request' });
    }
    
    // Check if participantId is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ 
        message: 'Invalid participant ID format',
        receivedId: participantId
      });
    }
    
    // Convert to ObjectId to ensure proper typing
    const participantObjectId = new mongoose.Types.ObjectId(participantId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userObjectId, participantObjectId] }
    });
    
    if (existingConversation) {
      return res.status(200).json({ conversationId: existingConversation._id });
    }
    
    // Create new conversation with explicit array of ObjectIds
    const newConversation = new Conversation({
      participants: [userObjectId, participantObjectId]
    });
    
    const savedConversation = await newConversation.save();
    
    res.status(201).json({ conversationId: savedConversation._id });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ 
      message: 'Failed to create conversation',
      error: error.message,
      stack: error.stack
    });
  }
};