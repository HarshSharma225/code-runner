const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {
  const { code } = req.body;

  if (!code || code.trim() === "") {
    return res.status(400).json({ error: "No code provided" });
  }

  const tmpFile = path.join(os.tmpdir(), `code_${Date.now()}.py`);
  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  fs.writeFile(tmpFile, code, (writeErr) => {
    if (writeErr) {
      return res.status(500).json({ error: "Failed to save code file" });
    }

    const process = exec(
      `${pythonCmd} ${tmpFile}`,
      { timeout: 2000 },
      (err, stdout, stderr) => {
        fs.unlink(tmpFile, () => {});

        if (err) {
          if (err.killed || err.signal === "SIGTERM") {
            return res.status(200).json({
              output: null,
              error: "Execution timed out after 2 seconds. Check for infinite loops.",
              timedOut: true,
            });
          }

          if (err.message && err.message.includes("maxBuffer")) {
            return res.status(200).json({
              output: null,
              error: "Time Limit Exceeded (TLE)",
              timedOut: true,
            });
          }

          return res.status(200).json({
            output: null,
            error: stderr || err.message,
            timedOut: false,
          });
        }

        return res.status(200).json({
          output: stdout,
          error: null,
          timedOut: false,
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
