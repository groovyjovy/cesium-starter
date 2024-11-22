import json
import requests
import time

url = "https://www.kunijiban.pwri.go.jp/viewer/refer/?data=boring&type=xml&id="


def main():
    # 7095ページ分回す
    for i in range(1, 7095):
        page_file = f"./page_jsons/{i}.json"
        with open(page_file, 'r', encoding='utf-8') as json_file:
            print(f"------------------------- processing {page_file} -------------------------")
            data_dict = json.load(json_file)
            ids = [item["id"] for item in data_dict["data"]["values"]]
            print(f"ids: {ids}")
            for id in ids:

                fetch_and_save_xml(url, id)
                time.sleep(2)

def fetch_and_save_xml(url, id, interval=2):
        try:
            response = requests.get(f"{url}{id}")
            # 404なら次へ
            if response.status_code == 200:
                # contenttypeを判定
                if response.headers["content-type"] == "text/html; charset=UTF-8":
                    print(f"404 Not Found: {id}")
                    time.sleep(interval)
            response.raise_for_status()  # エラーがあれば例外を発生させる

            # 取得したXMLデータをファイルに保存
            filename = f"./downloaded_xmls/{id}.xml"
            with open(filename, "wb") as file:
                file.write(response.content)

            print(f"Saved XML data to {filename}")

        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    main()


# def search_json_files():
#     import os
#     json_files = []
#     for root, dirs, files in os.walk('./jsons'):
#         for file in files:
#             if file.endswith('.json'):
#                 json_files.append(os.path.join(root, file))
#     print(f"detected json files...{json_files}")
#     return json_files
