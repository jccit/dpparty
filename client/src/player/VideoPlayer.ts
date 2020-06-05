import IPlaybackState from "./IPlaybackState";
import Redux from './Redux';

export default class VideoPlayer {
    public onPlayToggled: (playing: boolean) => void;
    public onSeeked: (time: number) => void;

    private video?: HTMLVideoElement;
    private lastSyncedTime = 0;
    private shouldPlay = false;

    private redux = new Redux();

    setup(): boolean {
        const videoEl = document.querySelector<HTMLVideoElement>('video.btm-media-client-element');
        if (!videoEl) return false;

        this.redux.findHooks();

        this.video = videoEl;
        this.video.addEventListener('play', this.eventHandler(this.handlePlayToggled.bind(this)));
        this.video.addEventListener('pause', this.eventHandler(this.handlePlayToggled.bind(this)));
        this.video.addEventListener('seeking', this.eventHandler(this.handleSeeked.bind(this)));
        this.video.addEventListener('canplaythrough', this.canPlay.bind(this));

        this.lastSyncedTime = this.video.currentTime;

        return true;
    }

    setTime(time: number): void {
        if (this.video) {
            this.lastSyncedTime = time;
            this.video.currentTime = time;
        }
    }

    setPlaying(playing: boolean): void {
        if (this.video) {
            this.shouldPlay = playing;

            if (playing) {
                this.redux.play();
            } else {
                this.redux.pause();
            }
        }
    }

    getVideoId(): string {
        return window.location.pathname.replace('/video/', '');
    }

    getPlaybackState(): IPlaybackState {
        return {
            playing: !this.video.paused,
            time: this.video.currentTime,
            video: this.getVideoId()
        };
    }

    private hasChangedEnough() {
        const timeDif = Math.abs(this.video.currentTime - this.lastSyncedTime);

        return timeDif > 0.5;
    }

    private eventHandler(callback: (e: any) => any) {
        return (e: any) => {
            if (this.hasChangedEnough()) {
                callback(e);
            }
        };
    }

    // Triggered when the user toggles playing
    private handlePlayToggled() {
        const playState = !this.video.paused;
        if (this.onPlayToggled) {
            this.onPlayToggled(playState);
        }
    }

    private handleSeeked() {
        const time = this.video.currentTime;
        if (this.onSeeked) {
            this.onSeeked(time);
        }
    }

    private canPlay() {
        if (this.shouldPlay) {
            this.redux.play();
        } else {
            this.redux.pause();
        }
    }
}
