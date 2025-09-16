import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./model/UserModel.js";
import Chat from "./model/ChatModel.js";
import Message from "./model/MessagesModel.js";
import connectDB from "./config/database.js";

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Chat.deleteMany();
    await Message.deleteMany();

    console.log("Existing data cleared");

    // Create 5 users
    const users = [
      {
        username: "john_doe",
        email: "john@example.com",
        password: "password123",
        avatar:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        isOnline: true,
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password: "password123",
        avatar:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        isOnline: false,
      },
      {
        username: "mike_johnson",
        email: "mike@example.com",
        password: "password123",
        avatar:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        isOnline: true,
      },
      {
        username: "sarah_wilson",
        email: "sarah@example.com",
        password: "password123",
        avatar:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        isOnline: false,
      },
      {
        username: "alex_brown",
        email: "alex@example.com",
        password: "password123",
        avatar:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        isOnline: true,
      },
    ];

    const createdUsers = await User.create(users);
    console.log("5 users created successfully");

    // Create 2 chat groups
    const chatGroups = [
      {
        isGroupChat: true,
        chatName: "Project Team Alpha",
        users: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[2]._id],
        groupAdmin: createdUsers[0]._id,
      },
      {
        isGroupChat: true,
        chatName: "Design Discussion",
        users: [createdUsers[2]._id, createdUsers[3]._id, createdUsers[4]._id],
        groupAdmin: createdUsers[2]._id,
      },
    ];

    const createdChats = await Chat.create(chatGroups);
    console.log("2 chat groups created successfully");

    // Create 5 messages
    const messages = [
      {
        sender: createdUsers[0]._id,
        chat: createdChats[0]._id,
        content: "Hey team! Let's discuss the project timeline.",
      },
      {
        sender: createdUsers[1]._id,
        chat: createdChats[0]._id,
        content: "Sounds good! I think we can finish by next week.",
      },
      {
        sender: createdUsers[2]._id,
        chat: createdChats[0]._id,
        content: "I'll prepare the documentation.",
      },
      {
        sender: createdUsers[2]._id,
        chat: createdChats[1]._id,
        content: "What do you think about the new design mockups?",
      },
      {
        sender: createdUsers[3]._id,
        chat: createdChats[1]._id,
        content: "They look great! I love the color scheme.",
      },
    ];

    const createdMessages = await Message.create(messages);

    // Update chats with latest messages
    await Chat.findByIdAndUpdate(createdChats[0]._id, {
      latestMessage: createdMessages[2]._id,
    });

    await Chat.findByIdAndUpdate(createdChats[1]._id, {
      latestMessage: createdMessages[4]._id,
    });

    console.log("5 messages created successfully");
    console.log("Seeding completed successfully!");

    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
