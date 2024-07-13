function checkTimeAndUpdateBlock() {
  chrome.storage.sync.get(
    ["startTime", "endTime", "isLocked", "blockedSites"],
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

      let shouldBlock;
      if (startMinutes < endMinutes) {
        shouldBlock = currentTime >= startMinutes && currentTime < endMinutes;
      } else {
        shouldBlock = currentTime >= startMinutes || currentTime < endMinutes;
      }

      console.log(
        "Current time:",
        currentTime,
        "Start:",
        startMinutes,
        "End:",
        endMinutes,
        "Should block:",
        shouldBlock,
        "Is locked:",
        data.isLocked
      );

      // 차단 상태가 변경되었을 때만 storage 업데이트
      if (shouldBlock !== data.isLocked) {
        chrome.storage.sync.set({ isLocked: shouldBlock }, function () {
          console.log("Updated isLocked to:", shouldBlock);
        });
      }
    }
  );
}

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  chrome.storage.sync.get(
    ["blockedSites", "isLocked", "startTime", "endTime"],
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

      let shouldBlock;
      if (startMinutes < endMinutes) {
        shouldBlock = currentTime >= startMinutes && currentTime < endMinutes;
      } else {
        shouldBlock = currentTime >= startMinutes || currentTime < endMinutes;
      }

      if (shouldBlock && data.blockedSites && data.blockedSites.length > 0) {
        var url = new URL(details.url);
        if (data.blockedSites.some((site) => url.hostname.includes(site))) {
          console.log("Blocking site:", url.hostname);
          chrome.tabs.update(details.tabId, { url: "blocked/blocked.html" });
        }
      }
    }
  );
});
