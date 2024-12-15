const express = require("express");
const axios = require("axios"); // To make HTTP requests
const User = require("../schema/schema.js");
const bodyParser = require("body-parser");
const { HfInference } = require("@huggingface/inference");

const router = express.Router();

//-------------------------------------------------------------------------
// Scrape JS route for Flask Route
router.post("/scrapeJS", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    console.error("Error: URL not provided");
    return res.status(400).json({ error: "URL not provided" });
  }

  try {
    const flaskResponse = await axios.post(
        'http://localhost:5000/scrape',
        new URLSearchParams({ url }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    const reviews = flaskResponse.data.reviews;

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({ error: "No reviews found in the scraped data" });
    }

    // Convert reviews array to a single string
    const reviewsText = reviews.join("\n");

    // Send reviewsText to the summarization route
    const summarizationResp = await axios.post(
      "http://localhost:3000/summarize",
      { reviews: reviewsText },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({
      scraped: flaskResponse.data,
      summary: summarizationResp.data.summary
    });

  } catch (error) {
    console.error("Error during scraping or summarization:", error);
    return res.status(500).json({ error: "Failed to process reviews" });
  }
});


//-------------------------------------------------------------------------
// Text Summarization Route

const client = new HfInference("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");
// app.use(bodyParser.json());

router.post("/summarize", async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!reviews || reviews.trim() === "") {
      return res.status(400).json({ error: "No reviews provided" });
    }

    // Send the reviews text to the Hugging Face model for summarization
    const chatCompletion = await client.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        {
          role: "user",
          content: `Please provide a summary of the following reviews in 100 words:\n\n${reviews}\n`,
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

//-----------------------------------------------------------------------
// Register user
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ email, username, password });
    if (user) {
      res.status(201).json({ message: "User registered successfully" });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//-----------------------------------------------------------------------
// Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && user.password === password) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//-------------------------------------------------------------------

module.exports = router;