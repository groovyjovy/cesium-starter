import xmltodict
import json
import math

def main():
    files = search_xml_files()
    for file in files:
        print(f"processing {file}")
        data_dict = open_and_parse_file(file)
        geojson = convert_to_geojson(data_dict)
        print(geojson)
        with open(f'{file}.geojson', 'w', encoding='utf-8') as geojson_file:
            json.dump(geojson, geojson_file, ensure_ascii=False, indent=4)


def convert_to_geojson(data_dict):
    # 孔口の標高
    top_level = float(data_dict["ボーリング情報"]["標題情報"]["ボーリング基本情報"]["孔口標高"])

    # 緯度経度
    # 10進法に変換する
    lat_lon  = data_dict["ボーリング情報"]["標題情報"]["経度緯度情報"]
    latitude, longitude = convert_latlon(
        float(lat_lon["緯度_度"]), float(lat_lon["緯度_分"]), float(lat_lon["緯度_秒"]),
        float(lat_lon["経度_度"]), float(lat_lon["経度_分"]), float(lat_lon["経度_秒"])
    )

    name1 = "岩石土区分"
    # name1 = "工学的地質区分名現場土質名"
    name2 = "岩石土"
    # name2 = "工学的地質区分名現場土質名"


    cores = data_dict["ボーリング情報"]["コア情報"]
    soil_names = cores[f"{name1}"]
    # 各深度の配列。["0.2", "0.4", ...]
    depths = [soil[f"{name1}_下端深度"] for soil in soil_names]
    soil_tones = cores["色調"]
    soils_dict = {}
    for index, depth in enumerate(depths):
        print(soil_names[index])
        print(f"{name1}_{name2}")
        soils_dict[depth] = {
            "soil_symbol": soil_names[index][f"{name1}_{name2}記号"],
            "soil_name": soil_names[index][f"{name1}_{name2}名"],
            "soil_tone": soil_tones[index]["色調_色調名"]
        }

    # GeoJSONのためのテンプレート
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    # 深度ごとに処理
    previous_depth = 0

    radius = 1  # ボーリングの円柱の半径（適宜調整）

    for depth_str, attributes in soils_dict.items():
        depth = float(depth_str)

        point = [longitude, latitude]

        # ポリゴンをGeoJSONのFeatureとして追加
        polygon = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": point  # ポリゴンの座標
            },
            "properties": {
                "soil_symbol": attributes["soil_symbol"],
                "soil_name": attributes["soil_name"],
                "soil_tone": attributes["soil_tone"],
                "depth_range": f"{previous_depth}m - {depth}m",
                "half_depth": (depth - previous_depth) / 2,
                "top_height": top_level - previous_depth,
                "middle_height": top_level - (depth + previous_depth) / 2,
                "bottom_height": top_level - depth,
                "radius": radius,
                "latitude": latitude,
                "longitude": longitude
            }
        }

        geojson["features"].append(polygon)

        # 深度を更新
        previous_depth = depth

    return geojson

def convert_latlon(lat_degree, lat_minute, lat_second, lon_degree, lon_minute, lon_second):
    latitude = lat_degree + lat_minute/60 + lat_second/3600
    longitude = lon_degree + lon_minute/60 + lon_second/3600
    return latitude, longitude

def open_and_parse_file(file_path):
    with open(file_path, 'r', encoding='shift-jis') as file:
        xml_content = file.read()
        data_dict = xmltodict.parse(xml_content)
    return data_dict

def search_xml_files():
    import os
    xml_files = []
    for root, dirs, files in os.walk('./xmls'):
        for file in files:
            if file.endswith('.XML'):
                xml_files.append(os.path.join(root, file))
    print(f"detected XML files...{xml_files}")
    return xml_files

if __name__ == "__main__":
    main()
