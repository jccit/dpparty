export default class Redux {
    private _getState: () => object;
    private _dispatch: (object) => object;

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

    findHooks() {
        const root = document.querySelector('video.btm-media-client-element');
        let instance = this.getReactInstance(root);
        let done = false;

        while (!done) {
            if (instance) {
                if (typeof instance.type === "object" && instance.type && ('$$typeof' in instance.type) && typeof instance.type.$$typeof === "symbol") {
                    if (instance.type.$$typeof.description == "react.provider") {
                        const store = instance.memoizedProps.value.store;
                        console.log(instance);
                        this._dispatch = store.dispatch;
                        this._getState = store.getState;
                        done = true;
                    } else {
                        instance = instance.return;
                    }
                } else {
                    instance = instance.return;
                }
            } else {
                done = true;
            }
        }
    }

    dispatch(action) {
        if (this.dispatch) {
            this._dispatch(action);
        }
    }

    getState(): any {
        if (this.getState) {
            return this._getState();
        }
    }

    play() {
        this.withUI(() => {
            this.dispatch({
                type: this.getPlaybackAction('PLAY'),
                generatedBy: "user"
            });
        });
    }

    pause() {
        this.withUI(() => {
            this.dispatch({
                type: this.getPlaybackAction('PAUSE'),
                generatedBy: "user"
            });
        });
    }

    showUI() {
        console.log(this.dispatch);
        console.log(this.getState());
        this.dispatch({
            type: "@@btmp-ui/UI/OVERLAY/CONTROLS/SET_DECAY_REACHED",
            value: false
        });
    }

    hideUI() {
        this.dispatch({
            type: "@@btmp-ui/UI/OVERLAY/CONTROLS/SET_DECAY_REACHED",
            value: true
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