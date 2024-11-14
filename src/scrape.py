import requests
import time

url = "https://www.kunijiban.pwri.go.jp/viewer/refer/?data=boring&type=xml&id="

def fetch_and_save_xml(url, interval=3):
    base_num = 7070
    for i in range(5000):
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
            filename = f"./downloaded_xmls/{base_num + i}.xml"
            with open(filename, "wb") as file:
                file.write(response.content)

            print(f"Saved XML data to {filename}")

        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")

        # 次のリクエストまで待機
        time.sleep(interval)

# 実行
fetch_and_save_xml(url)
'''
0-2999まで収集完了
'''
