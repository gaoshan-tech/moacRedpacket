(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d0ddf1a"],{8419:function(t,e,o){"use strict";o.r(e);var i=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticStyle:{background:"#cccccc"}},t._l(t.imgData,(function(e){return o("div",{staticStyle:{width:"100%",height:"200px","margin-bottom":"20px"}},[o("img",{staticStyle:{width:"100%",height:"100%"},attrs:{src:t.getBase64Img(e.url)||e.url,alt:""}})])})),0)},a=[];function c(t,e){var o,i=new Image;i.setAttribute("crossOrigin","Anonymous"),i.src=t,i.onload=function(){var t=i.width,a=i.height,c=t/a;t=200,a=t/c;var r=.7,n=document.createElement("canvas"),s=n.getContext("2d"),u=document.createAttribute("width");u.nodeValue=t;var l=document.createAttribute("height");l.nodeValue=a,n.setAttributeNode(u),n.setAttributeNode(l),s.drawImage(i,0,0,t,a);var d=i.src.substring(i.src.lastIndexOf(".")+1).toLowerCase();o=n.toDataURL("image/"+d,r),e(o)}}var r={name:"index",data:function(){return{imgData:[]}},mounted:function(){this.imgData=[{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=169"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=168"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=167"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=166"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=165"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=164"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=163"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=165"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=164"},{url:"http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=163"}];var t=this;this.imgData.map((function(e){c(e.url,(function(o){sessionStorage.setItem(e.url,o),t.$db.add("t1",{name:e.url,key:o})}))}))},methods:{getBase64Img:function(t){return sessionStorage.getItem(t)}}},n=r,s=o("2877"),u=Object(s["a"])(n,i,a,!1,null,"527093fa",null);e["default"]=u.exports}}]);
//# sourceMappingURL=chunk-2d0ddf1a.8ccb8ecb.js.map