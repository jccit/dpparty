import { browser } from "webextension-polyfill-ts";

function onPageChanged(e) {
    if (e.url.indexOf('/video/') > 0) {
        browser.tabs.executeScript({
            file: "content.js",
            runAt: "document_end"
        });

        browser.browserAction.setIcon({ path: { 38: "images/icon-38-active.png" }});
    } else {
        browser.browserAction.setIcon({ path: { 38: "images/icon-38.png" }});
    }
}

browser.webNavigation.onCompleted.addListener(onPageChanged);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageChanged);