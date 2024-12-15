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
          content: `Please provide a summary of the following reviews in 100 words:\n\n${reviewsText}\n`,
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
//   try {
//     const { reviews } = req.body;

//     // Validate that reviews are provided and in the correct format
//     if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
//       return res.status(400).json({ error: "No reviews provided or invalid format" });
//     }

//     // Combine the reviews into a single string for summarization
//     const reviewsText = reviews.map((review) => review.review).join("\n");

//     // Send the combined reviews to the Hugging Face model for summarization
//     const chatCompletion = await client.chatCompletion({
//       model: "mistralai/Mistral-7B-Instruct-v0.3",
//       messages: [
//         {
//           role: "user",
//           content: `Please provide a summary of the following reviews:\n\n${reviewsText}\n in 100 words`,
//         },
//       ],
//       max_tokens: 500, // Adjust token limit as needed
//     });

//     // Extract the summary from the Hugging Face API response
//     const summary = chatCompletion.choices[0].message.content;

//     // Return the summary in the response
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














// import express from "express";
// import bodyParser from "body-parser";
// import { HfInference } from "@huggingface/inference";

// // Initialize Hugging Face client
// const client = new HfInference("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");

// const app = express();
// app.use(bodyParser.json());

// app.post("/process-reviews", async (req, res) => {
//   try {
//     const { reviews } = req.body;

//     // Validate that reviews are provided and in the correct format
//     if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
//       return res.status(400).json({ error: "No reviews provided or invalid format" });
//     }

//     // Combine the reviews into a single string for summarization
//     const reviewsText = reviews.map((review) => review.review).join("\n");

//     // Send the combined reviews to the Hugging Face model for summarization
//     const chatCompletion = await client.chatCompletion({
//       model: "mistralai/Mistral-7B-Instruct-v0.3",
//       messages: [
//         {
//           role: "user",
//           content: `Please provide a summary of the following reviews:\n\n${reviewsText}\n in 100 words`,
//         },
//       ],
//       max_tokens: 500, // Adjust token limit as needed
//     });

//     // Extract the summary from the Hugging Face API response
//     const summary = chatCompletion.choices[0].message.content;

//     // Return the summary in the response
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
