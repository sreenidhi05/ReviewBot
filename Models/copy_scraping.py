# Handles scraping of reviews from the provided URL.
# Sends the scraped data to the summarization service (summary.py).
# Saves the summarized output to a file (summarized_output.json).

from flask import Flask, request, jsonify
from playwright.sync_api import sync_playwright
from flask_cors import CORS
import json
import requests
import time
import re

app = Flask(__name__)
CORS(app)

def get_product_details(page):
    try:
        page.wait_for_selector("h1._6EBuvT")
        h1_element = page.query_selector("h1._6EBuvT")
        spans = h1_element.query_selector_all("span")
        product_name = ""
        for span in spans:
            product_name += span.inner_text()            
        
        page.wait_for_selector("//div[@class='Nx9bqj CxhGGd']", timeout=8000) # made from 5000 to 8000
        product_price = page.locator("//div[@class='Nx9bqj CxhGGd']").inner_text()

        page.wait_for_selector("div._5OesEi.HDvrBb")  
        div_element = page.query_selector("div._5OesEi.HDvrBb")
        product_rating = div_element.query_selector("span.Y1HWO0").inner_text()

        page.wait_for_selector("div.vU5WPQ")        
        div_element = page.query_selector("div.vU5WPQ")
        img_element = div_element.query_selector("img")
        
        image_url = img_element.get_attribute("src")
        print(product_name, product_price, product_rating, image_url)
        
        return {
            "name": product_name,
            "price": product_price,
            "rating": product_rating,
            "image": image_url,
        }
    except Exception as e:
        print(f"Error occurred while getting product details: {e}")
        return {}

def get_reviews(page):
    try:
        
        page.wait_for_selector("a:has(div._23J90q)")
        first_anchor_tag = page.query_selector("a:has(div._23J90q)")
        if first_anchor_tag:
            first_anchor_tag.click()
            print("Clicked")
            time.sleep(3)
    except:
        print("Not clicked")

    reviews_and_ratings = []
    pc = 0
    count = 0

    while pc < 5:
        review_containers = page.query_selector_all("div.EKFha-")
        rating_elements = page.query_selector_all("div[class*='EKFha-'] div.XQDdHH.Ga3i8K")

        for i in range(len(review_containers)):
            container= review_containers[i]
            try:               
                title_element = container.query_selector("div.row div")
                title = title_element.inner_text() if title_element else "No Title"
                
                if title:
                    title = title.replace("\n", "")
                    title= title[1::]

                if title=="":
                    para = container.query_selector("p.z9E0IG")
                    
                    title = para.inner_text() if para else "No Title"

                review_element = container.query_selector("div.row div.ZmyHeo")
                review_text = review_element.inner_text() if review_element else "No Review Text"
                
                if review_text =="READ MORE" or review_text[1::] ==title:
                    review_text = "No Review Text"
                
                rating = rating_elements[i].inner_text() if rating_elements else "No Rating"
            
                reviews_and_ratings.append({
                    "title": title,
                    "review": review_text,
                    "stars": rating,
                    "count": count
                })
                count += 1
            except Exception as e:
                print(f"Error extracting review: {e}")

        print(f"Scraped page {pc}")
        pc += 1

        try:
            
            next_button = page.locator("//a[@class='_9QVEpD' and span[text()='Next']]")
            if pc==1: # scraping just 2 pages 
                break
            if next_button.is_visible():
                next_button.click()
                time.sleep(3)
            else:
                break
        except Exception as e:
            print(f"Error navigating to next page: {e}")
            break

    return reviews_and_ratings


@app.route('/scrape', methods=['POST'])
def scrape():
    url = request.form.get('url')
    if not url:
        return jsonify({"error": "URL not provided"}), 400

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            page.goto(url)

            product_details = get_product_details(page)
            reviews = get_reviews(page)
            
            combine_reviews_into_paragraph(reviews)

            response = {
                'product_details': product_details,
                'reviews': reviews
            }

            with open('scraped_data.json', 'w') as json_file:
                json.dump(response, json_file, indent=4)

            browser.close()
            return jsonify(response)

    except Exception as e:
        return jsonify({"error": f"Error occurred: {e}"}), 500
    
def preprocess_review_text(text):
    """
    Preprocesses the review text by:
    - Removing emoticons, special characters, and unnecessary symbols.
    - Combining related points into concise sentences.
    - Standardizing the text for summarization purposes.
    """
    # Remove emoticons and special characters
    text = re.sub(r'[^\w\s.,]', '', text)
    
    text = text.replace("READ MORE", "")
    text = text.replace("...", ".")

    # Replace multiple spaces or newlines with a single space
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def combine_reviews_into_paragraph(reviews):

    processed_reviews = []
    
    for review in reviews:
        if review['review'] != "No Review Text":
            processed_review = preprocess_review_text(review['review'])
            processed_reviews.append(processed_review)
    
    combined_reviews = " ".join(processed_reviews)
    
    with open('combined_reviews.txt', 'w', encoding='utf-8') as file:
        file.write(combined_reviews)
    
    return combined_reviews
    


if __name__ == '__main__':
    app.run(debug=True, port=5000)