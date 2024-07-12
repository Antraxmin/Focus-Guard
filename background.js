chrome.runtime.onInstalled.addListener(function () {
  chrome.alarms.create("checkTime", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "checkTime") {
    checkTimeAndUpdateBlock();
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateAlarm") {
    checkTimeAndUpdateBlock();
  }
});

function checkTimeAndUpdateBlock() {
  chrome.storage.sync.get(
    ["startTime", "endTime", "isLocked"],
    function (data) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      let startMinutes = 0;
      let endMinutes = 1440;

      if (data.startTime) {
        const [startHours, startMins] = data.startTime.split(":").map(Number);
        startMinutes = startHours * 60 + startMins;
      }

      if (data.endTime) {
        const [endHours, endMins] = data.endTime.split(":").map(Number);
        endMinutes = endHours * 60 + endMins;
      }

      const shouldBlock =
        currentTime >= startMinutes && currentTime < endMinutes;

      if (shouldBlock !== data.isLocked) {
        chrome.storage.sync.set({ isLocked: shouldBlock });
      }
    }
  );
}

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  chrome.storage.sync.get(["blockedSites", "isLocked"], function (data) {
    if (data.isLocked && data.blockedSites) {
      var url = new URL(details.url);
      if (data.blockedSites.includes(url.hostname)) {
        chrome.tabs.update(details.tabId, { url: "blocked.html" });
      }
    }
  });
});
