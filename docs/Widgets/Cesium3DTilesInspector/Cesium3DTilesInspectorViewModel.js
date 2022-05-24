import Check from"../../Core/Check.js";import Color from"../../Core/Color.js";import defined from"../../Core/defined.js";import destroyObject from"../../Core/destroyObject.js";import ScreenSpaceEventHandler from"../../Core/ScreenSpaceEventHandler.js";import ScreenSpaceEventType from"../../Core/ScreenSpaceEventType.js";import Cesium3DTileColorBlendMode from"../../Scene/Cesium3DTileColorBlendMode.js";import Cesium3DTileFeature from"../../Scene/Cesium3DTileFeature.js";import Cesium3DTilePass from"../../Scene/Cesium3DTilePass.js";import Cesium3DTileset from"../../Scene/Cesium3DTileset.js";import Cesium3DTileStyle from"../../Scene/Cesium3DTileStyle.js";import PerformanceDisplay from"../../Scene/PerformanceDisplay.js";import knockout from"../../ThirdParty/knockout.js";function getPickTileset(e){return function(t){const i=e._scene.pick(t.position);defined(i)&&i.primitive instanceof Cesium3DTileset&&(e.tileset=i.primitive),e.pickActive=!1}}function selectTilesetOnHover(e,t){t?e._eventHandler.setInputAction((function(t){const i=e._scene.pick(t.endPosition);defined(i)&&i.primitive instanceof Cesium3DTileset&&(e.tileset=i.primitive)}),ScreenSpaceEventType.MOUSE_MOVE):(e._eventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE),e.picking=e.picking)}const stringOptions={maximumFractionDigits:3};function formatMemoryString(e){const t=e/1048576;return t<1?t.toLocaleString(void 0,stringOptions):Math.round(t).toLocaleString()}function getStatistics(e,t){if(!defined(e))return"";const i=t?e._statisticsPerPass[Cesium3DTilePass.PICK]:e._statisticsPerPass[Cesium3DTilePass.RENDER];let o='<ul class="cesium-cesiumInspector-statistics">';return o+=`<li><strong>Visited: </strong>${i.visited.toLocaleString()}</li><li><strong>Selected: </strong>${i.selected.toLocaleString()}</li><li><strong>Commands: </strong>${i.numberOfCommands.toLocaleString()}</li>`,o+="</ul>",t||(o+='<ul class="cesium-cesiumInspector-statistics">',o+=`<li><strong>Requests: </strong>${i.numberOfPendingRequests.toLocaleString()}</li><li><strong>Attempted: </strong>${i.numberOfAttemptedRequests.toLocaleString()}</li><li><strong>Processing: </strong>${i.numberOfTilesProcessing.toLocaleString()}</li><li><strong>Content Ready: </strong>${i.numberOfTilesWithContentReady.toLocaleString()}</li><li><strong>Total: </strong>${i.numberOfTilesTotal.toLocaleString()}</li>`,o+="</ul>",o+='<ul class="cesium-cesiumInspector-statistics">',o+=`<li><strong>Features Selected: </strong>${i.numberOfFeaturesSelected.toLocaleString()}</li><li><strong>Features Loaded: </strong>${i.numberOfFeaturesLoaded.toLocaleString()}</li><li><strong>Points Selected: </strong>${i.numberOfPointsSelected.toLocaleString()}</li><li><strong>Points Loaded: </strong>${i.numberOfPointsLoaded.toLocaleString()}</li><li><strong>Triangles Selected: </strong>${i.numberOfTrianglesSelected.toLocaleString()}</li>`,o+="</ul>",o+='<ul class="cesium-cesiumInspector-statistics">',o+=`<li><strong>Tiles styled: </strong>${i.numberOfTilesStyled.toLocaleString()}</li><li><strong>Features styled: </strong>${i.numberOfFeaturesStyled.toLocaleString()}</li>`,o+="</ul>",o+='<ul class="cesium-cesiumInspector-statistics">',o+=`<li><strong>Children Union Culled: </strong>${i.numberOfTilesCulledWithChildrenUnion.toLocaleString()}</li>`,o+="</ul>",o+='<ul class="cesium-cesiumInspector-statistics">',o+=`<li><strong>Geometry Memory (MB): </strong>${formatMemoryString(i.geometryByteLength)}</li><li><strong>Texture Memory (MB): </strong>${formatMemoryString(i.texturesByteLength)}</li><li><strong>Batch Table Memory (MB): </strong>${formatMemoryString(i.batchTableByteLength)}</li>`,o+="</ul>"),o}const colorBlendModes=[{text:"Highlight",value:Cesium3DTileColorBlendMode.HIGHLIGHT},{text:"Replace",value:Cesium3DTileColorBlendMode.REPLACE},{text:"Mix",value:Cesium3DTileColorBlendMode.MIX}],highlightColor=new Color(1,1,0,.4),scratchColor=new Color,oldColor=new Color;function Cesium3DTilesInspectorViewModel(e,t){Check.typeOf.object("scene",e),Check.typeOf.object("performanceContainer",t);const i=this,o=e.canvas;this._eventHandler=new ScreenSpaceEventHandler(o),this._scene=e,this._performanceContainer=t,this._canvas=o,this._performanceDisplay=new PerformanceDisplay({container:t}),this._statisticsText="",this._pickStatisticsText="",this._editorError="",this.performance=!1,this.showStatistics=!0,this.showPickStatistics=!0,this.inspectorVisible=!0,this.tilesetVisible=!1,this.displayVisible=!1,this.updateVisible=!1,this.loggingVisible=!1,this.styleVisible=!1,this.tileDebugLabelsVisible=!1,this.optimizationVisible=!1,this.styleString="{}",this._tileset=void 0,this._feature=void 0,this._tile=void 0,knockout.track(this,["performance","inspectorVisible","_statisticsText","_pickStatisticsText","_editorError","showPickStatistics","showStatistics","tilesetVisible","displayVisible","updateVisible","loggingVisible","styleVisible","optimizationVisible","tileDebugLabelsVisible","styleString","_feature","_tile"]),this._properties=knockout.observable({}),this.properties=[],knockout.defineProperty(this,"properties",(function(){const e=[],t=i._properties();for(const i in t)t.hasOwnProperty(i)&&e.push(i);return e}));const s=knockout.observable();knockout.defineProperty(this,"dynamicScreenSpaceError",{get:function(){return s()},set:function(e){s(e),defined(i._tileset)&&(i._tileset.dynamicScreenSpaceError=e)}}),this.dynamicScreenSpaceError=!1;const n=knockout.observable();knockout.defineProperty(this,"colorBlendMode",{get:function(){return n()},set:function(e){n(e),defined(i._tileset)&&(i._tileset.colorBlendMode=e,i._scene.requestRender())}}),this.colorBlendMode=Cesium3DTileColorBlendMode.HIGHLIGHT;const r=knockout.observable(),c=knockout.observable();knockout.defineProperty(this,"picking",{get:function(){return c()},set:function(t){c(t),t?i._eventHandler.setInputAction((function(t){const o=e.pick(t.endPosition);if(o instanceof Cesium3DTileFeature?(i.feature=o,i.tile=o.content.tile):defined(o)&&defined(o.content)?(i.feature=void 0,i.tile=o.content.tile):(i.feature=void 0,i.tile=void 0),defined(i._tileset)){if(r&&defined(o)&&defined(o.content)){let s;e.pickPositionSupported&&(s=e.pickPosition(t.endPosition),defined(s)&&(i._tileset.debugPickPosition=s)),i._tileset.debugPickedTile=o.content.tile}else i._tileset.debugPickedTile=void 0;i._scene.requestRender()}}),ScreenSpaceEventType.MOUSE_MOVE):(i.feature=void 0,i.tile=void 0,i._eventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE))}}),this.picking=!0;const l=knockout.observable();knockout.defineProperty(this,"colorize",{get:function(){return l()},set:function(e){l(e),defined(i._tileset)&&(i._tileset.debugColorizeTiles=e,i._scene.requestRender())}}),this.colorize=!1;const u=knockout.observable();knockout.defineProperty(this,"wireframe",{get:function(){return u()},set:function(e){u(e),defined(i._tileset)&&(i._tileset.debugWireframe=e,i._scene.requestRender())}}),this.wireframe=!1;const a=knockout.observable();knockout.defineProperty(this,"showBoundingVolumes",{get:function(){return a()},set:function(e){a(e),defined(i._tileset)&&(i._tileset.debugShowBoundingVolume=e,i._scene.requestRender())}}),this.showBoundingVolumes=!1;const d=knockout.observable();knockout.defineProperty(this,"showContentBoundingVolumes",{get:function(){return d()},set:function(e){d(e),defined(i._tileset)&&(i._tileset.debugShowContentBoundingVolume=e,i._scene.requestRender())}}),this.showContentBoundingVolumes=!1;const h=knockout.observable();knockout.defineProperty(this,"showRequestVolumes",{get:function(){return h()},set:function(e){h(e),defined(i._tileset)&&(i._tileset.debugShowViewerRequestVolume=e,i._scene.requestRender())}}),this.showRequestVolumes=!1;const f=knockout.observable();knockout.defineProperty(this,"freezeFrame",{get:function(){return f()},set:function(e){f(e),defined(i._tileset)&&(i._tileset.debugFreezeFrame=e,i._scene.debugShowFrustumPlanes=e,i._scene.requestRender())}}),this.freezeFrame=!1,knockout.defineProperty(this,"showOnlyPickedTileDebugLabel",{get:function(){return r()},set:function(e){r(e),defined(i._tileset)&&(i._tileset.debugPickedTileLabelOnly=e,i._scene.requestRender())}}),this.showOnlyPickedTileDebugLabel=!1;const p=knockout.observable();knockout.defineProperty(this,"showGeometricError",{get:function(){return p()},set:function(e){p(e),defined(i._tileset)&&(i._tileset.debugShowGeometricError=e,i._scene.requestRender())}}),this.showGeometricError=!1;const g=knockout.observable();knockout.defineProperty(this,"showRenderingStatistics",{get:function(){return g()},set:function(e){g(e),defined(i._tileset)&&(i._tileset.debugShowRenderingStatistics=e,i._scene.requestRender())}}),this.showRenderingStatistics=!1;const m=knockout.observable();knockout.defineProperty(this,"showMemoryUsage",{get:function(){return m()},set:function(e){m(e),defined(i._tileset)&&(i._tileset.debugShowMemoryUsage=e,i._scene.requestRender())}}),this.showMemoryUsage=!1;const S=knockout.observable();knockout.defineProperty(this,"showUrl",{get:function(){return S()},set:function(e){S(e),defined(i._tileset)&&(i._tileset.debugShowUrl=e,i._scene.requestRender())}}),this.showUrl=!1;const y=knockout.observable();knockout.defineProperty(this,"maximumScreenSpaceError",{get:function(){return y()},set:function(e){e=Number(e),isNaN(e)||(y(e),defined(i._tileset)&&(i._tileset.maximumScreenSpaceError=e))}}),this.maximumScreenSpaceError=16;const k=knockout.observable();knockout.defineProperty(this,"dynamicScreenSpaceErrorDensity",{get:function(){return k()},set:function(e){e=Number(e),isNaN(e)||(k(e),defined(i._tileset)&&(i._tileset.dynamicScreenSpaceErrorDensity=e))}}),this.dynamicScreenSpaceErrorDensity=.00278,this.dynamicScreenSpaceErrorDensitySliderValue=void 0,knockout.defineProperty(this,"dynamicScreenSpaceErrorDensitySliderValue",{get:function(){return Math.pow(k(),1/6)},set:function(e){k(Math.pow(e,6))}});const b=knockout.observable();knockout.defineProperty(this,"dynamicScreenSpaceErrorFactor",{get:function(){return b()},set:function(e){e=Number(e),isNaN(e)||(b(e),defined(i._tileset)&&(i._tileset.dynamicScreenSpaceErrorFactor=e))}}),this.dynamicScreenSpaceErrorFactor=4;const _=getPickTileset(this),v=knockout.observable();knockout.defineProperty(this,"pickActive",{get:function(){return v()},set:function(e){v(e),e?i._eventHandler.setInputAction(_,ScreenSpaceEventType.LEFT_CLICK):i._eventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)}});const C=knockout.observable();knockout.defineProperty(this,"pointCloudShading",{get:function(){return C()},set:function(e){C(e),defined(i._tileset)&&(i._tileset.pointCloudShading.attenuation=e)}}),this.pointCloudShading=!1;const D=knockout.observable();knockout.defineProperty(this,"geometricErrorScale",{get:function(){return D()},set:function(e){e=Number(e),isNaN(e)||(D(e),defined(i._tileset)&&(i._tileset.pointCloudShading.geometricErrorScale=e))}}),this.geometricErrorScale=1;const T=knockout.observable();knockout.defineProperty(this,"maximumAttenuation",{get:function(){return T()},set:function(e){e=Number(e),isNaN(e)||(T(e),defined(i._tileset)&&(i._tileset.pointCloudShading.maximumAttenuation=0===e?void 0:e))}}),this.maximumAttenuation=0;const E=knockout.observable();knockout.defineProperty(this,"baseResolution",{get:function(){return E()},set:function(e){e=Number(e),isNaN(e)||(E(e),defined(i._tileset)&&(i._tileset.pointCloudShading.baseResolution=0===e?void 0:e))}}),this.baseResolution=0;const L=knockout.observable();knockout.defineProperty(this,"eyeDomeLighting",{get:function(){return L()},set:function(e){L(e),defined(i._tileset)&&(i._tileset.pointCloudShading.eyeDomeLighting=e)}}),this.eyeDomeLighting=!1;const P=knockout.observable();knockout.defineProperty(this,"eyeDomeLightingStrength",{get:function(){return P()},set:function(e){e=Number(e),isNaN(e)||(P(e),defined(i._tileset)&&(i._tileset.pointCloudShading.eyeDomeLightingStrength=e))}}),this.eyeDomeLightingStrength=1;const w=knockout.observable();knockout.defineProperty(this,"eyeDomeLightingRadius",{get:function(){return w()},set:function(e){e=Number(e),isNaN(e)||(w(e),defined(i._tileset)&&(i._tileset.pointCloudShading.eyeDomeLightingRadius=e))}}),this.eyeDomeLightingRadius=1,this.pickActive=!1;const V=knockout.observable();knockout.defineProperty(this,"skipLevelOfDetail",{get:function(){return V()},set:function(e){V(e),defined(i._tileset)&&(i._tileset.skipLevelOfDetail=e)}}),this.skipLevelOfDetail=!0;const M=knockout.observable();knockout.defineProperty(this,"skipScreenSpaceErrorFactor",{get:function(){return M()},set:function(e){e=Number(e),isNaN(e)||(M(e),defined(i._tileset)&&(i._tileset.skipScreenSpaceErrorFactor=e))}}),this.skipScreenSpaceErrorFactor=16;const O=knockout.observable();knockout.defineProperty(this,"baseScreenSpaceError",{get:function(){return O()},set:function(e){e=Number(e),isNaN(e)||(O(e),defined(i._tileset)&&(i._tileset.baseScreenSpaceError=e))}}),this.baseScreenSpaceError=1024;const R=knockout.observable();knockout.defineProperty(this,"skipLevels",{get:function(){return R()},set:function(e){e=Number(e),isNaN(e)||(R(e),defined(i._tileset)&&(i._tileset.skipLevels=e))}}),this.skipLevels=1;const I=knockout.observable();knockout.defineProperty(this,"immediatelyLoadDesiredLevelOfDetail",{get:function(){return I()},set:function(e){I(e),defined(i._tileset)&&(i._tileset.immediatelyLoadDesiredLevelOfDetail=e)}}),this.immediatelyLoadDesiredLevelOfDetail=!1;const N=knockout.observable();knockout.defineProperty(this,"loadSiblings",{get:function(){return N()},set:function(e){N(e),defined(i._tileset)&&(i._tileset.loadSiblings=e)}}),this.loadSiblings=!1,this._style=void 0,this._shouldStyle=!1,this._definedProperties=["properties","dynamicScreenSpaceError","colorBlendMode","picking","colorize","wireframe","showBoundingVolumes","showContentBoundingVolumes","showRequestVolumes","freezeFrame","maximumScreenSpaceError","dynamicScreenSpaceErrorDensity","baseScreenSpaceError","skipScreenSpaceErrorFactor","skipLevelOfDetail","skipLevels","immediatelyLoadDesiredLevelOfDetail","loadSiblings","dynamicScreenSpaceErrorDensitySliderValue","dynamicScreenSpaceErrorFactor","pickActive","showOnlyPickedTileDebugLabel","showGeometricError","showRenderingStatistics","showMemoryUsage","showUrl","pointCloudShading","geometricErrorScale","maximumAttenuation","baseResolution","eyeDomeLighting","eyeDomeLightingStrength","eyeDomeLightingRadius"],this._removePostRenderEvent=e.postRender.addEventListener((function(){i._update()})),defined(this._tileset)||selectTilesetOnHover(this,!0)}function hasFeatures(e){if(e.featuresLength>0)return!0;const t=e.innerContents;if(defined(t)){const e=t.length;for(let i=0;i<e;++i)if(!hasFeatures(t[i]))return!1;return!0}return!1}Object.defineProperties(Cesium3DTilesInspectorViewModel.prototype,{scene:{get:function(){return this._scene}},performanceContainer:{get:function(){return this._performanceContainer}},statisticsText:{get:function(){return this._statisticsText}},pickStatisticsText:{get:function(){return this._pickStatisticsText}},colorBlendModes:{get:function(){return colorBlendModes}},editorError:{get:function(){return this._editorError}},tileset:{get:function(){return this._tileset},set:function(e){if(this._tileset=e,this._style=void 0,this.styleString="{}",this.feature=void 0,this.tile=void 0,defined(e)){const t=this;e.readyPromise.then((function(e){t.isDestroyed()||t._properties(e.properties)}));const i=["colorize","wireframe","showBoundingVolumes","showContentBoundingVolumes","showRequestVolumes","freezeFrame","showOnlyPickedTileDebugLabel","showGeometricError","showRenderingStatistics","showMemoryUsage","showUrl"],o=i.length;for(let e=0;e<o;++e){const t=i[e];this[t]=this[t]}this.maximumScreenSpaceError=e.maximumScreenSpaceError,this.dynamicScreenSpaceError=e.dynamicScreenSpaceError,this.dynamicScreenSpaceErrorDensity=e.dynamicScreenSpaceErrorDensity,this.dynamicScreenSpaceErrorFactor=e.dynamicScreenSpaceErrorFactor,this.colorBlendMode=e.colorBlendMode,this.skipLevelOfDetail=e.skipLevelOfDetail,this.skipScreenSpaceErrorFactor=e.skipScreenSpaceErrorFactor,this.baseScreenSpaceError=e.baseScreenSpaceError,this.skipLevels=e.skipLevels,this.immediatelyLoadDesiredLevelOfDetail=e.immediatelyLoadDesiredLevelOfDetail,this.loadSiblings=e.loadSiblings;const s=e.pointCloudShading;this.pointCloudShading=s.attenuation,this.geometricErrorScale=s.geometricErrorScale,this.maximumAttenuation=s.maximumAttenuation?s.maximumAttenuation:0,this.baseResolution=s.baseResolution?s.baseResolution:0,this.eyeDomeLighting=s.eyeDomeLighting,this.eyeDomeLightingStrength=s.eyeDomeLightingStrength,this.eyeDomeLightingRadius=s.eyeDomeLightingRadius,this._scene.requestRender()}else this._properties({});this._statisticsText=getStatistics(e,!1),this._pickStatisticsText=getStatistics(e,!0),selectTilesetOnHover(this,!1)}},feature:{get:function(){return this._feature},set:function(e){if(this._feature===e)return;const t=this._feature;defined(t)&&!t.content.isDestroyed()&&(!this.colorize&&defined(this._style)?t.color=defined(this._style.color)?this._style.color.evaluateColor(t,scratchColor):Color.WHITE:t.color=oldColor,this._scene.requestRender()),defined(e)&&(Color.clone(e.color,oldColor),e.color=highlightColor,this._scene.requestRender()),this._feature=e}},tile:{get:function(){return this._tile},set:function(e){if(this._tile===e)return;const t=this._tile;!defined(t)||t.isDestroyed()||hasFeatures(t.content)||(t.color=oldColor,this._scene.requestRender()),defined(e)&&!hasFeatures(e.content)&&(Color.clone(e.color,oldColor),e.color=highlightColor,this._scene.requestRender()),this._tile=e}}}),Cesium3DTilesInspectorViewModel.prototype.togglePickTileset=function(){this.pickActive=!this.pickActive},Cesium3DTilesInspectorViewModel.prototype.toggleInspector=function(){this.inspectorVisible=!this.inspectorVisible},Cesium3DTilesInspectorViewModel.prototype.toggleTileset=function(){this.tilesetVisible=!this.tilesetVisible},Cesium3DTilesInspectorViewModel.prototype.toggleDisplay=function(){this.displayVisible=!this.displayVisible},Cesium3DTilesInspectorViewModel.prototype.toggleUpdate=function(){this.updateVisible=!this.updateVisible},Cesium3DTilesInspectorViewModel.prototype.toggleLogging=function(){this.loggingVisible=!this.loggingVisible},Cesium3DTilesInspectorViewModel.prototype.toggleStyle=function(){this.styleVisible=!this.styleVisible},Cesium3DTilesInspectorViewModel.prototype.toggleTileDebugLabels=function(){this.tileDebugLabelsVisible=!this.tileDebugLabelsVisible},Cesium3DTilesInspectorViewModel.prototype.toggleOptimization=function(){this.optimizationVisible=!this.optimizationVisible},Cesium3DTilesInspectorViewModel.prototype.trimTilesCache=function(){defined(this._tileset)&&this._tileset.trimLoadedTiles()},Cesium3DTilesInspectorViewModel.prototype.compileStyle=function(){const e=this._tileset;if(defined(e)&&this.styleString!==JSON.stringify(e.style)){this._editorError="";try{0===this.styleString.length&&(this.styleString="{}"),this._style=new Cesium3DTileStyle(JSON.parse(this.styleString)),this._shouldStyle=!0,this._scene.requestRender()}catch(e){this._editorError=e.toString()}this.feature=this._feature,this.tile=this._tile}},Cesium3DTilesInspectorViewModel.prototype.styleEditorKeyPress=function(e,t){if(9===t.keyCode){t.preventDefault();const e=t.target,i=e.selectionStart,o=e.selectionEnd;let s=o;const n=e.value.slice(i,o).split("\n"),r=n.length;let c;if(t.shiftKey)for(c=0;c<r;++c)" "===n[c][0]&&(" "===n[c][1]?(n[c]=n[c].substr(2),s-=2):(n[c]=n[c].substr(1),s-=1));else for(c=0;c<r;++c)n[c]=`  ${n[c]}`,s+=2;const l=n.join("\n");e.value=e.value.slice(0,i)+l+e.value.slice(o),e.selectionStart=i!==o?i:s,e.selectionEnd=s}else!t.ctrlKey||10!==t.keyCode&&13!==t.keyCode||this.compileStyle();return!0},Cesium3DTilesInspectorViewModel.prototype._update=function(){const e=this._tileset;if(this.performance&&this._performanceDisplay.update(),defined(e)){if(e.isDestroyed())return this.tile=void 0,this.feature=void 0,void(this.tileset=void 0);const t=e.style;this._style!==e.style&&(this._shouldStyle?(e.style=this._style,this._shouldStyle=!1):(this._style=t,this.styleString=JSON.stringify(t.style,null,"  ")))}this.showStatistics&&(this._statisticsText=getStatistics(e,!1),this._pickStatisticsText=getStatistics(e,!0))},Cesium3DTilesInspectorViewModel.prototype.isDestroyed=function(){return!1},Cesium3DTilesInspectorViewModel.prototype.destroy=function(){this._eventHandler.destroy(),this._removePostRenderEvent();const e=this;return this._definedProperties.forEach((function(t){knockout.getObservable(e,t).dispose()})),destroyObject(this)},Cesium3DTilesInspectorViewModel.getStatistics=getStatistics;export default Cesium3DTilesInspectorViewModel;