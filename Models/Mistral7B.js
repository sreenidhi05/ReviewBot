import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import { HfInference } from "@huggingface/inference";

// Initialize Hugging Face client
const client = new HfInference("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");

const app = express();
app.use(bodyParser.json());

// Function to read text from a file
function readTextFromFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

app.post("/process-reviews", async (req, res) => {
  try {
    // Read the content of the combined_reviews.txt file
    const filePath = "combined_reviews.txt"; // Specify your file path here
    const reviewsText = readTextFromFile(filePath);

    if (!reviewsText) {
      return res.status(400).json({ error: "File is empty or missing" });
    }

    // Send the file content to the Hugging Face model for summarization
    const chatCompletion = await client.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        {
          role: "user",
          content: `Please provide a summary of the following reviews:\n\n${reviewsText} \n in 100 words`,
        },
      ],
      max_tokens: 500, // Adjust token limit as needed
    });

    // Get the summary from the response
    const summary = chatCompletion.choices[0].message.content;

    // Return the summary in the response
    return res.json({ summary });
  } catch (error) {
    console.error("Error processing reviews:", error);
    return res.status(500).json({ error: "Failed to process reviews" });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Node.js service running on port ${PORT}`);
});





// import express from "express";
// import bodyParser from "body-parser";
// import { HfInference } from "@huggingface/inference";

// // Initialize Hugging Face client
// const client = new HfInference("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");

// const app = express();
// app.use(bodyParser.json());

// app.post("/process-reviews", async (req, res) => {
//   const reviewsText = req.body.reviews;

//   if (!reviewsText) {
//     return res.status(400).json({ error: "No reviews text provided" });
//   }

//   try {
//     const chatCompletion = await client.chatCompletion({
//       model: "mistralai/Mistral-7B-Instruct-v0.3",
//       messages: [
//         {
//           role: "user",
//           content: `Please provide a summary of the following reviews:\n\n${reviewsText} \n in 100 words`,
//         },
//       ],
//       max_tokens: 500,
//     });

//     const summary = chatCompletion.choices[0].message.content;

//     return res.json({ summary });
//   } catch (error) {
//     console.error("Error processing reviews:", error);
//     return res.status(500).json({ error: "Failed to process reviews" });
//   }
// });

// const PORT = 8000;
// app.listen(PORT, () => {
//   console.log(`Node.js service running on port ${PORT}`);
// });








// import fs from "fs";
// import { HfInference } from "@huggingface/inference";

// // Initialize Hugging Face client with your API token
// const client = new HfInference("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");

// // Function to read text from a file
// function readTextFromFile(filePath) {
//   return fs.readFileSync(filePath, "utf8");
// }

// (async () => {
//   try {
//     // Read the content of the text file
//     const filePath = "combined_reviews.txt";
//     const fileContent = readTextFromFile(filePath);

//     // Send the file content to the model with a summarization request
//     const chatCompletion = await client.chatCompletion({
//       model: "mistralai/Mistral-7B-Instruct-v0.3",
//       messages: [
//         {
//           role: "user",
//           content: `Please provide a summary of the following reviews:\n\n${fileContent} \n in 100 words`, // Summarization prompt
//         },
//       ],
//       max_tokens: 500, // Adjust token limit as needed
//     });

//     // Log the summarized output
//     console.log("Summarized Output:");
//     console.log(chatCompletion.choices[0].message.content); // Updated to access the correct property
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// })();
