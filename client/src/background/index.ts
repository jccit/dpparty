import { browser, WebNavigation } from "webextension-polyfill-ts";

// Store the current video player tab id
let currentTab = -1;

async function onPageChanged(e: WebNavigation.OnCompletedDetailsType | WebNavigation.OnCompletedDetailsType) {
    if (e.url.indexOf("https://www.disneyplus.com/video/") === 0) {
        // Load script if needed
        if (currentTab == -1) {
            await browser.tabs.executeScript(currentTab, {
                file: "content.js",
                runAt: "document_end"
            });
        }

        currentTab = e.tabId;
        const url = new URL(e.url);
        const videoId = url.pathname.split("/").pop();

        // Send video id
        browser.tabs.sendMessage(currentTab, `dp-video-changed|${videoId}`);
        console.log("Video ID:", videoId);

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