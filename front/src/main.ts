import './style.css'
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';
import { NumericalPngTerrainProvider } from './NumericalPngTerrainProvider';

const token = import.meta.env.VITE_API_KEY;
Cesium.Ion.defaultAccessToken = token;

const viewer = new Cesium.Viewer("map", {
//   terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(
//     1,
//   ),
//   terrainProvider: new NumericalPngTerrainProvider(),
  terrainProvider: new NumericalPngTerrainProvider({
    'url' : 'https://tiles.gsj.jp/tiles/elev/kochi/{z}/{y}/{x}.png',
    'credit' : new Cesium.Credit('<b>AUTHORITY:&nbsp;</b><a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院タイル (Tiles of Geospatial Information Authority of Japan)</a></p>')
  }),
  scene3DOnly: true,
  selectionIndicator: false,
  baseLayerPicker: false,
  animation: false,
  timeline: false,
//   terrainProvider: undefined,   // 地形を無効化
});

// カメラの位置を地球にズームするように初期化
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(133.29047055555554, 33.406503888888885, 100),  // 経度、緯度、高度
    orientation: {
        heading: Cesium.Math.toRadians(0.0),    // カメラの向き（方位角）
        pitch: Cesium.Math.toRadians(-30.0),    // カメラを下向きにする（-90度）
        roll: 0.0                              // ロール角
    }
});

// GeoJSON ファイルの読み込みと表示
const fileNames = [
    "xxxBEDSK50330283001.XML.geojson",
    "xxxBEDSK50330283008.XML.geojson",
    "xxxBEDSK50330283013.XML.geojson",
    "xxxBEDSK50330283049.XML.geojson",
    "xxxBEDSK50330283050.XML.geojson"
];

const loadGeoJson = async (fileName: string) => {
    Cesium.GeoJsonDataSource.load(fileName, {
        clampToGround: false,
        markerSize: 0,          // デフォルトのマーカーサイズを0にする
        markerSymbol: undefined, // デフォルトのマーカーシンボルを無効化
    }).then(function(dataSource) {
        viewer.dataSources.add(dataSource);
        dataSource.entities.values.forEach(function(entity) {
                const topHeight = entity.properties?.top_height.getValue();
                const bottomHeight = entity.properties?.bottom_height.getValue();
                const middleHeight = entity.properties?.middle_height.getValue();
                const radius = entity.properties?.radius.getValue();
                const latitude = entity.properties?.latitude.getValue();
                const longitude = entity.properties?.longitude.getValue();

                entity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, middleHeight);
                entity.cylinder = new Cesium.CylinderGraphics({
                    length: topHeight - bottomHeight,
                    topRadius: radius,
                    bottomRadius: radius,
                    material: Cesium.Color.fromRandom({ alpha: 0.6 }),
                    outline: true,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    numberOfVerticalLines: 16,
                });

                // 元のポイントを非表示
                // entity.point = undefined;
            // }
        });
    // viewer.zoomTo(dataSource);
    });
};

fileNames.forEach((fileName) => {
    loadGeoJson(fileName);
});

// ボタン要素の作成とスタイル設定
// const button = document.createElement('button');
// button.className = 'cesium-button'; // Cesiumのスタイルをベースに使用
// button.textContent = '選択モードを開始';
// button.style.position = 'absolute';
// button.style.top = '10px';
// button.style.left = '10px'; // 左側に配置
// button.style.padding = '8px 16px';
// button.style.backgroundColor = '#007bff';
// button.style.color = '#fff';
// button.style.border = 'none';
// button.style.borderRadius = '4px';
// button.style.cursor = 'pointer';
// button.style.zIndex = '100';
// viewer.container.appendChild(button);

// ボタンのクリックで選択モードをトグル
// let isSelectMode = false;
// button.addEventListener('click', () => {
//     console.log(123)
//     isSelectMode = !isSelectMode;
//     button.textContent = isSelectMode ? '選択モード中' : '選択モードを開始';
//     console.log(isSelectMode, button.textContent)
// });

// CesiumコンテナにUI要素を追加
const controlContainer = document.createElement('div');
controlContainer.style.position = 'absolute';
controlContainer.style.top = '10px';
controlContainer.style.left = '10px';
controlContainer.style.padding = '10px';
controlContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
controlContainer.style.borderRadius = '8px';
controlContainer.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.3)';
controlContainer.style.zIndex = '10';
viewer.container.appendChild(controlContainer);

// UI要素のHTMLを追加
controlContainer.innerHTML = `
    <label>緯度: <input type="number" id="latitude" step="0.0001" value="42.746032666666665"></label><br>
    <label>経度: <input type="number" id="longitude" step="0.0001" value="141.89773033333333"></label><br>
    <label>半径 (m): <input type="number" id="radius" step="10" value="10000"></label><br>
    <button id="applyButton">円形エリアを表示</button>
`;

// 「円形エリアを表示」ボタンのクリックイベント
document.getElementById('applyButton').addEventListener('click', () => {
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const radiusInMeters = parseFloat(document.getElementById('radius').value);

    // 中心位置を Cartesian3 に変換
    const centerCartographic = Cesium.Cartographic.fromDegrees(longitude, latitude);
    const centerCartesian = Cesium.Cartographic.toCartesian(centerCartographic);

    // 中心位置をウィンドウ座標に変換
    const centerWindow = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, centerCartesian);

    // ウィンドウサイズを取得
    const canvasWidth = viewer.canvas.clientWidth;
    const canvasHeight = viewer.canvas.clientHeight;

    // テクスチャ座標（0〜1）に正規化
    const centerTexture = new Cesium.Cartesian2(
        centerWindow.x / canvasWidth,
        1.0 - (centerWindow.y / canvasHeight) // Y座標を反転
    );

    // 半径を計算（ウィンドウ座標系でのピクセル単位）
    const pointOnCircleCartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude + (radiusInMeters / 111320)); // おおよその緯度1度あたりのメートル換算
    const pointOnCircleWindow = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pointOnCircleCartesian);

    const radiusInPixels = Math.sqrt(
        Math.pow(pointOnCircleWindow.x - centerWindow.x, 2) +
        Math.pow(pointOnCircleWindow.y - centerWindow.y, 2)
    );

    // テクスチャ座標系での半径（0〜1に正規化）
    const radiusTexture = radiusInPixels / Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);

    // PostProcessStageで円形範囲を描画
    const stage = new Cesium.PostProcessStage({
        fragmentShader: `
            #version 300 es
            precision highp float;
            precision highp int;

            uniform sampler2D colorTexture;
            in vec2 v_textureCoordinates;
            out vec4 fragColor;

            uniform vec2 u_center;
            uniform float u_radius;

            void main(void) {
                float distanceFromCenter = distance(v_textureCoordinates, u_center);

                if (distanceFromCenter < u_radius) {
                    fragColor = texture(colorTexture, v_textureCoordinates);
                } else {
                    fragColor = vec4(0.0, 0.0, 0.0, 0.0); // 外側を透明にする
                }
            }
        `,
        uniforms: {
            u_center: function() {
                return new Cesium.Cartesian2(centerTexture.x, centerTexture.y);
            },
            u_radius: function() {
                return radiusTexture;
            }
        }
    });

    viewer.scene.postProcessStages.removeAll(); // 既存のステージを削除
    viewer.scene.postProcessStages.add(stage);  // 新しいステージを追加
});

// 初回実行
logCurrentViewRectangle();

// カメラが移動した後に範囲を出力
viewer.camera.moveEnd.addEventListener(() => {
  logCurrentViewRectangle();
});



// ビューポートの範囲を計算してコンソールに出力する関数
function logCurrentViewRectangle() {
    const rectangle = viewer.camera.computeViewRectangle();
  
    if (rectangle) {
      const boundingBox = {
        west: Cesium.Math.toDegrees(rectangle.west),  // 最西端の経度
        south: Cesium.Math.toDegrees(rectangle.south), // 最南端の緯度
        east: Cesium.Math.toDegrees(rectangle.east),  // 最東端の経度
        north: Cesium.Math.toDegrees(rectangle.north) // 最北端の緯度
      };
  
      console.log("現在の視野範囲 (Bounding Box):", boundingBox);
    } else {
      console.log("現在の視野範囲を取得できませんでした。");
    }
  }