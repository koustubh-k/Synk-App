import axios from "axios";

// Function to translate text using an external API
const translateMessage = async (text, targetLang) => {
  try {
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate", // Example DeepL API endpoint
      {
        text: [text],
        target_lang: targetLang.toUpperCase(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.translations[0].text;
  } catch (error) {
    console.error(
      "Error in translation service:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to translate message.");
  }
};

export { translateMessage };
