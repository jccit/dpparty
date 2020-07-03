import { browser, WebNavigation } from "webextension-polyfill-ts";

// Store the current video player tab id
let currentTab = -1;

async function onPageChanged(e: WebNavigation.OnCompletedDetailsType | WebNavigation.OnCompletedDetailsType) {
    if (e.url.indexOf("https://www.disneyplus.com/video/") === 0) {
        currentTab = e.tabId;
        const url = new URL(e.url);
        const videoId = url.pathname.split("/").pop();

        // Send video id
        try {
            await browser.tabs.sendMessage(currentTab, `dp-video-changed|${videoId}`);
            console.log("New video ID:", videoId);
        } catch (err) {
            console.error(err);
        }

        browser.browserAction.setIcon({
            path: {
                48: "images/icon-48-active.png",
                96: "images/icon-96-active.png"
            }
        });
    } else {
        if (e.tabId === currentTab) {
            // User has navigated away from video, remove current tab
            currentTab = -1;
        }

        browser.browserAction.setIcon({
            path: {
                48: "images/icon-48.png",
                96: "images/icon-96.png"
            }
        });
    }
}

browser.webNavigation.onCompleted.addListener(onPageChanged);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageChanged);
