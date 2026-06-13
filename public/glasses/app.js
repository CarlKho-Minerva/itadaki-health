(function () {
  var state = {
    transcript: "",
    triggered: false,
    imageData: null,
    analysis: {
      mealName: "Sweetgreen Harvest Bowl",
      nutrition: { calories: { value: 705 } },
    },
    lastRow: "",
  };

  function init() {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    var input = document.getElementById("photo-input");
    input.addEventListener("change", onPhoto);
    focusFirst();
    loadRecent(true);
  }

  function onClick(event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    act(target.getAttribute("data-action"));
  }

  function onKeyDown(event) {
    if (event.key === "Enter") {
      var active = document.activeElement;
      if (active && active.getAttribute("data-action")) {
        event.preventDefault();
        act(active.getAttribute("data-action"));
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      show("listen");
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  function act(action) {
    if (action === "listen") return listen();
    if (action === "recent") return loadRecent();
    if (action === "trigger") return manualTrigger();
    if (action === "photo") return document.getElementById("photo-input").click();
    if (action === "sample") return analyze();
    if (action === "log") return log();
    if (action === "restart") return restart();
  }

  function show(id) {
    Array.prototype.forEach.call(document.querySelectorAll(".screen"), function (screen) {
      screen.classList.toggle("hidden", screen.id !== id);
      screen.classList.toggle("active", screen.id === id);
    });
    window.setTimeout(focusFirst, 20);
  }

  function focusFirst() {
    var first = document.querySelector(".screen.active .focusable");
    if (first) first.focus();
  }

  function moveFocus(delta) {
    var items = Array.prototype.slice.call(
      document.querySelectorAll(".screen.active .focusable"),
    );
    if (!items.length) return;
    var index = items.indexOf(document.activeElement);
    var next = (Math.max(index, 0) + delta + items.length) % items.length;
    items[next].focus();
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function listen() {
    setText("listen-status", "MRBD Web Apps do not expose mic yet. Use iPhone.");
  }

  function loadRecent(stayHome) {
    setText("listen-status", "Syncing latest log...");
    fetch("/api/logs?limit=1")
      .then(function (response) {
        return response.json();
      })
      .then(function (payload) {
        var log = payload.logs && payload.logs[0];
        if (!log) {
          setText("home-calories", "--");
          setText("recent-calories", "--");
          setText("recent-meal", "No synced meal yet.");
          setText("listen-status", "No synced meal yet.");
          if (!stayHome) show("recent");
          return;
        }
        setText("home-calories", String(log.calories || "--"));
        setText("listen-status", log.mealName || "Latest meal");
        setText("recent-calories", String(log.calories || "--"));
        setText("recent-meal", log.mealName || "Latest meal");
        if (!stayHome) show("recent");
      })
      .catch(function () {
        setText("home-calories", "--");
        setText("listen-status", "Sync failed. Use iPhone app.");
        setText("recent-calories", "--");
        setText("recent-meal", "Sync failed. Try again.");
        if (!stayHome) show("recent");
      });
  }

  function manualTrigger() {
    state.transcript = "Itadakimasu";
    state.triggered = true;
    state.analysis = {
      mealName: "Demo meal",
      nutrition: { calories: { value: 705 } },
    };
    renderResult();
    show("result");
  }

  function onPhoto(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      state.imageData = String(reader.result);
      analyze();
    };
    reader.readAsDataURL(file);
  }

  function analyze() {
    show("loading");
    fetch("/api/analyze-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId: "sweetgreen-harvest",
        ritual: state.transcript || "itadakimasu",
        imageData: state.imageData,
        mealText: "Meta Ray-Ban minimal UI. Return a reliable calories estimate.",
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (payload) {
        state.analysis = payload.analysis || state.analysis;
        renderResult();
        show("result");
      })
      .catch(function () {
        renderResult();
        show("result");
      });
  }

  function renderResult() {
    var calories =
      state.analysis &&
      state.analysis.nutrition &&
      state.analysis.nutrition.calories &&
      state.analysis.nutrition.calories.value;
    setText("calories", calories || "705");
    setText("meal-name", state.analysis.mealName || "Estimated meal");
  }

  function log() {
    var calories = state.analysis.nutrition.calories.value;
    fetch("/api/log-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "meta-glasses",
        transcript: state.transcript,
        triggered: state.triggered,
        mealName: state.analysis.mealName,
        calories: calories,
        imageLabel: state.imageData ? "glasses-photo" : "sample-image",
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (payload) {
        state.lastRow = payload.csvRow || state.analysis.mealName + "," + calories;
        localStorage.setItem("itadaki:last-row", state.lastRow);
        setText("saved-row", state.lastRow);
        show("saved");
      })
      .catch(function () {
        state.lastRow = state.analysis.mealName + "," + calories;
        localStorage.setItem("itadaki:last-row", state.lastRow);
        setText("saved-row", state.lastRow);
        show("saved");
      });
  }

  function restart() {
    state.imageData = null;
    state.transcript = "";
    state.triggered = false;
    setText("listen-status", "Capture with the iPhone DAT companion.");
    loadRecent(true);
    show("listen");
  }

  init();
})();
