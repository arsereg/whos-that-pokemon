"""Obscure 151 Pokémon PNGs by replacing every non-transparent pixel with
opaque black, leaving fully transparent pixels untouched. Vectorised with
NumPy so all 151 images process in a couple of seconds."""

from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).parent
DST = ROOT / "obscured"
DST.mkdir(exist_ok=True)

COUNT = 151
written = 0

for n in range(1, COUNT + 1):
    src_path = ROOT / f"{n}.png"
    img = cv2.imread(str(src_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(src_path)
    if img.shape[2] != 4:
        raise ValueError(f"{src_path} is not RGBA (got shape {img.shape})")

    h, w = img.shape[:2]
    out = np.zeros((h, w, 4), dtype=np.uint8)
    mask = img[:, :, 3] > 0
    out[mask] = (0, 0, 0, 255)  # BGRA: black, fully opaque

    dst_path = DST / f"{n}.png"
    if not cv2.imwrite(str(dst_path), out):
        raise IOError(f"failed to write {dst_path}")
    written += 1

print(f"Obscured {written} images → {DST}")
