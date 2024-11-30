import fs from "fs";
import { HfInference } from "@huggingface/inference";

// Initialize Hugging Face client with your API token
const client = new HfInference("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");

// Function to read text from a file
function readTextFromFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

(async () => {
  try {
    // Read the content of the text file
    const filePath = "combined_reviews.txt";
    const fileContent = readTextFromFile(filePath);

    // Send the file content to the model with a summarization request
    const chatCompletion = await client.chatCompletion({
      model: "facebook/bart-large-cnn",
      messages: [
        {
          role: "user",
          content: `Please provide a summary of the following reviews:\n\n${fileContent}`, // Summarization prompt
        },
      ],
      max_tokens: 500, // Adjust token limit as needed
    });

    // Log the summarized output
    console.log("Summarized Output:");
    console.log(chatCompletion.choices[0].message.content); // Updated to access the correct property
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
