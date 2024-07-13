document.addEventListener("DOMContentLoaded", function () {
  const siteInput = document.getElementById("siteInput");
  const addSiteButton = document.getElementById("addSite");
  const siteList = document.getElementById("siteList");
  const lockToggle = document.getElementById("lockToggle");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");

  chrome.storage.sync.get(
    ["blockedSites", "isLocked", "startTime", "endTime"],
    function (data) {
      const blockedSites = data.blockedSites || [];
      const isLocked = data.isLocked || false;
      const startTime = data.startTime || "";
      const endTime = data.endTime || "";

      console.log("Initial state:", {
        blockedSites,
        isLocked,
        startTime,
        endTime,
      });

      updateSiteList(blockedSites);
      updateLockButton(isLocked);
      startTimeInput.value = startTime;
      endTimeInput.value = endTime;
    }
  );

  addSiteButton.addEventListener("click", function () {
    const site = siteInput.value.trim();
    if (site) {
      chrome.storage.sync.get("blockedSites", function (data) {
        const blockedSites = data.blockedSites || [];
        blockedSites.push(site);
        chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
          console.log("Site added:", site);
          updateSiteList(blockedSites);
          siteInput.value = "";
        });
      });
    }
  });

  lockToggle.addEventListener("click", function () {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (!startTime || !endTime) {
      alert("Please set both start and end times.");
      return;
    }

    chrome.storage.sync.get("isLocked", function (data) {
      const isLocked = !data.isLocked;
      chrome.storage.sync.set(
        {
          isLocked: isLocked,
          startTime: startTime,
          endTime: endTime,
        },
        function () {
          console.log("Lock state changed:", isLocked);
          console.log("Time set:", { startTime, endTime });
          updateLockButton(isLocked);
          chrome.runtime.sendMessage(
            { action: "updateAlarm", startTime: startTime, endTime: endTime },
            function (response) {
              console.log("Background script response:", response);
            }
          );
        }
      );
    });
  });

  function updateSiteList(sites) {
    siteList.innerHTML = "";
    sites.forEach(function (site) {
      const li = document.createElement("li");
      li.textContent = site;
      siteList.appendChild(li);
    });
    console.log("Site list updated:", sites);
  }

  function updateLockButton(isLocked) {
    lockToggle.textContent = isLocked ? "Unlock" : "Lock";
    lockToggle.classList.toggle("locked", isLocked);
    console.log("Lock button updated:", isLocked);
  }
});
