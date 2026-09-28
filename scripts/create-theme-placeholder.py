from pathlib import Path

import numpy as np
import soundfile as sf


SAMPLE_RATE = 22_050
BPM = 84
BEAT_SECONDS = 60 / BPM
BARS = 12
OUTPUT = (
    Path(__file__).resolve().parents[1]
    / "public"
    / "audio"
    / "mock"
    / "theme-placeholder.ogg"
)


def note(frequency: float, duration: float, brightness: float = 0.18) -> np.ndarray:
    count = int(SAMPLE_RATE * duration)
    time = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    attack = np.minimum(time / 0.035, 1.0)
    release = np.minimum((duration - time) / 0.45, 1.0)
    envelope = np.maximum(0.0, attack * release) * np.exp(-time * 0.45)
    tone = (
        np.sin(2 * np.pi * frequency * time)
        + brightness * np.sin(2 * np.pi * frequency * 2 * time)
        + 0.08 * np.sin(2 * np.pi * frequency * 3 * time)
    )
    return 0.16 * envelope * tone


def add_note(track: np.ndarray, start_beat: float, midi: int, beats: float) -> None:
    start = int(start_beat * BEAT_SECONDS * SAMPLE_RATE)
    frequency = 440.0 * (2.0 ** ((midi - 69) / 12.0))
    sound = note(frequency, beats * BEAT_SECONDS)
    end = min(track.size, start + sound.size)
    track[start:end] += sound[: end - start]


def main() -> None:
    total_beats = BARS * 3
    track = np.zeros(int(total_beats * BEAT_SECONDS * SAMPLE_RATE), dtype=np.float64)
    chords = [
        (48, 55, 64),
        (45, 52, 60),
        (41, 48, 57),
        (43, 50, 59),
    ]
    melody_steps = [64, 67, 69, 62, 65, 69, 59, 62, 67, 60, 64, 67]

    for bar in range(BARS):
        chord = chords[bar % len(chords)]
        beat = bar * 3
        add_note(track, beat, chord[0], 2.8)
        add_note(track, beat + 1, chord[1], 0.9)
        add_note(track, beat + 2, chord[2], 0.9)
        add_note(track, beat + 0.5, melody_steps[bar], 1.25)
        if bar % 3 == 2:
            add_note(track, beat + 2.25, melody_steps[bar] - 2, 0.6)

    # A short reflected tail keeps the loop warm without copying any source recording.
    delay = int(0.21 * SAMPLE_RATE)
    track[delay:] += track[:-delay] * 0.16
    track = np.tanh(track * 1.2)
    peak = np.max(np.abs(track))
    if peak:
        track *= 0.82 / peak

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    sf.write(OUTPUT, track.astype(np.float32), SAMPLE_RATE, format="OGG", subtype="VORBIS")
    print(f"wrote {OUTPUT} ({track.size / SAMPLE_RATE:.2f}s)")


if __name__ == "__main__":
    main()
