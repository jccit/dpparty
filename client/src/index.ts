import VideoPlayer from './VideoPlayer';
import Socket from './Socket';

const videoPlayer = new VideoPlayer();
let socket: Socket;
let active = false;

async function initDP(roomCode: string) {
    try {
        if (!videoPlayer.setup()) return false;

        socket = new Socket(videoPlayer);
        await socket.connect();

        if (!roomCode) {
            socket.newRoom();
        } else {
            socket.joinRoom(roomCode);
        }
    } catch {
        return false;
    }

    console.log('[DP] Init success');

    return true;
}

function initLoop(roomCode: string) {
    if (!initDP(roomCode)) {
        console.warn('[DP] Init failed');
        setTimeout(initLoop.bind(this), 500);
    } else {
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