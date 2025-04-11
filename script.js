const container = document.querySelector(".controls");
const output = document.getElementById("prompt-output");
const copyBtn = document.getElementById("copy-btn");
const randomizeBtn = document.getElementById("randomize-btn");
const tabButtons = document.querySelectorAll(".tab-button");
const toast = document.getElementById("toast");

let currentData = promptData; // Start with the default people data
let categories = Object.keys(currentData); // Default to people categories

const icons = {
  type: "ph-image",
  age: "ph-calendar",
  race: "ph-globe",
  subject: "ph-user", // Replaced gender with subject
  descriptor: "ph-smiley-sticker",
  action: "ph-sneaker-move",
  location: "ph-map-pin",
  clothing: "ph-t-shirt",
  clothingStyle: "ph-paint-brush", // New icon for clothingStyle
  style: "ph-paint-brush",
  lighting: "ph-sun",
  color: "ph-palette",
  visualFX: "ph-magic-wand",
  camera: "ph-camera",
  lens: "ph-eye",
  film: "ph-film-strip"
};

// Function to clear and reload controls
function loadControls(data) {
  container.innerHTML = ""; // Clear existing controls
  categories = Object.keys(data); // Update categories based on the current data

  categories.forEach((category) => {
    const control = document.createElement("div");
    control.classList.add("control");

    // Determine which categories are turned on by default
    if (
      (data === promptData &&
        [
          "type",
          "race",
          "subject",
          "descriptor",
          "lighting",
          "camera",
          "film"
        ].includes(category)) ||
      (data === illustrationsData &&
        ["type", "subject", "action"].includes(category))
    ) {
      control.classList.add("active");
    }

    const icon = document.createElement("i");
    icon.classList.add("ph", icons[category]);

    const label = document.createElement("label");
    label.htmlFor = category;
    label.textContent = category.charAt(0).toUpperCase() + category.slice(1);

    const select = document.createElement("select");
    select.id = `${category}-select`;
    select.addEventListener("change", () => {
      control.classList.add("active");
      updatePrompt();
    });
    select.disabled = !control.classList.contains("active");
    data[category].forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });

    const lockBtn = document.createElement("button");
    lockBtn.classList.add("lock-btn");
    lockBtn.innerHTML = '<i class="ph ph-lock"></i>';
    lockBtn.addEventListener("click", () => {
      lockBtn.classList.toggle("active");
    });

    const shuffleBtn = document.createElement("button");
    shuffleBtn.classList.add("shuffle-btn");
    shuffleBtn.innerHTML = '<i class="ph ph-shuffle"></i>';
    shuffleBtn.addEventListener("click", () => {
      if (!lockBtn.classList.contains("active")) {
        const options = data[category];
        const randomOption =
          options[Math.floor(Math.random() * options.length)];
        select.value = randomOption;
        control.classList.add("active");
        updatePrompt();
      }
    });

    control.appendChild(icon);
    control.appendChild(label);
    control.appendChild(select);
    control.appendChild(lockBtn);
    control.appendChild(shuffleBtn);

    control.addEventListener("click", (e) => {
      if (
        e.target.tagName !== "SELECT" &&
        e.target.tagName !== "BUTTON" &&
        e.target.tagName !== "I"
      ) {
        control.classList.toggle("active");
        select.disabled = !control.classList.contains("active");
        updatePrompt();
      }
    });

    container.appendChild(control);
  });

  updatePrompt(); // Ensure prompt is updated after loading controls
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const category = button.dataset.category;

    if (category === "people") {
      currentData = promptData;
    } else if (category === "illustrations") {
      currentData = illustrationsData;
    }

    loadControls(currentData);
  });
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(output.value);
  showToast();
});

randomizeBtn.addEventListener("click", () => {
  categories.forEach((category) => {
    const control = document.getElementById(`${category}-select`).parentElement;
    const select = document.getElementById(`${category}-select`);
    const lockBtn = control.querySelector(".lock-btn");
    if (
      control.classList.contains("active") &&
      !lockBtn.classList.contains("active")
    ) {
      const options = currentData[category];
      const randomOption = options[Math.floor(Math.random() * options.length)];
      select.value = randomOption;
    }
  });
  updatePrompt();
});

function updatePrompt() {
  let prompt = "";

  // Start with basic description
  const basicFields = ["type", "age", "race", "subject", "descriptor"];
  basicFields.forEach((category) => {
    const control = document.getElementById(`${category}-select`);
    if (control && control.parentElement.classList.contains("active")) {
      prompt += `${control.value} `;
    }
  });

  // Add action
  const actionControl = document.getElementById(`action-select`);
  if (
    actionControl &&
    actionControl.parentElement.classList.contains("active")
  ) {
    prompt += `${actionControl.value}, `;
  }

  // Add clothing and clothingStyle with "wearing" before both
  const clothingStyleControl = document.getElementById(`clothingStyle-select`);
  const clothingControl = document.getElementById(`clothing-select`);

  if (
    clothingControl &&
    clothingControl.parentElement.classList.contains("active")
  ) {
    prompt += `wearing `;
    if (
      clothingStyleControl &&
      clothingStyleControl.parentElement.classList.contains("active")
    ) {
      prompt += `${clothingStyleControl.value} `;
    }
    prompt += `${clothingControl.value}, `;
  }

  // Add location
  const locationControl = document.getElementById(`location-select`);
  if (
    locationControl &&
    locationControl.parentElement.classList.contains("active")
  ) {
    prompt += `in ${locationControl.value}, `;
  }

  // Add additional details like style, lighting, etc.
  const withCommas = [
    "style",
    "lighting",
    "color",
    "visualFX",
    "camera",
    "lens",
    "film"
  ];
  withCommas.forEach((category) => {
    const control = document.getElementById(`${category}-select`);
    if (control && control.parentElement.classList.contains("active")) {
      prompt += `${control.value}, `;
    }
  });

  // Trim any trailing comma and space
  output.value = prompt.trim().replace(/,\s*$/, "");
}

function showToast() {
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Load default controls for "Photos of People" on initial load
loadControls(promptData);