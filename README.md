# Python Code Runner

A simple full-stack app where you can write Python code in the browser, click **Run**, and see the real output — including a clean timeout error for infinite loops.

---

## Tech Stack

- **Frontend:** React (Create React App)
- **Backend:** Node.js + Express

---

## How to Run Locally

### Requirements

- Node.js (v16+)
- Python 3 installed and available as `python3` in your terminal

---

### Step 1 — Start the Backend

```bash
cd backend
npm install
node server.js
```

The backend will start at `http://localhost:5000`.

---

### Step 2 — Start the Frontend

Open a new terminal tab:

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## Test Cases

### 1. Success

Paste this in the editor and click Run:

```python
print("Hello Empower")
```

Expected output: `Hello Empower`

---

### 2. Timeout

Paste this and click Run:

```python
while True:
    pass
```

Expected: A timeout error after 2 seconds. The server does not crash.

---

## Security Risks in the Current Implementation

The current prototype works for local/demo use, but has these risks:

1. **Arbitrary code execution** — Any Python code the user types is run directly on the server. Someone could run `os.system("rm -rf /")` or read sensitive files from the filesystem.

2. **No resource limits** — Even with a 2-second time limit, code can use a lot of RAM or CPU within that window (e.g., allocating a huge list).

3. **No rate limiting** — Anyone can spam the `/run` endpoint repeatedly, keeping the server busy.

4. **Temp file cleanup on failure** — If the server crashes mid-execution, temp `.py` files might not get deleted.

5. **Network access** — Python scripts can make outbound HTTP requests or open sockets, which could be misused.

---

## How I Would Scale This for 500 Concurrent Users

If 500 students hit Run at the same time, the current setup would choke because every request spawns a new Python process on the same machine.

Here's how I'd redesign it:

1. **Job Queue (e.g., Bull + Redis):** Instead of running code immediately, push each request into a queue. Worker processes pick up jobs one at a time (or in controlled batches). This prevents the server from being overwhelmed.

2. **Separate Worker Servers:** Run the queue workers on dedicated machines, separate from the API server. The API just accepts requests and returns job IDs — workers do the heavy execution.

3. **Sandboxed Execution:** Each code run happens inside an isolated container or sandbox (like gVisor or Firecracker) so malicious code can't affect other users or the host system.

4. **Auto-scaling:** Use a cloud provider (AWS, GCP) to automatically spin up more worker instances when the queue grows too long.

5. **Result Storage:** Workers store output in Redis or a database. The frontend polls or uses WebSockets to fetch results when ready.

This way the API server stays responsive, execution is safe, and the system can handle spikes gracefully.
