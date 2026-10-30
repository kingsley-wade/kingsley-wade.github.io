import {
  EINSTEIN_EXCUSES,
  EINSTEIN_FINALE,
  EINSTEIN_POSITIVE_CHANCE,
  EINSTEIN_POSITIVES,
  EINSTEIN_QUESTION,
  GENEROSITY_MAX_ASKS,
  GENEROSITY_STEP,
  STATUS_TAGLINE,
  formatEinsteinLine,
  generosityForAsks,
  pickMantingLine,
  pickRandom,
} from "./lines";

const STORAGE_KEY = "motivation-exe-v1";

const OPENING_QUESTION = "any new papers?";
const PUSH_QUESTION = "[PUSHED MANTING] harder, please.";

export type MotivationState = { nudges: number; asks: number; bonus: number };

export type MotivationTurn = {
  speaker: "you" | "manting" | "einstein";
  text: string;
};

export type MotivationSnapshot = {
  nudges: number;
  asks: number;
  generosity: number;
  statusLine: string;
};

const storage = (): Pick<Storage, "getItem" | "setItem"> | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readStorage = (): MotivationState => {
  const raw = storage()?.getItem(STORAGE_KEY) ?? null;
  if (!raw) return { nudges: 0, asks: 0, bonus: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<MotivationState>;
    return {
      nudges: Number.isFinite(parsed.nudges) ? Number(parsed.nudges) : 0,
      asks: Number.isFinite(parsed.asks) ? Number(parsed.asks) : 0,
      bonus: Number.isFinite(parsed.bonus) ? Number(parsed.bonus) : 0,
    };
  } catch {
    return { nudges: 0, asks: 0, bonus: 0 };
  }
};

const writeStorage = (state: MotivationState) => {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: session-only state */
  }
};

export const MOTIVATION_EVENTS = {
  updated: "motivation:updated",
} as const;

export const createMotivationStore = (random: () => number = Math.random) => {
  const listeners = new Set<() => void>();

  // State is re-read from storage on every access so the panel and the
  // site terminal stay in sync through localStorage alone.
  const snapshot = (): MotivationSnapshot => {
    const state = readStorage();
    const generosity = generosityForAsks(state.asks, state.bonus);
    return {
      nudges: state.nudges,
      asks: state.asks,
      generosity,
      statusLine: `nudges: ${state.nudges} · einstein's generosity: ${generosity.toFixed(2)}% · ${STATUS_TAGLINE}`,
    };
  };

  const commit = (state: MotivationState) => {
    writeStorage(state);
    listeners.forEach((listener) => listener());
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(MOTIVATION_EVENTS.updated));
    }
  };

  return {
    snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    opening: (): MotivationTurn[] => [
      { speaker: "you", text: OPENING_QUESTION },
      { speaker: "manting", text: pickMantingLine(random) },
    ],
    nudge: (): MotivationTurn[] => {
      const state = readStorage();
      commit({ ...state, nudges: state.nudges + 1 });
      return [
        { speaker: "you", text: PUSH_QUESTION },
        { speaker: "manting", text: pickMantingLine(random) },
      ];
    },
    askEinstein: (): MotivationTurn[] => {
      const state = readStorage();
      const asks = state.asks + 1;
      if (asks >= GENEROSITY_MAX_ASKS) {
        commit({ ...state, asks: 0, bonus: 0 });
        return [
          { speaker: "you", text: EINSTEIN_QUESTION },
          { speaker: "einstein", text: EINSTEIN_FINALE },
        ];
      }
      const positive = random() < EINSTEIN_POSITIVE_CHANCE;
      const maxBonus = GENEROSITY_STEP * 2;
      const rawBonus = positive ? state.bonus + GENEROSITY_STEP : state.bonus;
      const bonus = Math.min(rawBonus, maxBonus);
      commit({ ...state, asks, bonus });
      const pct = generosityForAsks(asks, bonus);
      const line = positive
        ? pickRandom(EINSTEIN_POSITIVES, random)
        : pickRandom(EINSTEIN_EXCUSES.slice(1), random);
      return [
        { speaker: "you", text: EINSTEIN_QUESTION },
        { speaker: "einstein", text: formatEinsteinLine(line, pct) },
      ];
    },
  };
};

export type MotivationStore = ReturnType<typeof createMotivationStore>;
