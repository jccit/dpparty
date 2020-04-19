!function(e){var t={};function i(n){if(t[n])return t[n].exports;var s=t[n]={i:n,l:!1,exports:{}};return e[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)i.d(n,s,function(t){return e[t]}.bind(null,s));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=3)}([,,,function(e,t,i){"use strict";var n=this&&this.__awaiter||function(e,t,i,n){return new(i||(i=Promise))((function(s,o){function a(e){try{d(n.next(e))}catch(e){o(e)}}function r(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(a,r)}d((n=n.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const s=i(4),o=i(6),a=new s.default;let r,d=!1;function c(e){!function(e){return n(this,void 0,void 0,(function*(){try{if(!a.setup())return!1;r=new o.default(a),yield r.connect(),e?r.joinRoom(e):r.newRoom()}catch(e){return!1}return console.log("[DP] Init success"),!0}))}(e)?(console.warn("[DP] Init failed"),setTimeout(c.bind(this),500)):d=!0}document.addEventListener("dpActivate",e=>{const t=e.detail;d||c(t)})},function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=i(5);t.default=class{constructor(){this.lastSyncedTime=0,this.shouldPlay=!1,this.redux=new n.default}setup(){const e=document.querySelector("video.btm-media-client-element");return!!e&&(this.redux.findHooks(),this.video=e,this.video.addEventListener("play",this.eventHandler(this.handlePlayToggled.bind(this))),this.video.addEventListener("pause",this.eventHandler(this.handlePlayToggled.bind(this))),this.video.addEventListener("seeking",this.eventHandler(this.handleSeeked.bind(this))),this.video.addEventListener("canplaythrough",this.canPlay.bind(this)),this.lastSyncedTime=this.video.currentTime,!0)}setTime(e){this.video&&(this.lastSyncedTime=e,this.video.currentTime=e)}setPlaying(e){this.video&&(this.shouldPlay=e,e?this.redux.play():this.redux.pause())}getVideoId(){return window.location.pathname.replace("/video/","")}getPlaybackState(){return{playing:!this.video.paused,time:this.video.currentTime,video:this.getVideoId()}}hasChangedEnough(){return Math.abs(this.video.currentTime-this.lastSyncedTime)>.5}eventHandler(e){return t=>{this.hasChangedEnough()&&e(t)}}handlePlayToggled(e){const t=!this.video.paused;this.onPlayToggled&&this.onPlayToggled(t)}handleSeeked(e){const t=this.video.currentTime;this.onSeeked&&this.onSeeked(t)}canPlay(){this.shouldPlay?this.redux.play():this.redux.pause()}}},function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(){this.PLAYBACK_PREFIX="@@btmp/PLAYBACK"}getReactInstance(e){const t=Object.keys(e).filter(e=>/__reactInternalInstance/.test(e));return t.length<1?null:e[t[0]]}findHooks(){const e=document.querySelector("video.btm-media-client-element");let t=this.getReactInstance(e),i=!1;for(;!i;)if(t)if("object"==typeof t.type&&t.type&&"$$typeof"in t.type&&"symbol"==typeof t.type.$$typeof)if("react.provider"==t.type.$$typeof.description){const e=t.memoizedProps.value.store;console.log(t),this._dispatch=e.dispatch,this._getState=e.getState,i=!0}else t=t.return;else t=t.return;else i=!0}dispatch(e){this.dispatch&&this._dispatch(e)}getState(){if(this.getState)return this._getState()}play(){this.withUI(()=>{this.dispatch({type:this.getPlaybackAction("PLAY"),generatedBy:"user"})})}pause(){this.withUI(()=>{this.dispatch({type:this.getPlaybackAction("PAUSE"),generatedBy:"user"})})}showUI(){console.log(this.dispatch),console.log(this.getState()),this.dispatch({type:"@@btmp-ui/UI/OVERLAY/CONTROLS/SET_DECAY_REACHED",value:!1})}hideUI(){this.dispatch({type:"@@btmp-ui/UI/OVERLAY/CONTROLS/SET_DECAY_REACHED",value:!0})}withUI(e){this.getState().get("ui").get("overlays").get("controls").get("decayReached")?(this.showUI(),setTimeout(()=>{e(),setTimeout(()=>this.hideUI(),100)},300)):e()}getPlaybackAction(e){return`${this.PLAYBACK_PREFIX}/${e}`}}},function(e,t,i){"use strict";var n=this&&this.__awaiter||function(e,t,i,n){return new(i||(i=Promise))((function(s,o){function a(e){try{d(n.next(e))}catch(e){o(e)}}function r(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(a,r)}d((n=n.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(e){this.video=e,this.video.onPlayToggled=this.onPlayToggled.bind(this),this.video.onSeeked=this.onSeeked.bind(this)}connect(){return n(this,void 0,void 0,(function*(){yield this.socketInit(),this.ws.onmessage=this.onMessage.bind(this),this.ws.onerror=null}))}socketInit(){return new Promise((e,t)=>{this.ws=new WebSocket("wss://***REMOVED***:8080"),this.ws.onopen=()=>e(),this.ws.onerror=e=>t(e)})}send(e){let t=e;this.jwt&&(t=Object.assign(Object.assign({},e),{jwt:this.jwt})),this.ws.send(JSON.stringify(t))}onPlayToggled(e){this.updateState()}onSeeked(e){this.updateState()}updateState(){const e=this.video.getPlaybackState();this.send({type:"update",id:this.currentRoom,state:e})}onMessage(e){const t=JSON.parse(e.data);switch(t.type){case"jwt":this.jwt=t.jwt;break;case"joinRoom":this.currentRoom=t.state.uuid,document.dispatchEvent(new CustomEvent("dpRoomCode",{detail:JSON.stringify({type:"room",room:this.currentRoom,video:this.video.getVideoId()})}));break;case"update":this.video.setTime(t.state.time),this.video.setPlaying(t.state.playing)}}newRoom(){const e=this.video.getPlaybackState();this.send({type:"newRoom",state:e})}joinRoom(e){this.send({type:"joinRoom",id:e})}}}]);