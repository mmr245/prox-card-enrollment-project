// server/server.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Parse JSON and serve client
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));

// 2) CSV storage directory
const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Helpers
const safe = (s) => (s || "").trim().replace(/[^a-zA-Z0-9-_]/g, "_") || "untitled";
function uniqueCsvPath(base) {
  let i = 2;
  let p = path.join(DATA_DIR, `${base}.csv`);
  while (fs.existsSync(p)) p = path.join(DATA_DIR, `${base} (${i++}).csv`);
  return p;
}

// 3) Routes
app.post("/api/create-file", (req, res) => {
  const base = safe(req.body?.name);
  const csvPath = uniqueCsvPath(base);
  try {
    fs.writeFileSync(csvPath, "timestamp_iso,uid\n", { flag: "wx" });
    res.json({ ok: true, filename: path.basename(csvPath) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/api/tap", (req, res) => {
  const filename = safe(path.parse(req.body?.filename || "").name) + ".csv";
  const uid = String(req.body?.uid || "").trim();
  if (!uid) return res.status(400).json({ ok: false, error: "UID required." });

  const csvPath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ ok: false, error: "CSV not found. Create it first." });
  }
  try {
    fs.appendFileSync(csvPath, `${new Date().toISOString()},${uid}\n`, "utf8");
    res.json({ ok: true, filename });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 4) Start
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));