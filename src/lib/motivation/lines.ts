export const MANTING_LINES: readonly string[] = [
  "noted. this is legally binding motivation now.",
  "nudges convert to pages at roughly 0.01 pages each.",
  "einstein's brain would help, but he's still \"thinking about it\".",
  "my reviewers are also nudging. everyone is nudging.",
  "thank you. tell your friends. citations count double.",
  'define "new". my drafts are aging like wine, though.',
  "peer review is also asking. we're all asking.",
  "submitting is a 2027 problem. drafting is forever.",
  "the queue is ordered by nagging frequency. keep going.",
  "i heard you. my latex build didn't.",
  "progress is real but lives in an uncommitted branch.",
  "one more nudge and i open the editor. probably.",
  "my productivity follows your click count. literally.",
  "the introduction alone has three drafts. it's going great.",
  "results pending. motivation pending. consistency pending.",
];

export const MANTING_POSITIVES: readonly string[] = [
  "noted. working hard tonight.",
  "on it — heading to the desk right now.",
  "writing as we speak. thank you for the push.",
  "momentum acquired. this nudge goes in the acknowledgments.",
  "perfect timing. i was just about to open the editor.",
  "consider the results section started. tonight, even.",
  "coffee brewed. words incoming.",
  "open to collaborations, by the way. especially persuasive ones.",
  "you're officially invited to the draft reading. it happens eventually.",
  "this is the energy peer review wishes it had. thank you.",
];

export const EINSTEIN_EXCUSES: readonly string[] = [
  "interesting proposal. my current generosity: {pct}%",
  "relative to my output, that's a generous offer. {pct}%",
  "my estate lawyers say hi. still {pct}%.",
  "cite my 1905 papers and we'll revisit. {pct}%",
  "space is curved, deadlines are not. {pct}%",
  "i would, but relativity makes 'soon' ambiguous. {pct}%",
  "e = mc², and patience = 2·patience. {pct}%",
  "the brain is promised to science. {pct}%",
  "imagination is more important than organs. {pct}%",
  "i only donate to peer-reviewed causes. {pct}%",
  "my hair comes separately, and it's non-negotiable. {pct}%",
  "time dilation applies to my replies too. {pct}%",
  "god does not play dice, but i might. {pct}%",
  "ask again after your next submission. {pct}%",
];

export const EINSTEIN_POSITIVES: readonly string[] = [
  "alright. a small slice for peer review. {pct}%.",
  "ok, one hemisphere. on loan. {pct}%.",
  "deal — i'll ask marie to lend you hers. {pct}%.",
  "fine, one neuron. it's a very good one. {pct}%.",
  "approved. invoice my estate. {pct}%.",
  "ok, but i co-author. {pct}%.",
];

export const EINSTEIN_POSITIVE_CHANCE = 0.25;

export const EINSTEIN_FINALE = "fine. 100%. but you get the hair too.";

export const OPENING_QUESTION = "any new papers?";
export const PUSH_QUESTION = "[PUSHED MANTING] harder, please.";
export const EINSTEIN_QUESTION =
  "professor, would you donate your brain to help manting publish faster?";

export const STATUS_TAGLINE = '"your click counts. science says so."';

export const GENEROSITY_STEP = 3.14;
export const GENEROSITY_MAX_ASKS = 6;

export const generosityForAsks = (asks: number, bonus = 0): number =>
  asks >= GENEROSITY_MAX_ASKS
    ? 100
    : Math.min(100, Number((asks * GENEROSITY_STEP + bonus).toFixed(2)));

export const pickRandom = (
  lines: readonly string[],
  random: () => number = Math.random,
): string => lines[Math.floor(random() * lines.length)] ?? lines[0];

export const pickMantingLine = (random: () => number = Math.random): string =>
  random() < 0.5
    ? pickRandom(MANTING_POSITIVES, random)
    : pickRandom(MANTING_LINES, random);

export const formatEinsteinLine = (
  excuse: string,
  pct: number,
): string => excuse.replaceAll("{pct}", pct.toFixed(2));
