interface IReduxAction {
    type: string,
    generatedBy?: string,
    value?: any,
}

export default class Redux {
    private _getState: () => any;
    private _dispatch: (object) => any;
    private _navigate: (object) => any;

    private PLAYBACK_PREFIX = "@@btmp/PLAYBACK";

    private getReactInstance(el: Element) {
        const keys = Object.keys(el);
        const instanceKeys = keys.filter(prop =>  /__reactInternalInstance/.test(prop));

        if (instanceKeys.length < 1) {
            return null;
        }

        const instance = el[instanceKeys[0]];
        return instance;
    }

    findHooks(): void {
        const root = document.querySelector('video.btm-media-client-element');
        let instance = this.getReactInstance(root);
        let foundState = false;
        let foundNavigate = false;

        while (!(foundState && foundNavigate)) {
            if (instance) {
                if (!foundState) {
                    if (typeof instance.type === "object" && instance.type && ('$$typeof' in instance.type) && typeof instance.type.$$typeof === "symbol") {
                        if (instance.type.$$typeof.description == "react.provider") {
                            const store = instance.memoizedProps.value.store;
                            this._dispatch = store.dispatch;
                            this._getState = store.getState;
                            foundState = true;
                        }
                    }
                }

                if (!foundNavigate) {
                    if ('navigate' in instance.memoizedProps) {
                        this._navigate = instance.memoizedProps.navigate;
                        foundNavigate = true;
                    }
                }

                instance = instance.return;
            } else {
                // bail out
                foundState = true;
                foundNavigate = true;
            }
        }
    }

    dispatch(action: IReduxAction): void {
        if (this.dispatch) {
            this._dispatch(action);
        }
    }

    getState(): any {
        if (this.getState) {
            return this._getState();
        }
    }

    play(): void {
        this.withUI(() => {
            this.dispatch({
                type: this.getPlaybackAction('PLAY'),
                generatedBy: "user"
            });
        });
    }

    pause(): void {
        this.withUI(() => {
            this.dispatch({
                type: this.getPlaybackAction('PAUSE'),
                generatedBy: "user"
            });
        });
    }

    showUI(): void {
        console.log(this.dispatch);
        console.log(this.getState());
        this.dispatch({
            type: "@@btmp-ui/UI/OVERLAY/CONTROLS/SET_DECAY_REACHED",
            value: false
        });
    }

    hideUI(): void {
        this.dispatch({
            type: "@@btmp-ui/UI/OVERLAY/CONTROLS/SET_DECAY_REACHED",
            value: true
        });
    }

    changeVideo(videoID: string): void {
        this._navigate({
            name: "video",
            params: {
                contentId: videoID
            }
        });
    }

    private withUI(callback: () => void) {
        const hidden: boolean = this.getState().get('ui').get('overlays').get('controls').get('decayReached');

        if (hidden) {
            this.showUI();
            setTimeout(() => {
                callback();
                setTimeout(() => this.hideUI(), 100);
            }, 300);
        } else {
            callback();
        }
    }

    private getPlaybackAction(action) {
        return `${this.PLAYBACK_PREFIX}/${action}`;
    }
}