(function () {
  var state = {
    screen: "home",
    analysis: null,
  };

  var fallbackAnalysis = {
    source: "mock",
    mealName: "Sweetgreen Harvest Bowl",
    nutrition: {
      calories: { value: 705, unit: "kcal" },
      protein: { value: 39, unit: "g" },
      sodium: { value: 980, unit: "mg" },
    },
    clinicalContext: {
      flags: ["Balanced protein for coding block"],
      whyItMatters:
        "For this synthetic profile, track repeated grain-heavy lunches against A1C and afternoon energy.",
    },
    clinicianQuestion:
      "If my A1C is elevated but fasting glucose is normal, should I track post-meal glucose or meal timing?",
    timelineEntry:
      "Intentional food log captured after itadakimasu; saved with uncertainty and one clinician question.",
  };

  function init() {
    var saved = localStorage.getItem("itadaki:last-analysis");
    if (saved) {
      try {
        state.analysis = JSON.parse(saved);
    } catch {
        state.analysis = fallbackAnalysis;
      }
    } else {
      state.analysis = fallbackAnalysis;
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    renderAnalysis();
    focusFirst();
  }

  function onClick(event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    handleAction(target.getAttribute("data-action"));
  }

  function onKeyDown(event) {
    if (event.key === "Enter") {
      var active = document.activeElement;
      if (active && active.getAttribute("data-action")) {
        event.preventDefault();
        handleAction(active.getAttribute("data-action"));
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      navigate("home");
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.key) >= 0) {
      event.preventDefault();
      moveFocus(event.key);
    }
  }

  function handleAction(action) {
    switch (action) {
      case "analyze":
        analyzeMeal();
        break;
      case "skip":
        state.analysis = {
          source: "mock",
          mealName: "Skipped",
          nutrition: fallbackAnalysis.nutrition,
          clinicalContext: {
            flags: ["No food data stored"],
            whyItMatters: "User saw food but did not consent to logging it.",
          },
          clinicianQuestion: "No clinician question generated.",
          timelineEntry: "Meal skipped. No health timeline event stored.",
        };
        saveAnalysis();
        renderAnalysis();
        navigate("saved");
        break;
      case "manual":
        state.analysis = fallbackAnalysis;
        renderAnalysis();
        navigate("result");
        break;
      case "save":
        saveAnalysis();
        navigate("saved");
        break;
      case "ask":
        navigate("question");
        break;
      case "back":
      case "home":
        navigate("home");
        break;
      default:
        navigate("home");
    }
  }

  function navigate(screenId) {
    state.screen = screenId;
    Array.prototype.forEach.call(document.querySelectorAll(".screen"), function (screen) {
      screen.classList.toggle("hidden", screen.id !== screenId);
      screen.classList.toggle("active", screen.id === screenId);
    });
    window.setTimeout(focusFirst, 30);
  }

  function focusFirst() {
    var focusable = getFocusables();
    if (focusable[0]) focusable[0].focus();
  }

  function getFocusables() {
    return Array.prototype.slice.call(
      document.querySelectorAll(".screen.active .focusable"),
    );
  }

  function moveFocus(key) {
    var focusable = getFocusables();
    if (!focusable.length) return;

    var index = focusable.indexOf(document.activeElement);
    if (index < 0) index = 0;

    var delta = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
    var next = (index + delta + focusable.length) % focusable.length;
    focusable[next].focus();
  }

  function analyzeMeal() {
    navigate("loading");
    fetch("/api/analyze-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId: "sweetgreen-harvest",
        ritual: "itadakimasu",
        mealText: "Meta Display Web App quick analysis.",
      }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("analysis failed");
        return response.json();
      })
      .then(function (payload) {
        state.analysis = payload.analysis || fallbackAnalysis;
        saveAnalysis();
        renderAnalysis();
        navigate("result");
      })
      .catch(function () {
        state.analysis = fallbackAnalysis;
        saveAnalysis();
        renderAnalysis();
        navigate("result");
      });
  }

  function saveAnalysis() {
    localStorage.setItem("itadaki:last-analysis", JSON.stringify(state.analysis));
  }

  function renderAnalysis() {
    var analysis = state.analysis || fallbackAnalysis;
    var nutrition = analysis.nutrition || fallbackAnalysis.nutrition;
    var clinical = analysis.clinicalContext || fallbackAnalysis.clinicalContext;

    setText("meal-name", analysis.mealName || "Meal");
    setText("source-label", analysis.source === "xai" ? "Grok analysis" : "Demo mode");
    setText(
      "metric-line",
      nutrition.calories.value + " " + nutrition.calories.unit,
    );
    setText("context-line", clinical.flags ? clinical.flags[0] : clinical.whyItMatters);
    setText("protein", nutrition.protein.value + nutrition.protein.unit);
    setText("sodium", nutrition.sodium.value + nutrition.sodium.unit);
    setText("clinician-question", analysis.clinicianQuestion);
    setText("saved-text", analysis.timelineEntry);
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  init();
})();
