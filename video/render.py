"""Render video/film.html to MP4, frame by frame (deterministic, no screen recording).

Usage (with the local server running on :8000):
    python video/render.py intro 24 out/intro.mp4
    python video/render.py outro 8 out/outro.mp4

Each frame: seek every CSS animation to t, screenshot with headless Chrome (CDP), then encode
with the ffmpeg bundled in imageio-ffmpeg (H.264, yuv420p, 30 fps, 1920x1080).
"""
import base64, json, os, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path

import imageio_ffmpeg
import websocket

part, seconds, out = sys.argv[1], float(sys.argv[2]), Path(sys.argv[3])
FPS, W, H = 30, 1920, 1080
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
page = (Path(__file__).parent / {"film60": "film60.html", "film120": "film120.html"}.get(part, "film.html")).resolve().as_uri() + f"?part={part}"

port, prof = 9344, tempfile.mkdtemp()
chrome = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={port}", f"--user-data-dir={prof}",
                           "--hide-scrollbars", "--remote-allow-origins=*", "--allow-file-access-from-files",
                           f"--window-size={W},{H}", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
frames = Path(tempfile.mkdtemp())
try:
    for _ in range(50):
        try:
            tab = next(t for t in json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json")) if t["type"] == "page"); break
        except Exception:
            time.sleep(0.2)
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], max_size=None)
    n = [0]

    def call(method, **params):
        n[0] += 1
        ws.send(json.dumps({"id": n[0], "method": method, "params": params}))
        while True:
            m = json.loads(ws.recv())
            if m.get("id") == n[0]:
                return m.get("result", m)

    call("Emulation.setDeviceMetricsOverride", width=W, height=H, deviceScaleFactor=1, mobile=False)
    call("Page.enable"); call("Runtime.enable")
    call("Page.navigate", url=page)
    for _ in range(100):
        time.sleep(0.2)
        if call("Runtime.evaluate", expression="window.__ready === true", returnByValue=True)["result"].get("value"):
            break
    else:
        title = call("Runtime.evaluate", expression="document.title", returnByValue=True)["result"].get("value")
        sys.exit(f"page not ready: {title}")
    total = int(seconds * FPS)
    for i in range(total):
        call("Runtime.evaluate", expression=f"seek({i / FPS:.4f})")
        shot = call("Page.captureScreenshot", format="jpeg", quality=93)
        (frames / f"f_{i:05d}.jpg").write_bytes(base64.b64decode(shot["data"]))
        if i % 60 == 0:
            print(f"{part}: frame {i}/{total}", flush=True)
finally:
    chrome.kill()

out.parent.mkdir(parents=True, exist_ok=True)
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-framerate", str(FPS),
                "-i", str(frames / "f_%05d.jpg"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
                "-preset", "slow", "-movflags", "+faststart", str(out)], check=True)
print("wrote", out, f"{out.stat().st_size / 1e6:.1f} MB")
