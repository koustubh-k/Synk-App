import Chat from "../model/ChatModel.js";
import User from "../model/UserModel.js";
import Message from "../model/MessagesModel.js";
import { getChatbotResponse } from "../services/aiService.js";

// @desc    Access a one-on-one chat
// @route   POST /api/chats
// @access  Protected
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let chat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "username avatar email",
  });

  if (chat.length > 0) {
    res.send(chat[0]);
  } else {
    // Create a new chat if it doesn't exist
    const newChat = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(newChat);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Protected
const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username avatar email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Send a new message
// @route   POST /api/chats/message
// @access  Protected
const sendMessage = async (req, res) => {
  const { chatId, content, mediaUrl } = req.body;

  if ((!content && !mediaUrl) || !chatId) {
    return res
      .status(400)
      .json({ message: "Invalid data passed into request" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    mediaUrl: mediaUrl,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Fetch all messages for a chat
// @route   GET /api/chats/message/:chatId
// @access  Protected
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username avatar email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendAIMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const aiResponse = await getChatbotResponse(message);
    res.status(200).json({ content: aiResponse });
  } catch (error) {
    res.status(500).json({ message: error.message || "AI service error" });
  }
};

export { accessChat, fetchChats, sendMessage, allMessages, sendAIMessage };
