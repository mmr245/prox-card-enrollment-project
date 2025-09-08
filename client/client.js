(() => {
  const API_PREFIX = "/api"; //store file in data folder

  // UI elements
  const nameInput = document.getElementById("csvName");
  const createBtn = document.getElementById("createCsvBtn");
  const nameStatus = document.getElementById("nameStatus");
  const stepName = document.getElementById("step-name");
  const stepConfirm = document.getElementById("step-confirm");
  const stepTap = document.getElementById("step-tap");
  const currentCsv = document.getElementById("currentCsv");

  const scanInput = document.getElementById("scanInput");
  const saveTapBtn = document.getElementById("saveTapBtn");
  const message = document.getElementById("message");
  const tapCountEl = document.getElementById("tapCount");

  let filename = null;
  let tapCount = 0;

  function setStatus(el, text, type = "ok") {
    el.textContent = text || "";
    el.classList.remove("ok", "err");
    if (!text) return;
    el.classList.add(type === "ok" ? "ok" : "err");
  }

  async function createCsv() {
    const name = (nameInput.value || "").trim();
    if (!name) {
      setStatus(nameStatus, "Please enter a name for the CSV.", "err");
      return;
    }
    setStatus(nameStatus, "Creating file…", "ok");

    try {
      const res = await fetch(`${API_PREFIX}/create-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const data = await res.json();

      if (!data.ok) {
        setStatus(nameStatus, data.error || "Failed to create file.", "err");
        return;
      }

      filename = data.filename;
      currentCsv.textContent = filename;
      setStatus(nameStatus, `Created ${filename}`, "ok");

      stepConfirm.style.display = "";
      stepTap.style.display = "";
      scanInput.focus();
    } catch (err) {
      setStatus(nameStatus, err.message, "err");
    }
  }

  async function saveTap() {
    const uid = (scanInput.value || "").trim();
    if (!filename) {
      setStatus(message, "Create your CSV first.", "err");
      return;
    }
    if (!uid) {
      setStatus(message, "Scan or enter a card UID.", "err");
      return;
    }
    setStatus(message, "Saving…", "ok");

    try {
      const res = await fetch(`${API_PREFIX}/tap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, uid })
      });
      const data = await res.json();

      if (!data.ok) {
        setStatus(message, data.error || "Failed to save tap.", "err");
        return;
      }

      tapCount += 1;
      tapCountEl.textContent = String(tapCount);
      setStatus(message, `Saved UID to ${data.filename}`, "ok");
      scanInput.value = "";
      scanInput.focus();
    } catch (err) {
      setStatus(message, err.message, "err");
    }
  }

  // Wire up UI
  createBtn.addEventListener("click", createCsv);
  nameInput.addEventListener("keydown", (e) => e.key === "Enter" && createCsv());

  saveTapBtn.addEventListener("click", saveTap);
  scanInput.addEventListener("keydown", (e) => e.key === "Enter" && saveTap());
})();