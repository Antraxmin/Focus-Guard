document.addEventListener("DOMContentLoaded", function () {
  const siteInput = document.getElementById("siteInput");
  const addSiteButton = document.getElementById("addSite");
  const siteList = document.getElementById("siteList");
  const lockToggle = document.getElementById("lockToggle");

  chrome.storage.sync.get(["blockedSites", "isLocked"], function (data) {
    const blockedSites = data.blockedSites || [];
    const isLocked = data.isLocked || false;

    updateSiteList(blockedSites);
    updateLockButton(isLocked);
  });

  addSiteButton.addEventListener("click", function () {
    const site = siteInput.value.trim();
    if (site) {
      chrome.storage.sync.get("blockedSites", function (data) {
        const blockedSites = data.blockedSites || [];
        blockedSites.push(site);
        chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
          updateSiteList(blockedSites);
          siteInput.value = "";
        });
      });
    }
  });

  lockToggle.addEventListener("click", function () {
    chrome.storage.sync.get("isLocked", function (data) {
      const isLocked = !data.isLocked;
      chrome.storage.sync.set({ isLocked: isLocked }, function () {
        updateLockButton(isLocked);
      });
    });
  });

  function updateSiteList(sites) {
    siteList.innerHTML = "";
    sites.forEach(function (site) {
      const li = document.createElement("li");
      li.textContent = site;
      siteList.appendChild(li);
    });
  }

  function updateLockButton(isLocked) {
    lockToggle.textContent = isLocked ? "Unlock" : "Lock";
    lockToggle.classList.toggle("locked", isLocked);
  }
});
