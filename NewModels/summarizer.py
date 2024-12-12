# summarizer.py

# This file contains the logic to interact with the Hugging Face API to summarize the scraped reviews.


from huggingface_hub import HfApi, HfInference
# Initialize the Hugging Face client
client = HfInference("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")

def summarize_reviews(reviews):
    """Summarizes the reviews using the Hugging Face API."""
    # Combine all reviews into one text block
    reviews_text = "\n".join([review["review"] for review in reviews])  # Join all reviews
    chatCompletion = client.chatCompletion({
        "model": "mistralai/Mistral-7B-Instruct-v0.3",
        "messages": [
            {
                "role": "user",
                "content": f"Summarize the following reviews:\n{reviews_text}"
            }
        ],
        "max_tokens": 500
    })
    return chatCompletion.choices[0].message['content']
