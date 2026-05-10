import React, { useState } from "react";
import "./App.css";

const DEFAULT_CODE = `# Write your Python code here
print("Hello Empower")
`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput(null);
    setError(null);
    setTimedOut(false);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.timedOut) {
        setTimedOut(true);
        setError(data.error);
      } else if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.output);
      }
    } catch (err) {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCode(DEFAULT_CODE);
    setOutput(null);
    setError(null);
    setTimedOut(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-dot" />
          <h1 className="title">PyRunner</h1>
        </div>
        <span className="badge">Python 3</span>
      </header>

      <main className="main">
        <section className="editor-section">
          <div className="section-label">
            <span className="dot green" />
            editor
          </div>
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Write your Python code here..."
          />
          <div className="button-row">
            <button
              className="btn run-btn"
              onClick={runCode}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Running...
                </>
              ) : (
                <>
                  <span className="play-icon">▶</span>
                  Run Code
                </>
              )}
            </button>
            <button className="btn clear-btn" onClick={clearAll}>
              Clear
            </button>
          </div>
        </section>

        <section className="output-section">
          <div className="section-label">
            <span className={`dot ${error ? "red" : "blue"}`} />
            output
          </div>

          <div className="output-box">
            {loading && (
              <div className="status-msg loading-msg">
                <span className="spinner dark" />
                Executing your code...
              </div>
            )}

            {!loading && output !== null && (
              <pre className="output-text success">{output || "(no output)"}</pre>
            )}

            {!loading && error && (
              <div className="error-block">
                {timedOut && (
                  <div className="timeout-badge">⏱ TIMEOUT — 2s limit reached</div>
                )}
                <pre className="output-text error-text">{error}</pre>
              </div>
            )}

            {!loading && output === null && !error && (
              <p className="placeholder-msg">
                Hit <strong>Run Code</strong> to see output here.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
