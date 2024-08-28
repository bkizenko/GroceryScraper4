import os
import sys
from bs4 import BeautifulSoup
import requests
import re
import json

def extract_prices(urls, output_file):
    all_items = []
    for url in urls:
        try:
            result = requests.get(url)
            result.encoding = result.apparent_encoding
            doc = BeautifulSoup(result.text, "html.parser")
            script_tags = doc.find_all('script')
            items = []
            price_pattern = re.compile(r'\$\d+(\.\d{2})?')
            for script in script_tags:
                if script.string:
                    try:
                        data = json.loads(script.string)
                        items.extend(find_prices_in_json(data, price_pattern))
                    except json.JSONDecodeError:
                        continue
            if not items:
                common_classes = ["price", "cost", "amount", "value"]
                for class_name in common_classes:
                    for element in doc.find_all(class_=re.compile(class_name, re.IGNORECASE)):
                        price = element.text.strip()
                        parent = element.find_parent()
                        if parent:
                            name = parent.text.strip().replace(price, '').strip()
                            items.append(f"{name}: {price}")
            if not items:
                items.append(f"Cannot get prices from {url}")
            all_items.extend(items)
        except Exception as e:
            all_items.append(f"Error processing {url}: {str(e)}")
    
    existing_data = {'data': []}
    if os.path.exists(output_file):
        with open(output_file, 'r') as file:
            existing_data = json.load(file)
    
    existing_data['data'].extend(all_items)
    
    with open(output_file, 'w') as file:
        json.dump(existing_data, file)
    
    return json.dumps(existing_data)

def find_prices_in_json(data, price_pattern):
    items = []
    if isinstance(data, dict):
        for key, value in data.items():
            items.extend(find_prices_in_json(value, price_pattern))
    elif isinstance(data, list):
        for item in data:
            items.extend(find_prices_in_json(item, price_pattern))
    elif isinstance(data, str):
        if price_pattern.search(data):
            items.append(f"Unknown Item: {data.strip()}")
    return items

if __name__ == "__main__":
    urls = sys.argv[1:-1]
    output_file = sys.argv[-1]
    extract_prices(urls, output_file)