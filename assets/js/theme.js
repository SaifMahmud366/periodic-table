/*
 * Elementum — theme controller
 * Applies a saved theme before first paint, then keeps the switcher in sync.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "elementum-theme";
  var THEMES = ["light", "dark", "cute", "professional"];
  var THEME_LABELS = {
    light: "Daylight",
    dark: "Dark",
    cute: "Cute & Cozy",
    professional: "Professional"
  };
  var THEME_COLORS = {
    light: "#f5f7fb",
    dark: "#070b14",
    cute: "#fff8f4",
    professional: "#f4f2ed"
  };

  var root = document.documentElement;
  var currentTheme = "light";
  var hasSavedTheme = false;

  function isValidTheme(value) {
    return THEMES.indexOf(value) !== -1;
  }

  function readSavedTheme() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      hasSavedTheme = value !== null;
      return isValidTheme(value) ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
      hasSavedTheme = true;
    } catch (error) {
      /* Storage can be unavailable in private or restricted contexts. */
    }
  }

  function syncThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", THEME_COLORS[theme]);
    }
  }

  function updateSwitcher(theme, announce) {
    var buttons = document.querySelectorAll("[data-theme-value]");

    Array.prototype.forEach.call(buttons, function (button) {
      var isActive = button.getAttribute("data-theme-value") === theme;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    var status = document.getElementById("theme-status");
    if (status && announce) {
      status.textContent = THEME_LABELS[theme] + " theme applied.";
    }
  }

  function applyTheme(theme, options) {
    var settings = options || {};
    if (!isValidTheme(theme)) {
      return;
    }

    currentTheme = theme;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    syncThemeColor(theme);
    updateSwitcher(theme, Boolean(settings.announce));

    if (settings.persist) {
      saveTheme(theme);
    }

    if (settings.dispatch !== false) {
      document.dispatchEvent(
        new CustomEvent("elementum:themechange", {
          detail: { theme: theme }
        })
      );
    }
  }

  function setupSwitcher() {
    var buttons = document.querySelectorAll("[data-theme-value]");

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        var theme = button.getAttribute("data-theme-value");
        applyTheme(theme, { persist: true, announce: true });
      });
    });

    updateSwitcher(currentTheme, false);
  }

  var savedTheme = readSavedTheme();
  var prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var initialTheme = savedTheme || (prefersDark ? "dark" : "light");

  applyTheme(initialTheme, { dispatch: false });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupSwitcher);
  } else {
    setupSwitcher();
  }

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY && isValidTheme(event.newValue)) {
      applyTheme(event.newValue, { announce: true });
    }
  });

  if (window.matchMedia) {
    var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var handleSystemChange = function (event) {
      if (!hasSavedTheme) {
        applyTheme(event.matches ? "dark" : "light", { dispatch: false });
      }
    };

    if (typeof darkQuery.addEventListener === "function") {
      darkQuery.addEventListener("change", handleSystemChange);
    } else if (typeof darkQuery.addListener === "function") {
      darkQuery.addListener(handleSystemChange);
    }
  }

  window.ElementumTheme = {
    get: function () {
      return currentTheme;
    },
    set: function (theme) {
      applyTheme(theme, { persist: true, announce: true });
    }
  };
})();
