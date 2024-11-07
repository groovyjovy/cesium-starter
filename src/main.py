import xmltodict
import json
import math

def main():
    data_dict = open_and_parse_file('./sample.XML')

    # 孔口の標高
    top_level = float(data_dict["ボーリング情報"]["標題情報"]["ボーリング基本情報"]["孔口標高"])

    # ボーリングの掘った長さ
    # length = data_dict["ボーリング情報"]["標題情報"]["ボーリング基本情報"]["総削孔長"]

    # 緯度経度
    # 10進法に変換する
    lat_lon  = data_dict["ボーリング情報"]["標題情報"]["経度緯度情報"]
    latitude, longitude = convert_latlon(
        float(lat_lon["緯度_度"]), float(lat_lon["緯度_分"]), float(lat_lon["緯度_秒"]),
        float(lat_lon["経度_度"]), float(lat_lon["経度_分"]), float(lat_lon["経度_秒"])
    )

    # 工学的地質区分名現場土質名の配列。各深度に対する土質の情報。
    # 1要素は以下のような辞書
    '''
    {
        "工学的地質区分名現場土質名_下端深度": "0.20",
        "工学的地質区分名現場土質名_工学的地質区分名現場土質名": "礫混じり砂質シルト",
        "工学的地質区分名現場土質名_工学的地質区分名現場土質名記号": "MS",
        "工学的地質区分名現場土質名_岩石群": {
            "工学的地質区分名現場土質名_岩石群コード": "1",
            "工学的地質区分名現場土質名_岩石土コード": {
                "工学的地質区分名現場土質名_岩相": null,
                "工学的地質区分名現場土質名_岩石": "532110020",
                "工学的地質区分名現場土質名_変成岩岩相": null,
                "工学的地質区分名現場土質名_変成岩岩石": null
            }
        }
    },
    '''
    cores = data_dict["ボーリング情報"]["コア情報"]
    soil_names = cores["工学的地質区分名現場土質名"]
    # 各深度の配列。["0.2", "0.4", ...]
    depths = [soil["工学的地質区分名現場土質名_下端深度"] for soil in soil_names]
    soil_tones = cores["色調"]
    soils_dict = {}
    for index, depth in enumerate(depths):
        soils_dict[depth] = {
            "soil_symbol": soil_names[index]["工学的地質区分名現場土質名_工学的地質区分名現場土質名記号"],
            "soil_name": soil_names[index]["工学的地質区分名現場土質名_工学的地質区分名現場土質名"],
            "soil_tone": soil_tones[index]["色調_色調名"]
        }
    # GeoJSONのためのテンプレート
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    # 円の断面をポリゴンとして近似するための頂点数（12角形として定義）
    num_sides = 12
    angle_step = 360 / num_sides

    # 深度ごとに処理
    previous_depth = 0

    radius = 1  # ボーリングの円柱の半径（適宜調整）

    for depth_str, attributes in soils_dict.items():
        depth = float(depth_str)

        # 円形断面を12角形で近似してポリゴンの頂点を計算
        # circle = []

        # for i in range(num_sides):
        #     angle = math.radians(i * angle_step)
        #     dx = radius * math.cos(angle)
        #     dy = radius * math.sin(angle)

        #     circle.append([longitude + dx, latitude + dy])

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

    print(json.dumps(geojson, ensure_ascii=False, indent=4))
    with open('soil_layers.geojson', 'w', encoding='utf-8') as geojson_file:
        json.dump(geojson, geojson_file, ensure_ascii=False, indent=4)
    # for soil in soils:
    #     soils_dict[soil["工学的地質区分名現場土質名_下端深度"]] = 
    # print(json.dumps(soils_dict, indent=4, ensure_ascii=False))
    # applicable_standards = base_info["適用規格"]
    # print(json.dumps(data_dict, indent=4, ensure_ascii=False))

def convert_latlon(lat_degree, lat_minute, lat_second, lon_degree, lon_minute, lon_second):
    latitude = lat_degree + lat_minute/60 + lat_second/3600
    longitude = lon_degree + lon_minute/60 + lon_second/3600
    return latitude, longitude

def open_and_parse_file(file_path):
    with open(file_path, 'r', encoding='shift-jis') as file:
        xml_content = file.read()
        data_dict = xmltodict.parse(xml_content)
    return data_dict

if __name__ == "__main__":
    main()
