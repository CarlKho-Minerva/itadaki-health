(function () {
  var POLL_MS = 1800;
  var VISIBLE_MS = 3200;
  var state = {
    seenId: localStorage.getItem("itadaki:last-seen-log") || "",
    audioUnlocked: false,
    audioPrimed: false,
    audioContext: null,
    currentAudio: null,
    pollTimer: null,
    hideTimer: null,
  };

  function init() {
    document.addEventListener("click", armAndRefresh);
    document.addEventListener("keydown", onKeyDown);
    var button = document.getElementById("arm-button");
    if (button) button.addEventListener("click", armAndRefresh);
    pollLatest({ flashInitial: false });
    state.pollTimer = window.setInterval(function () {
      pollLatest({ flashInitial: false });
    }, POLL_MS);
  }

  function onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      armAndRefresh();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      pulseDemo();
    }
  }

  function armAndRefresh() {
    unlockAudio();
    pollLatest({ flashInitial: true });
  }

  function unlockAudio() {
    state.audioUnlocked = true;
    if (state.audioPrimed) return;
    state.audioPrimed = true;

    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      var context = state.audioContext || new AudioContext();
      state.audioContext = context;
      if (context.state === "suspended") context.resume();
      var source = context.createOscillator();
      var gain = context.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(context.destination);
      source.start(0);
      source.stop(context.currentTime + 0.02);
    } catch {
      // Audio unlock is a best-effort helper. The visual pulse still works.
    }
  }

  function pollLatest(options) {
    fetch("/api/logs?limit=1", { cache: "no-store" })
      .then(function (response) {
        return response.json();
      })
      .then(function (payload) {
        var log = payload.logs && payload.logs[0];
        if (!log || log.source === "demo-seed") return;

        var isNew = log.id && log.id !== state.seenId;
        if (isNew || options.flashInitial) {
          state.seenId = log.id || String(Date.now());
          localStorage.setItem("itadaki:last-seen-log", state.seenId);
          flashLog(log);
        }
      })
      .catch(function () {
        // Keep the HUD blank if sync fails. The phone app still has the log.
      });
  }

  function pulseDemo() {
    unlockAudio();
    flashLog({
      id: "demo-" + Date.now(),
      mealName: "Demo meal",
      calories: 705,
      protein: 39,
      carbs: 74,
      fat: 29,
      audioBrief: "Logged 705 calories. Your five meal trend looks steady.",
    });
  }

  function flashLog(log) {
    window.clearTimeout(state.hideTimer);
    setText("calories", roundOrDash(log.calories, ""));
    setText("protein", roundOrDash(log.protein, "g"));
    setText("carbs", roundOrDash(log.carbs, "g"));
    setText("fat", roundOrDash(log.fat, "g"));
    setText("trend", trendText(log));
    showPulse();
    playSpeech(speechText(log));
    state.hideTimer = window.setTimeout(hidePulse, VISIBLE_MS);
  }

  function showPulse() {
    var idle = document.getElementById("idle");
    var pulse = document.getElementById("pulse");
    if (!pulse || !idle) return;

    pulse.classList.remove("hidden", "fading");
    idle.classList.add("hidden");
    // Restart CSS animation even when logs arrive close together.
    void pulse.offsetWidth;
    pulse.classList.add("active", "visible");
  }

  function hidePulse() {
    var idle = document.getElementById("idle");
    var pulse = document.getElementById("pulse");
    if (!pulse || !idle) return;

    pulse.classList.remove("visible");
    pulse.classList.add("fading");
    window.setTimeout(function () {
      pulse.classList.add("hidden");
      pulse.classList.remove("active", "fading");
      idle.classList.remove("hidden");
      idle.classList.add("active");
    }, 540);
  }

  function playSpeech(text) {
    if (!text) return;
    fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text, language: "en" }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("TTS unavailable");
        return response.blob();
      })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        if (state.currentAudio) {
          state.currentAudio.pause();
          state.currentAudio = null;
        }
        var audio = new Audio(url);
        state.currentAudio = audio;
        audio.onended = function () {
          URL.revokeObjectURL(url);
        };
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            URL.revokeObjectURL(url);
          });
        }
      })
      .catch(function () {
        // Silent failure keeps the face display calm; the iOS app also speaks.
      });
  }

  function speechText(log) {
    if (log.audioBrief) return String(log.audioBrief).slice(0, 160);
    return "Logged " + roundOrDash(log.calories, "") + " calories. " + trendText(log);
  }

  function trendText(log) {
    var calories = Number(log && log.calories);
    if (Number.isFinite(calories) && calories >= 800) {
      return "Heavier meal. Review trend on phone.";
    }
    return "Five-meal trend saved.";
  }

  function roundOrDash(value, unit) {
    var number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return "--" + unit;
    return String(Math.round(number)) + unit;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  init();
})();
