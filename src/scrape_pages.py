import requests
import time

url = "https://www.kunijiban.pwri.go.jp/viewer/server/search.php?soiltest_result=0&bbox=57.598333%2C109.544722%2C1.933333%2C163.806111&page="

def fetch_and_save_json(url, interval=2):
    base_num = 7094
    for i in range(3):
        try:
            response = requests.get(f"{url}{base_num + i}")
            # 404なら次へ
            if response.status_code == 200:
                # contenttypeを判定
                if response.headers["content-type"] == "text/html; charset=UTF-8":
                    print(f"404 Not Found: {base_num + i}")
                    time.sleep(interval)
                    continue
            response.raise_for_status()  # エラーがあれば例外を発生させる

            # 取得したXMLデータをファイルに保存
            filename = f"./page_jsons/{base_num + i}.json"
            with open(filename, "wb") as file:
                file.write(response.content)

            print(f"Saved JSON data to {filename}")

        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")

        # 次のリクエストまで待機
        time.sleep(interval)

# 実行
fetch_and_save_json(url)
'''
0-2999まで収集完了
'''
