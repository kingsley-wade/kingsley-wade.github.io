from pathlib import Path
import math
import random
import struct
import wave


OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "audio" / "guitar"
SAMPLE_RATE = 44_100
DURATION_SECONDS = 0.78

NOTES = {
    "a3.wav": 220.00,
    "c4.wav": 261.63,
    "d4.wav": 293.66,
    "e4.wav": 329.63,
    "f4.wav": 349.23,
    "fs4.wav": 369.99,
    "g4.wav": 392.00,
    "a4.wav": 440.00,
    "bb4.wav": 466.16,
    "b4.wav": 493.88,
    "c5.wav": 523.25,
    "d5.wav": 587.33,
}


def plucked_string(frequency: float, seed: int) -> list[float]:
    rng = random.Random(seed)
    period = max(2, round(SAMPLE_RATE / frequency))
    ring = [rng.uniform(-1.0, 1.0) for _ in range(period)]
    samples: list[float] = []
    index = 0
    total = round(SAMPLE_RATE * DURATION_SECONDS)
    for sample_index in range(total):
        current = ring[index]
        next_index = (index + 1) % period
        ring[index] = 0.992 * 0.5 * (current + ring[next_index])
        index = next_index
        time = sample_index / SAMPLE_RATE
        attack = min(1.0, time / 0.004)
        release = max(0.0, 1.0 - time / DURATION_SECONDS) ** 1.8
        body = current + 0.08 * math.sin(2 * math.pi * frequency * 2 * time)
        samples.append(body * attack * release * 0.7)
    return samples


def write_wave(path: Path, samples: list[float]) -> None:
    peak = max(abs(sample) for sample in samples) or 1.0
    scale = 0.92 * 32767 / peak
    pcm = b"".join(
        struct.pack("<h", max(-32768, min(32767, round(sample * scale))))
        for sample in samples
    )
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(pcm)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for index, (filename, frequency) in enumerate(NOTES.items()):
        write_wave(OUTPUT_DIR / filename, plucked_string(frequency, seed=2026 + index))


if __name__ == "__main__":
    main()
