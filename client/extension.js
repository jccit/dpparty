(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    class VideoPlayer {
        constructor() {
            this.updating = false;
            this.lastSyncedTime = 0;
            this.shouldPlay = false;
        }
        setup() {
            const videoEl = document.querySelector('video.btm-media-client-element');
            if (!videoEl)
                return false;
            this.video = videoEl;
            this.video.addEventListener('play', this.eventHandler(this.handlePlayToggled.bind(this)));
            this.video.addEventListener('pause', this.eventHandler(this.handlePlayToggled.bind(this)));
            this.video.addEventListener('seeking', this.eventHandler(this.handleSeeked.bind(this)));
            this.video.addEventListener('canplaythrough', this.canPlay.bind(this));
            this.lastSyncedTime = this.video.currentTime;
            return true;
        }
        setTime(time) {
            if (this.video) {
                this.lastSyncedTime = time;
                this.video.currentTime = time;
            }
        }
        setPlaying(playing) {
            if (this.video) {
                this.shouldPlay = playing;
                if (playing) {
                    this.video.play();
                }
                else {
                    this.video.pause();
                }
            }
        }
        getVideoId() {
            return window.location.pathname.replace('/video/', '');
        }
        getPlaybackState() {
            return {
                playing: !this.video.paused,
                time: this.video.currentTime,
                video: this.getVideoId()
            };
        }
        hasChangedEnough() {
            const timeDif = Math.abs(this.video.currentTime - this.lastSyncedTime);
            return timeDif > 0.2;
        }
        eventHandler(callback) {
            return (e) => {
                if (this.hasChangedEnough()) {
                    callback(e);
                }
            };
        }
        // Triggered when the user toggles playing
        handlePlayToggled(e) {
            const playState = !this.video.paused;
            if (this.onPlayToggled) {
                this.onPlayToggled(playState);
            }
        }
        handleSeeked(e) {
            const time = this.video.currentTime;
            if (this.onSeeked) {
                this.onSeeked(time);
            }
        }
        canPlay() {
            if (this.shouldPlay) {
                this.video.play();
            }
        }
    }

    class Socket {
        constructor(videoPlayer) {
            this.video = videoPlayer;
            this.video.onPlayToggled = this.onPlayToggled.bind(this);
            this.video.onSeeked = this.onSeeked.bind(this);
        }
        connect() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.socketInit();
                this.ws.onmessage = this.onMessage.bind(this);
                this.ws.onerror = null;
            });
        }
        socketInit() {
            return new Promise((resolve, reject) => {
                this.ws = new WebSocket('ws://localhost:8080');
                this.ws.onopen = () => resolve();
                this.ws.onerror = (err) => reject(err);
            });
        }
        send(data) {
            let msg = data;
            if (this.jwt) {
                msg = Object.assign(Object.assign({}, data), { jwt: this.jwt });
            }
            this.ws.send(JSON.stringify(msg));
        }
        onPlayToggled(playing) {
            this.updateState();
        }
        onSeeked(time) {
            this.updateState();
        }
        updateState() {
            const state = this.video.getPlaybackState();
            this.send({
                type: 'update',
                id: this.currentRoom,
                state
            });
        }
        onMessage(message) {
            const msg = JSON.parse(message.data);
            console.log(msg);
            switch (msg.type) {
                case 'jwt':
                    this.jwt = msg.jwt;
                    break;
                case 'joinRoom':
                    this.currentRoom = msg.state.uuid;
                    browser.runtime.sendMessage(JSON.stringify({ type: 'room', room: this.currentRoom, video: this.video.getVideoId() }));
                    break;
                case 'update':
                    this.video.setTime(msg.state.time);
                    this.video.setPlaying(msg.state.playing);
                    break;
            }
        }
        newRoom() {
            const state = this.video.getPlaybackState();
            this.send({
                type: "newRoom",
                state
            });
        }
        joinRoom(roomCode) {
            this.send({
                type: "joinRoom",
                id: roomCode
            });
        }
    }

    const videoPlayer = new VideoPlayer();
    let socket;
    let active = false;
    function initDP(roomCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!videoPlayer.setup())
                    return false;
                socket = new Socket(videoPlayer);
                yield socket.connect();
                if (!roomCode) {
                    socket.newRoom();
                }
                else {
                    socket.joinRoom(roomCode);
                }
            }
            catch (_a) {
                return false;
            }
            console.log('[DP] Init success');
            return true;
        });
    }
    function initLoop(roomCode) {
        if (!initDP(roomCode)) {
            console.warn('[DP] Init failed');
            setTimeout(initLoop.bind(this), 500);
        }
        else {
            active = true;
        }
    }
    browser.runtime.onMessage.addListener((message) => {
        if (message == "dp-activate" || message == "dp-join") {
            const roomCode = message == "dp-join" ? window.location.hash.replace('#', '') : null;
            if (!active) {
                initLoop(roomCode);
            }
        }
    });

}());
