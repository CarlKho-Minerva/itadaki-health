(function () {
  var state = {
    transcript: "",
    triggered: false,
    imageData: null,
    analysis: {
      mealName: "Sweetgreen Harvest Bowl",
      nutrition: {
        calories: { value: 705 },
        protein: { value: 39 },
        carbs: { value: 74 },
        fat: { value: 29 },
      },
    },
    latestLog: null,
    idleTimer: null,
    breakdownTimer: null,
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

    if (event.key === "ArrowRight" && activeScreenId() === "listen" && state.latestLog) {
      event.preventDefault();
      showBreakdown();
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
    window.clearTimeout(state.breakdownTimer);
    Array.prototype.forEach.call(document.querySelectorAll(".screen"), function (screen) {
      screen.classList.toggle("hidden", screen.id !== id);
      screen.classList.toggle("active", screen.id === id);
      screen.classList.remove("flash");
    });
    var active = document.getElementById(id);
    if (active) active.classList.add("flash");
    window.setTimeout(focusFirst, 20);
  }

  function activeScreenId() {
    var active = document.querySelector(".screen.active");
    return active ? active.id : "";
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

  function updateDimTimer() {
    window.clearTimeout(state.idleTimer);
    document.body.classList.remove("dimmed");
    state.idleTimer = window.setTimeout(function () {
      document.body.classList.add("dimmed");
    }, 4200);
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
          state.latestLog = null;
          setText("home-calories", "--");
          setText("recent-calories", "--");
          setText("recent-meal", "No synced meal yet.");
          setText("listen-status", "No synced meal yet.");
          if (!stayHome) show("recent");
          return;
        }
        state.latestLog = log;
        setText("home-calories", String(log.calories || "--"));
        setText("listen-status", log.mealName || "Latest meal");
        setText("protein", valueWithUnit(log.protein, "g"));
        setText("carbs", valueWithUnit(log.carbs, "g"));
        setText("fat", valueWithUnit(log.fat, "g"));
        setText("trend", trendText(log));
        setText("recent-calories", String(log.calories || "--"));
        setText("recent-meal", log.mealName || "Latest meal");
        updateDimTimer();
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
      nutrition: {
        calories: { value: 705 },
        protein: { value: 39 },
        carbs: { value: 74 },
        fat: { value: 29 },
      },
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
    setText("protein", valueWithUnit(metricValue("protein"), "g"));
    setText("carbs", valueWithUnit(metricValue("carbs"), "g"));
    setText("fat", valueWithUnit(metricValue("fat"), "g"));
    setText("trend", "Five-meal trend saved on phone.");
    updateDimTimer();
  }

  function metricValue(key) {
    return (
      state.analysis &&
      state.analysis.nutrition &&
      state.analysis.nutrition[key] &&
      state.analysis.nutrition[key].value
    );
  }

  function valueWithUnit(value, unit) {
    var number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return "--" + unit;
    return Math.round(number) + unit;
  }

  function trendText(log) {
    var calories = Number(log && log.calories);
    if (Number.isFinite(calories) && calories >= 800) {
      return "Heavier meal. Review trend on phone.";
    }
    return "Five-meal trend saved on phone.";
  }

  function showBreakdown() {
    show("breakdown");
    state.breakdownTimer = window.setTimeout(function () {
      show("listen");
      updateDimTimer();
    }, 3000);
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
        state.latestLog = payload.log || {
          mealName: state.analysis.mealName,
          calories: calories,
          protein: metricValue("protein"),
          carbs: metricValue("carbs"),
          fat: metricValue("fat"),
        };
        localStorage.setItem("itadaki:last-row", state.lastRow);
        setText("saved-row", state.lastRow);
        show("saved");
      })
      .catch(function () {
        state.lastRow = state.analysis.mealName + "," + calories;
        state.latestLog = {
          mealName: state.analysis.mealName,
          calories: calories,
          protein: metricValue("protein"),
          carbs: metricValue("carbs"),
          fat: metricValue("fat"),
        };
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
