import xmltodict
import json
import math

def main():
    # jsonを読み込んで表示
    file = 'page_jsons/2.json'
    with open(file, 'r', encoding='utf-8') as json_file:
        data_dict = json.load(json_file)
        print(json.dumps(data_dict, indent=4, ensure_ascii=False))
        # data.values から id の一覧を取得
        ids = [item["id"] for item in data_dict["data"]["values"]]
        print(ids)


def search_json_files():
    import os
    json_files = []
    for root, dirs, files in os.walk('./jsons'):
        for file in files:
            if file.endswith('.json'):
                json_files.append(os.path.join(root, file))
    print(f"detected json files...{json_files}")
    return json_files

if __name__ == "__main__":
    main()


'''
{
    "header": {
        "xyz": {
            "source": [],
            "mosaic": false
        },
        "page": 1,
        "raw": {
            "soiltest_result": "0",
            "bbox": "45.748333,126.556944,27.712778,147.508056",
            "page": "1"
        },
        "conditions": {
            "soiltest_result": 0,
            "north": 45.748333,
            "west": 126.556944,
            "south": 27.712778,
            "east": 147.508056
        },
        "success": true,
        "message": ""
    },
    "data": {
        "meta": {
            "total": 209332,
            "page": 1,
            "pages": 6978,
            "count": 30
        },
        "values": [
            {
                "id": 725312,
                "code": "NGIC202400474-0009",
                "latitude": "32.688698916667",
                "longitude": "131.09153625",
                "source_code": "",
                "project_name": "",
                "survey_name": "令和5年度矢部清和道路地質調査（その3）業務",
                "client_name": "国土交通省九州地方整備局熊本河川国道事務所",
                "boring_xml_url": 47,
                "boring_view_url": 1,
                "soilmap_view_url": null,
                "soiltest_xml_url": 0,
                "soiltest_view_url": 0
            },
            {
                "id": 725311,
                "code": "NGIC202400474-0008",
                "latitude": "32.683337722222",
                "longitude": "131.079315",
                "source_code": "",
                "project_name": "",
                "survey_name": "令和5年度矢部清和道路地質調査（その3）業務",
                "client_name": "国土交通省九州地方整備局熊本河川国道事務所",
                "boring_xml_url": 47,
                "boring_view_url": 1,
                "soilmap_view_url": null,
                "soiltest_xml_url": 0,
                "soiltest_view_url": 0
            },

'''
