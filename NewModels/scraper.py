# scraper.py

# This file contains all the functions related to scraping, including extracting product details and reviews.

from playwright.sync_api import sync_playwright
import time

def get_product_details(page):
    """Scrapes product details from the page."""
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
    """Scrapes reviews from the page."""
    try:
        page.wait_for_selector("a:has(div._23J90q)")
        first_anchor_tag = page.query_selector("a:has(div._23J90q)")
        if first_anchor_tag:
            first_anchor_tag.click()
            time.sleep(3)
    except:
        print("Not clicked")
    
    toggle_sort(page)

    reviews_and_ratings = []
    pc = 0
    count = 0

    while pc < 50:
        review_containers = page.query_selector_all("div.EKFha-")
        rating_elements = page.query_selector_all("div[class*='EKFha-'] div.XQDdHH.Ga3i8K")

        for i in range(len(review_containers)):
            container = review_containers[i]
            try:
                title_element = container.query_selector("div.row div")
                title = title_element.inner_text() if title_element else "No Title"
                review_element = container.query_selector("div.row div.ZmyHeo")
                review_text = review_element.inner_text() if review_element else "No Review Text"
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

        pc += 1

        try:
            next_button = page.locator("//a[@class='_9QVEpD' and span[text()='Next']]")
            if next_button.is_visible():
                next_button.click()
                time.sleep(3)
            else:
                break
        except Exception as e:
            break

    return reviews_and_ratings

def toggle_sort(page):
    """Toggles the sort order to 'MOST_RECENT'."""
    try:
        page.wait_for_selector("select.OZuttk.JEZ5ey")
        page.select_option("select.OZuttk.JEZ5ey", 'MOST_RECENT')
    
    except Exception as e:
        print(f"Error toggling sort: {e}")
