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

document.addEventListener('dpActivate', (e: CustomEvent) => {
    const roomCode = e.detail;

    if (!active) {
        initLoop(roomCode);
    }
});

document.addEventListener('dpGetRoom', (e: CustomEvent) => {
    if (active) {
        document.dispatchEvent(new CustomEvent('dpRoomCode', {
            detail: JSON.stringify({ type: 'room', room: socket.getRoom(), video: videoPlayer.getVideoId() })
        }));
    }
});