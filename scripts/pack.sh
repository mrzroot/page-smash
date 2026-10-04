#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - << 'PY'
import shutil, zipfile
from pathlib import Path
root = Path(".").resolve()
items = ["background.js", "game.js", "game.css", "LICENSE", "README.md", "vendor", "icons"]
for name, manifest in (("chrome", "manifest.json"), ("firefox", "manifest.firefox.json")):
    dest = root / "dist" / name
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    for item in items:
        src = root / item
        target = dest / item
        if src.is_dir():
            shutil.copytree(src, target)
        else:
            shutil.copy2(src, target)
    shutil.copy2(root / manifest, dest / "manifest.json")
    zpath = root / "dist" / f"page-smash-{name}.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for p in dest.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(dest).as_posix())
    print(zpath.name, zpath.stat().st_size)
PY
