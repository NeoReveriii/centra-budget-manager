/* global document, localStorage */

(() => {
  try {
    const savedUi = JSON.parse(localStorage.getItem("centra-ui") || "null");
    if (savedUi?.state?.theme === "dark") {
      document.documentElement.classList.add("dark");
    }
    if (savedUi?.state?.highContrast === true) {
      document.documentElement.classList.add("high-contrast");
    }
  } catch {
    // The application store will restore the default theme.
  }
})();
