import './style.css'
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlODM1NDVmOS1lMjkzLTRmYjgtYjM4OS03ZThlZmY5MTYxZWEiLCJpZCI6MjQ4MTg4LCJpYXQiOjE3Mjg5NzExNTZ9.TZ0S4c0zctKibuuH-GuUHB9ZWlAW5v0nxES73-C4xCQ';
Cesium.Ion.defaultAccessToken = token;

const viewer = new Cesium.Viewer("map", {
//   terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(
//     1,
//   ),
//   terrainProvider: new NumericalPngTerrainProvider(),,
  scene3DOnly: true,
  selectionIndicator: false,
  baseLayerPicker: false,
  animation: false,
  timeline: false,
  terrainProvider: undefined,   // 地形を無効化
});
viewer.scene.globe.depthTestAgainstTerrain = true;

// カメラの位置を地球にズームするように初期化
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(141.89773033333333, 42.746032666666665, 100),  // 経度、緯度、高度
    orientation: {
        heading: Cesium.Math.toRadians(0.0),    // カメラの向き（方位角）
        pitch: Cesium.Math.toRadians(-30.0),    // カメラを下向きにする（-90度）
        roll: 0.0                              // ロール角
    }
});

// GeoJSON ファイルの読み込みと表示
Cesium.GeoJsonDataSource.load('soil_layers.geojson', {
    clampToGround: false
}).then(function(dataSource) {
    viewer.dataSources.add(dataSource);
    dataSource.entities.values.forEach(function(entity) {
            const topHeight = entity.properties?.top_height.getValue();
            const bottomHeight = entity.properties?.bottom_height.getValue();
            const middleHeight = entity.properties?.middle_height.getValue();
            const radius = entity.properties?.radius.getValue();
            const latitude = entity.properties?.latitude.getValue();
            const longitude = entity.properties?.longitude.getValue();

            console.log(entity.position);
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
            entity.point = undefined;
        // }
    });

    viewer.zoomTo(dataSource);
});

// ボタン要素の作成とスタイル設定
const button = document.createElement('button');
button.className = 'cesium-button'; // Cesiumのスタイルをベースに使用
button.textContent = '選択モードを開始';
button.style.position = 'absolute';
button.style.top = '10px';
button.style.left = '10px'; // 左側に配置
button.style.padding = '8px 16px';
button.style.backgroundColor = '#007bff';
button.style.color = '#fff';
button.style.border = 'none';
button.style.borderRadius = '4px';
button.style.cursor = 'pointer';
button.style.zIndex = '100';
viewer.container.appendChild(button);

// ボタンのクリックで選択モードをトグル
let isSelectMode = false;
button.addEventListener('click', () => {
    isSelectMode = !isSelectMode;
    button.textContent = isSelectMode ? '選択モード中' : '選択モードを開始';
});

