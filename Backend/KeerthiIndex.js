const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { RegisterModel, Product } = require("./schemas/allSchemas");
const bcrypt = require('bcrypt');
require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const { HfInference } = require('@huggingface/inference');
const client = new HfInference(process.env.HUGGING_FACE);
const jwt = require("jsonwebtoken")

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

const saltRounds = 10;  // Number of salt rounds for bcrypt hashing


app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Check for existing user
    RegisterModel.findOne({ email: email })
        .then(user => {
            if (user) {
                return res.status(400).json({ error: "User with this email already exists" });
            }
            
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ error: "Error hashing password" });
                }
                const newUser = new RegisterModel({ name, email, password: hashedPassword });

                newUser.save()
                    .then(() => {
                        res.json({ message: "User registered successfully", id: newUser.id, email: newUser.email});
                    })
                    .catch(err => {
                        console.error(err); // Log the error for debugging
                        res.status(500).json({ error: "Error saving user to the database." });
                    });
            });
        })
        .catch(err => {
            console.error(err); // Log the error for debugging
            res.status(500).json({ error: "Error checking for existing user." });
        });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    RegisterModel.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(400).json({ error: "User does not exist" });
            }
            // Compare the entered password with the hashed password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ error: "Error during password comparison" });
                }
                if (isMatch) {
                    const token = jwt.sign(
                        { id: user.id, email: user.email }, 
                        process.env.JWT_SECRET, 
                        { expiresIn: '1h' } // Token will expire in 1 hour
                    );
                    res.json({ message: "User logged in successfully", token:token});
                } else {
                    res.status(400).json({ error: "Invalid credentials" });
                }
            });
        })
        .catch(err => res.status(500).json({ error: "Error finding user" }));
});

const authenticateToken = (req,res,next) => {
    // console.log(req.headers)
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Access Denied" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        req.user = user; // Attach user info to the request
        next(); // Pass to the next middleware
    });
};

app.post('/linkInput', authenticateToken, async (req, res,next) => {
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
        try{
            console.log("\n Loading knowledge base");
            await axios.post('http://127.0.0.1:8000/upload_reviews',{reviews})
            .then(console.log("Loaded successfully"))
        }
        catch(error){
            console.log(error);
            res.status(500).json({ message: 'Error occurred with sentiment', error: error.message })
        }
        try{
            console.log("\ncalling sentiment")
            sentimentRes = await axios.post('http://localhost:3001/analyzeSentiment',{ reviews})
        }
        catch(error){
            console.error(error)
            res.status(500).json({ message: 'Error occurred with sentiment', error: error.message })
        }
        try{
            sumRes = await axios.post(
             'http://localhost:3001/summarize',
             { reviews },
             { headers: { 'Content-Type': 'application/json' } }
             
            );
            console.log("summarized");
        }
         catch(error){
           console.log("error in summarizing",error);
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


app.post('/analyzeSentiment', async (req, res) => {
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

app.post("/summarize", async (req, res) => {
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
    } catch (error) {
      console.error("Error processing reviews:", error);
      return res.status(500).json({ error: "Failed to process reviews" });
    }
  });

app.post('/chatBot',async(req,res)=>{
    const {question} = req.body;
    try{
        const response = await axios.post("http://127.0.0.1:8000/query",{question});
        console.log(response?.data);
        res.status(200).json(response.data);
    }
    catch(error){
        console.log(error);
    }
})

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find(); // Await the result of Product.find()
        res.status(200).json(products); // Send the products as JSON
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});