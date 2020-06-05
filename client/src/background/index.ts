import { browser } from "webextension-polyfill-ts";

function onPageChanged(e) {
    if (e.url.indexOf("https://www.disneyplus.com/video/") === 0) {
        browser.tabs.executeScript({
            file: "content.js",
            runAt: "document_end"
        });

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
}

browser.webNavigation.onCompleted.addListener(onPageChanged);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageChanged);