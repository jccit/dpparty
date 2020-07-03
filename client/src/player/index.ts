import VideoPlayer from './VideoPlayer';
import Socket from './Socket';

let videoPlayer;
let socket: Socket;
let active = false;
let lastRoomCode = '';

async function initDP(roomCode: string) {
    try {
        videoPlayer = new VideoPlayer();
        if (!videoPlayer.setup()) return false;

        console.log(videoPlayer);

        if (socket) {
            socket.setPlayer(videoPlayer);
        } else {
            socket = new Socket(videoPlayer);
            await socket.connect();

            if (!roomCode) {
                socket.newRoom();
            } else {
                socket.joinRoom(roomCode);
            }
        }
    } catch {
        return false;
    }

    console.log('[DP] Init success');

    return true;
}

async function initLoop(roomCode: string) {
    lastRoomCode = roomCode;
    const success = await initDP(roomCode);

    if (!success) {
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

document.addEventListener('dpGetRoom', () => {
    if (active) {
        document.dispatchEvent(new CustomEvent('dpRoomCode', {
            detail: JSON.stringify({ type: 'room', room: socket.getRoom(), video: videoPlayer.getVideoId() })
        }));
    }
});

document.addEventListener('dpVideoChanged', (e: any) => {
    if (active) {
        console.log("Video change event", e);

        active = false;
        socket.changeVideo(e.detail);
        initLoop(lastRoomCode);
    }
});