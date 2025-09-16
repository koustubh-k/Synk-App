import axios from "axios";

// Function to generate a response from a Groq-powered chatbot
const getChatbotResponse = async (userMessage) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
        model: "llama-3.1-8b-instant", // Or another Groq-supported model
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error in Groq AI service:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to get response from Groq AI service.");
  }
};

export { getChatbotResponse };
