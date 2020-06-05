import { browser } from "webextension-polyfill-ts";

const newRoom = document.querySelector<HTMLButtonElement>('#newRoom');
const joinRoom = document.querySelector<HTMLButtonElement>('#joinRoom');
const link = document.querySelector<HTMLParagraphElement>('#link');
let currentTab;

browser.tabs.query({
    active: true,
    currentWindow: true
}).then((tabs) => {
    // Check if DP url, then activate
    if (tabs.length > 0 && tabs[0].url.indexOf("https://www.disneyplus.com/video/") === 0) {
        currentTab = tabs[0];
        newRoom.disabled = false;
        joinRoom.disabled = false;

        browser.browserAction.setIcon({
            path: {
                48: "images/icon-48-active.png",
                96: "images/icon-96-active.png"
            }
        });
    } else {
        browser.browserAction.setIcon({
            path: {
                48: "images/icon-48.png",
                96: "images/icon-96.png"
            }
        });
    }
});

newRoom.addEventListener('click', () => {
    browser.tabs.sendMessage(currentTab.id, "dp-activate");
    newRoom.disabled = true;
    joinRoom.disabled = true;
});

joinRoom.addEventListener('click', () => {
    browser.tabs.sendMessage(currentTab.id, "dp-join");
    newRoom.disabled = true;
    joinRoom.disabled = true;
});

browser.runtime.onMessage.addListener((message) => {
    if (message != "dp-activate" && message != "dp-join") {
        const parsed = JSON.parse(message);
        if (parsed.type == 'room') {
            link.innerText = `https://www.disneyplus.com/video/${parsed.video}#${parsed.room}`;
        }
    }
});