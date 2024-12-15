const express = require("express");
const axios = require("axios"); // To make HTTP requests
const User = require("../schema/schema.js");
const { HfInference } = require("@huggingface/inference");
require('dotenv').config();
const client = new HfInference("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");

const router = express.Router();

//-------------------------------------------------------------------------
// Scrape JS route for Flask Route

router.post('/linkInput', async (req, res,next) => {
    const { inputValue} = req.body;  // Get the link input from the user
    try {
        const data = qs.stringify({
            url: inputValue,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });
        const response = await axios.post('http://localhost:5000/scrape', data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
        console.log("data received in express = ",response.data)
        const reviews = response.data.reviews;
        const details = response.data.product_details;
        const high = response.data.highlights;
        let sentimentRes = null;
        let sumRes = null; 

        // try{
        //     console.log("\n Loading knowledge base");
        //     await axios.post('http://127.0.0.1:8000/upload_reviews',{reviews})
        //     .then(console.log("Loaded successfully"))
        // }
        // catch(error){
        //     console.log(error);
        //     res.status(500).json({ message: 'Error occurred with sentiment', error: error.message })
        // }

        try{
          sumRes = await axios.post(
           'http://localhost:3000/summarize',
           { reviews },
           { headers: { 'Content-Type': 'application/json' } }
           
          );
          console.log("summarized");
      }
       catch(error){
         console.log("error in summarizing",error);
       }
        try{
            console.log("\ncalling sentiment")
            sentimentRes = await axios.post('http://localhost:3000/analyzeSentiment',{ reviews})
        }
        catch(error){
            console.error(error)
            res.status(500).json({ message: 'Error occurred with sentiment', error: error.message })
        }

        res.status(200).json({
            productDetails : details,
            summary : sumRes?.data,
            sentiment : sentimentRes?.data,
            highlights : high
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred', error: error.message });
    }
    
});

//-------------------------------------------------------------------------
// Text Summarization

router.post("/summarize", async (req, res) => {
  console.log("Received request to summarize:", req.body);
  const { reviews } = req.body;

  if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ error: "Invalid input. Expected an array of reviews." });
  }

  try {
      const reviewTexts = reviews.map((review) => review.review).join(' '); // Joins reviews into a single string

      console.log("Full review text for summarization:\n", reviewTexts);
      // Send the file content to the Hugging Face model for summarization
      const chatCompletion = await client.chatCompletion({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
          {
              role: "user",
              content: `Please provide a summary of the following reviews in 75 words:\n\n${reviewTexts}`,
          },
          ],
          max_tokens: 400, // Adjust token limit as needed
        });

  // Get the summary from the response
  const summary = chatCompletion.choices[0].message.content;

  // Return the summary in the response
  return res.json({ summary });
  } 
  catch (error) 
  {
    console.error("Error processing reviews:", error);
    return res.status(500).json({ error: "Failed to process reviews" });
  }
});


//-----------------------------------------------------------------------
// Sentimental Analysis

router.post('/analyzeSentiment', async (req, res) => {
    console.log("Received request:", req.body);
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews)) {
        return res.status(400).json({ error: "Invalid input. Expected an array of reviews." });
    }

    try {
        console.log("\nin sentiment function")
        const reviewTexts = reviews.map((review) => review.review);
        console.log(reviewTexts);
        const response = await axios.post('http://localhost:5000/senti', {reviewTexts} , {
            headers: {
                'Content-Type': 'application/json',  
            }
        });

        const positiveCount = response.data.positive;
        const negativeCount = response.data.negative;
        console.log("Sentiment Analysis Response:", response.data);

        res.status(200).json({
            positive: positiveCount,
            negative: negativeCount
        });
    } catch (error) {
        console.error("Error during sentiment analysis:", error);
        res.status(500).json({ error: "Failed to process sentiment analysis." });
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
