function onPageChanged(e) {
    if (e.url.indexOf('/video/') > 0) {
        browser.tabs.executeScript({
            file: "extension.js"
        });
    }
}

browser.webNavigation.onCompleted.addListener(onPageChanged);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageChanged);