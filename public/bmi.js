// Personal BMI Calculator
(function () {
  const form = document.getElementById("bmiForm");
  const weightInput = document.getElementById("weight");
  const heightInput = document.getElementById("height");
  const weightError = document.getElementById("weightError");
  const heightError = document.getElementById("heightError");
  const resultEl = document.getElementById("result");
  const resetBtn = document.getElementById("resetBtn");
  const themeToggle = document.getElementById("themeToggle");

  // Restore theme preference
  if (localStorage.getItem("bmi-theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
    themeToggle.setAttribute("aria-pressed", "true");
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    localStorage.setItem("bmi-theme", isDark ? "dark" : "light");
  });

  // Determine BMI category, color class, and health message
  function classify(bmi) {
    if (bmi < 18.5) {
      return {
        category: "Underweight",
        cls: "underweight",
        message: "Consider a balanced diet with more nutrients to reach a healthy weight.",
      };
    }
    if (bmi < 25) {
      return {
        category: "Normal Weight",
        cls: "normal",
        message: "Great job! Keep maintaining your healthy lifestyle.",
      };
    }
    if (bmi < 30) {
      return {
        category: "Overweight",
        cls: "overweight",
        message: "Consider regular exercise and a balanced diet to improve your health.",
      };
    }
    return {
      category: "Obese",
      cls: "obese",
      message: "It's recommended to consult a healthcare professional for guidance.",
    };
  }

  // Validate single input and manage aria-invalid
  function validate(inputEl, errorEl, label) {
    const value = inputEl.value;
    if (value === "" || isNaN(value)) {
      errorEl.textContent = `Please enter a valid ${label}.`;
      inputEl.setAttribute("aria-invalid", "true");
      return false;
    }
    const num = parseFloat(value);
    if (num <= 0) {
      errorEl.textContent = `${label} must be greater than zero.`;
      inputEl.setAttribute("aria-invalid", "true");
      return false;
    }
    errorEl.textContent = "";
    inputEl.setAttribute("aria-invalid", "false");
    return true;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const wOk = validate(weightInput, weightError, "weight");
    const hOk = validate(heightInput, heightError, "height");
    if (!wOk || !hOk) return;

    const weight = parseFloat(weightInput.value);
    const heightM = parseFloat(heightInput.value) / 100;
    const bmi = weight / (heightM * heightM);
    const rounded = bmi.toFixed(2);
    const info = classify(bmi);

    resultEl.className = "result"; // reset
    // Force reflow to re-trigger animation
    void resultEl.offsetWidth;
    resultEl.classList.add("show", info.cls);
    resultEl.innerHTML = `
      <div class="bmi-value">${rounded}</div>
      <div class="bmi-category">${info.category}</div>
      <div class="bmi-message">${info.message}</div>
    `;
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    weightError.textContent = "";
    heightError.textContent = "";
    resultEl.className = "result";
    resultEl.innerHTML = "";
  });
})();