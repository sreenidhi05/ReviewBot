# app.py
# app.py: Ties everything together and serves as the Flask web server.
from flask import Flask, request, jsonify
from scraper import get_product_details, get_reviews
from summarizer import summarize_reviews
from playwright.sync_api import sync_playwright

app = Flask(__name__)

@app.route('/scrape', methods=['POST'])
def scrape():
    """Handles scraping and summarizing reviews from the provided URL."""
    url = request.form.get('url')
    if not url:
        return jsonify({"error": "URL not provided"}), 400

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            page = context.new_page()
            page.goto(url)

            # Scrape product details and reviews
            product_details = get_product_details(page)
            reviews = get_reviews(page)

            # Summarize the reviews
            summarized_reviews = summarize_reviews(reviews)

            # Prepare the response
            response = {
                'product_details': product_details,
                'summarized_reviews': summarized_reviews  # Include summarized reviews
            }

            browser.close()
            return jsonify(response)

    except Exception as e:
        return jsonify({"error": f"Error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
