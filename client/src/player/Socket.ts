import VideoPlayer from "./VideoPlayer";
import IPlaybackState from "./IPlaybackState";

interface ISocketMessage {
    type: string,
    id?: string,
    state?: IPlaybackState,
    jwt?: string
}

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

    async connect(): Promise<void> {
        await this.socketInit();
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = null;
    }

    private socketInit() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(process.env.SOCKET_URL);
            this.ws.onopen = () => resolve();
            this.ws.onerror = (err) => reject(err);
        });
    }

    send(data: ISocketMessage): void {
        let msg = data;

        if (this.jwt) {
            msg = {
                ...data,
                jwt: this.jwt
            };
        }

        this.ws.send(JSON.stringify(msg));
    }

    onPlayToggled(): void {
        this.updateState();
    }

    onSeeked(): void {
        this.updateState();
    }

    updateState(): void {
        const state = this.video.getPlaybackState();
        this.send({
            type: 'update',
            id: this.currentRoom,
            state
        });
    }

    onMessage(message: { data: string }): void {
        const msg: ISocketMessage = JSON.parse(message.data);

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

    newRoom(): void {
        const state = this.video.getPlaybackState();
        this.send({
            type: "newRoom",
            state
        })
    }

    joinRoom(roomCode: string): void {
        this.send({
            type: "joinRoom",
            id: roomCode
        })
    }

    getRoom(): string {
        return this.currentRoom;
    }
}