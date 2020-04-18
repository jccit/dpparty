const newRoom = document.querySelector('#newRoom');
const joinRoom = document.querySelector('#joinRoom');
const link = document.querySelector('#link');
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