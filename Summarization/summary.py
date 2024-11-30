# Processes the scraped reviews and generates a summary using the text summarization model.


from flask import Flask, request, jsonify
from playwright.sync_api import sync_playwright
from flask_cors import CORS
from ctransformers import AutoModelForCausalLM
import json
import time

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
        

        page.wait_for_selector("//div[@class='Nx9bqj CxhGGd']", timeout=5000)
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

            response = {
                'product_details': product_details,
                'reviews': reviews
            }

            browser.close()
            return jsonify(response)

    except Exception as e:
        return jsonify({"error": f"Error occurred: {e}"}), 500

if __name__ == '__main__':
    print("Loading the model...")
    model = AutoModelForCausalLM.from_pretrained(
        "TheBloke/Llama-2-7B-Chat-GGML",
        model_type="llama"
    )
    print("Model loaded successfully.")
    app.run(debug=True, port=6000)


# @app.route('/summarize', methods=['POST'])
# def summarize():
#     global model
#     if model is None:
#         return jsonify({"error": "Model is not loaded."}), 500

#     data = request.get_json()
#     if not data or 'reviews' not in data:
#         return jsonify({"error": "No reviews provided"}), 400

#     reviews = data['reviews']
#     sanitized_reviews = [review['review'].replace("\n", " ").strip() for review in reviews]

#     # input_text = "Please summarize the following product reviews in 100 words or fewer:\n"
#     input_text = "Please summarize the content :\n"
#     for review in sanitized_reviews:
#         input_text += f"- {review}\n"

#     try:
#         # Perform inference
#         output = model(input_text)
#         cleaned_output = output.replace("\n", " ").strip()
#         return jsonify({"summary": cleaned_output})
#     except Exception as e:
#         return jsonify({"error": f"Failed to generate summary: {e}"}), 500





if __name__ == '__main__':
    print("Loading the model...")
    model = AutoModelForCausalLM.from_pretrained(
        "TheBloke/Llama-2-7B-Chat-GGML",
        model_type="llama"
    )
    print("Model loaded successfully.")
    app.run(debug=True, port=6000)







#---------------------------------------------------------------------
# text summarization code, that can handle json scraped reviews-
# # !pip install ctransformers

# from flask import Flask, request, jsonify
# from ctransformers import AutoModelForCausalLM

# app = Flask(__name__)

# # Load the GGML model
# model = AutoModelForCausalLM.from_pretrained(
#     "TheBloke/Llama-2-7B-Chat-GGML",
#     model_type="llama"
# )


# @app.route('/summarize', methods=['POST'])
# def summarize():
#     data = request.get_json()
#     if not data or 'reviews' not in data:
#         return jsonify({"error": "No reviews provided"}), 400

#     reviews = data['reviews']
#     # Combine all reviews into a single text input
#     input_text = "Please do abstractive summarization for the given reviews:\n"
#     for review in reviews:
#         input_text += f"\n{review['title']}: {review['review']}"
    
#     # Perform inference
#     output = model(input_text)

#     # Clean the output
#     cleaned_output = output.replace("\n", " ").strip()
#     return jsonify({"summary": cleaned_output})

# if __name__ == '__main__':
#     app.run(debug=True, port=6000)  # Run on a different port to avoid conflicts




# ----------------------------------------------------------------------
# main summarization code without multiple inputs-
# # !pip install ctransformers

# import requests
# from ctransformers import AutoModelForCausalLM

# # Load the GGML model
# model = AutoModelForCausalLM.from_pretrained(
#     "TheBloke/Llama-2-7B-Chat-GGML",
#     model_type="llama"
# )

# # Input text
# input_text = (
#     """Please do abstractive summarization for the given reviews: 
#     A Mixed Bag of Brilliance\n\n
#     The iPhone 15 flaunts an impressive camera setup, capturing moments with exceptional clarity and detail. 
#     However, users may encounter heating issues post 80% charge, which could disrupt prolonged usage. 
#     Occasionally, screen touch glitches may hamper the otherwise seamless user experience. 
#     Despite these setbacks, the iPhone 15 excels in performance and features. 
#     The standout Dynamic Island feature enhances productivity and personalization."""
# )

# # Perform inference
# output = model(input_text)

# # Clean and split the output into sentences
# cleaned_output = output.replace("\n", " ").strip()  # Replace newlines with spaces and remove trailing spaces
# sentences = cleaned_output.split(". ")  # Split at every full stop followed by a space


# # # Clean and print the output in a paragraph format
# cleaned_output = output.replace("\n", " ").strip()  # Replace newlines with spaces and remove trailing spaces
# print(cleaned_output)






























