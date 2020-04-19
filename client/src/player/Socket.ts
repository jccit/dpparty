import VideoPlayer from "./VideoPlayer";

export default class Socket {
    private ws: WebSocket;
    private video: VideoPlayer;
    private jwt: string;
    private currentRoom: string;

    constructor(videoPlayer: VideoPlayer) {
        this.video = videoPlayer;
        this.video.onPlayToggled = this.onPlayToggled.bind(this);
        this.video.onSeeked = this.onSeeked.bind(this);
    }

    async connect() {
        await this.socketInit();
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = null;
    }

    private socketInit() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket('wss://***REMOVED***:8080');
            this.ws.onopen = () => resolve();
            this.ws.onerror = (err) => reject(err);
        });
    }

    send(data: object) {
        let msg = data;

        if (this.jwt) {
            msg = {
                ...data,
                jwt: this.jwt
            };
        }

        this.ws.send(JSON.stringify(msg));
    }

    onPlayToggled(playing: boolean) {
        this.updateState();
    }

    onSeeked(time: number) {
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

        switch (msg.type) {
            case 'jwt':
                this.jwt = msg.jwt;
                break;

            case 'joinRoom':
                this.currentRoom = msg.state.uuid;
                document.dispatchEvent(new CustomEvent('dpRoomCode', {
                    detail: JSON.stringify({ type: 'room', room: this.currentRoom, video: this.video.getVideoId() })
                }));
                break;

            case 'update':
                this.video.setTime(msg.state.time);
                this.video.setPlaying(msg.state.playing);
                break;

            default:
                break;
        }
    }

    newRoom() {
        const state = this.video.getPlaybackState();
        this.send({
            type: "newRoom",
            state
        })
    }

    joinRoom(roomCode: string) {
        this.send({
            type: "joinRoom",
            id: roomCode
        })
    }
}