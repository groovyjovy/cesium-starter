import requests
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

url = "http://localhost:3000/borings"

def post_single_boring(file_path, url):
    """
    個別のXMLファイルを送信する関数
    """
    data = {
        "boring": {
            "kunijiban_id": file_path.split('/')[-1].split('.')[0],
        }
    }
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            return f"Success! {file_path}"
        elif response.status_code == 409:
            return f"Already exists... {file_path}"
        else:
            return f"Failed... {file_path}. status_code: {response.status_code}"
    except Exception as e:
        return f"Error with {file_path}: {e}"

def search_xml_files():
    """
    XMLファイルを検索してリストとして返す
    """
    xml_files = []
    for root, dirs, files in os.walk('./xmls'):
        for file in files:
            if file.endswith('.xml') or file.endswith('.XML'):
                xml_files.append(os.path.join(root, file))
    print(f"Detected XML files: {xml_files}")
    return xml_files

def post_borings_concurrently(url, max_workers=5):
    """
    XMLファイルを並列に送信する関数
    """
    xml_files = search_xml_files()
    print(f"Start posting... Total files: {len(xml_files)}")

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_file = {executor.submit(post_single_boring, file, url): file for file in xml_files}
        for future in as_completed(future_to_file):
            print(future.result())

# 実行
post_borings_concurrently(url)
