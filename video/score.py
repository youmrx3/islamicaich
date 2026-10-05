"""Original score for the 60-second film, synthesized from scratch (no samples, no licences).

120 BPM, A minor (Am - F - C - G, one chord per 2-second bar). Scene changes at
6/14/24/32/40/48/54 s get a whoosh into an impact, matching film60.html.
Usage: python video/score.py out.wav
"""
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR, DUR, BPM = 44100, 60.0, 120
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
CUTS = [6, 14, 24, 32, 40, 48, 54]


def t_(d):
    return np.arange(int(d * SR)) / SR


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * (1 - pan) / 2 * 2 ** .5
    R[i:i + len(sig)] += sig * (1 + pan) / 2 * 2 ** .5


def filt(x, kind, f):
    return sosfilt(butter(2, f, kind, fs=SR, output="sos"), x)


def env(n, a, r, sustain=1.0):
    e = np.ones(n) * sustain
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, sustain, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def saw(f, d, detune=0.0):
    t = t_(d)
    ph = (f * 2 ** (detune / 1200) * t) % 1.0
    return 2 * ph - 1


# chords (Hz): Am, F, C, G
CH = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [261.63, 329.63, 392.0], [196.0, 246.94, 293.66]]
ROOT = [55.0, 43.65, 65.41, 49.0]


def chord_at(t):
    return int(t // 2) % 4


# ---------------------------------------------------------------- pad (whole film)
for bar in range(30):
    t0, c = bar * 2.0, CH[bar % 4]
    d = 2.6
    sig = sum(saw(f, d, dt) for f in c for dt in (-7, 7)) / 6
    sig = filt(sig, "lowpass", 1400 if 14 <= t0 < 48 else 900)
    lvl = .16 if t0 < 6 else .13 if t0 < 54 else .2
    add(sig * env(len(sig), .6, 1.2), t0, lvl, pan=-.3)
    add(sig * env(len(sig), .7, 1.2), t0 + .01, lvl, pan=.3)

# ---------------------------------------------------------------- drums
def kick(g=1.0):
    t = t_(.42)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) * g


def snare():
    t = t_(.25)
    n = filt(rng.standard_normal(len(t)), "bandpass", [900, 5200]) * np.exp(-t * 18)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * .5
    return (n + tone) * .55


def hat(d=.06):
    t = t_(d)
    return filt(rng.standard_normal(len(t)), "highpass", 7000) * np.exp(-t * 60) * .22


beats = np.arange(0, DUR, BEAT)
for b in beats:
    if 3 <= b < 6 and abs(b - round(b)) < 1e-6:                 # heartbeat in the intro
        add(kick(.7), b, .8)
    elif 6 <= b < 14 and int(round(b / BEAT)) % 4 == 0:          # half-time: the problem
        add(kick(), b, .9)
    elif 14 <= b < 54 and not (39.5 <= b < 40):                  # four on the floor
        add(kick(), b, .95)
    if 14 <= b < 54 and int(round(b / BEAT)) % 2 == 1 and not (39.5 <= b < 40):
        add(snare(), b, .9, pan=.05)
for h in np.arange(14, 54, BEAT / 2):
    if 39.5 <= h < 40:
        continue
    add(hat(), h, .9 if int(round(h / (BEAT / 2))) % 2 else .5, pan=.35)
for h in np.arange(44, 48, BEAT / 4):                            # 16th hats: build into "everywhere"
    add(hat(.04), h, .6, pan=-.35)

# ---------------------------------------------------------------- bass
for s in np.arange(6, 54, BEAT / 2):
    if 39.5 <= s < 40:
        continue
    f = ROOT[chord_at(s)] * (2 if 14 <= s else 1)
    t = t_(BEAT / 2 * .95)
    sig = np.tanh(1.6 * (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t))) * env(len(t), .005, .05)
    add(sig, s, .32 if s >= 14 else .22)

# ---------------------------------------------------------------- arpeggio (energy from the tool scene)
step = BEAT / 4
for k, s in enumerate(np.arange(24, 54, step)):
    if 39.5 <= s < 40:
        continue
    c = CH[chord_at(s)]
    f = (c + [x * 2 for x in c])[k % 6]
    t = t_(.22)
    tone = (np.sin(2 * np.pi * f * 2 * t) + .4 * np.sin(2 * np.pi * f * 4 * t)) * np.exp(-t * 16)
    add(tone, s, .07 if s < 40 else .085, pan=.4 if k % 2 else -.4)

# ---------------------------------------------------------------- transitions: whoosh → impact
def whoosh(d=.9):
    n = rng.standard_normal(int(d * SR))
    out = np.zeros_like(n)
    seg = len(n) // 12
    for i in range(12):                                          # rising band-pass sweep
        lo = 300 + i * 450
        out[i * seg:(i + 1) * seg] = filt(n, "bandpass", [lo, lo * 2.2])[i * seg:(i + 1) * seg]
    return out * np.linspace(0, 1, len(n)) ** 2 * .5


def impact(g=1.0):
    t = t_(2.2)
    boom = np.sin(2 * np.pi * (38 + 40 * np.exp(-t * 9)) * t) * np.exp(-t * 2.2)
    crack = filt(rng.standard_normal(len(t)), "bandpass", [200, 3000]) * np.exp(-t * 14) * .6
    return (boom + crack) * g


add(np.linspace(0, 1, int(2.0 * SR)) ** 3 * filt(rng.standard_normal(int(2.0 * SR)), "bandpass", [400, 6000]) * .35, 0)  # intro riser
add(impact(1.2), 2.0, .8)                                        # logo hit
for c in CUTS:
    add(whoosh(), c - .9, .8, pan=-.2)
    add(impact(1.0 if c != 40 else 1.3), c, .7)

# ---------------------------------------------------------------- outro: shimmer and final chord
t = t_(6)
shimmer = sum(np.sin(2 * np.pi * f * t) * .25 for f in (880, 1318.5, 1760)) * env(len(t), 1.5, 3)
add(shimmer, 54.2, .12, pan=.2)

# ---------------------------------------------------------------- mix: room, glue, fade, normalise
mix = np.stack([L, R], axis=1)
ir_t = t_(1.6)
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2)
ir /= np.abs(ir).sum() / 6
wet = np.stack([fftconvolve(mix[:, k], ir)[:N] for k in (0, 1)], axis=1)
mix = mix * .85 + wet * .18
fade = np.ones(N); fade[int(57.6 * SR):] = np.linspace(1, 0, N - int(57.6 * SR))
fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
mix *= fade[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix /= np.abs(mix).max() / 0.89
wavfile.write(sys.argv[1], SR, (mix * 32767).astype(np.int16))
print("wrote", sys.argv[1])
