import { browser } from "webextension-polyfill-ts";

browser.runtime.onMessage.addListener((message: string) => {
    if (message == "dp-activate" || message == "dp-join") {
        const roomCode = message == "dp-join" ? window.location.hash.replace('#', '') : null;

        document.dispatchEvent(new CustomEvent('dpActivate', {
            detail: roomCode
        }));
    } else if (message == "dp-get-room") {
        document.dispatchEvent(new CustomEvent('dpGetRoom'));
    } else if (message.indexOf("dp-video-changed") > -1) {
        const videoId = message.split("|").pop();

        console.log("Got video id from background", videoId);

        document.dispatchEvent(new CustomEvent("dpVideoChanged", {
            detail: videoId
        }));
    }
});

document.addEventListener('dpRoomCode', (e: CustomEvent) => {
    browser.runtime.sendMessage(e.detail);
});

// Load player script
const script = document.createElement('script');
script.src = browser.extension.getURL('player.js');
(document.head||document.documentElement).appendChild(script);