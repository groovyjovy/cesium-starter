(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(e){if(e.ep)return;e.ep=!0;const t=n(e);fetch(e.href,t)}})();const s=new Cesium.UrlTemplateImageryProvider({url:"https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png",credit:new Cesium.Credit("Maptiles by <a href='http://mierune.co.jp' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL.")}),a=new Cesium.Viewer("map",{baseLayerPicker:!1,geocoder:!1,homeButton:!1,timeline:!1,animation:!1,imageryProvider:s});a.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(139.5,33,1e5),orientation:{pitch:-.3,roll:-.25}});
