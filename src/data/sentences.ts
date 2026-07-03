import type { TypingSentence } from "../types/game";

export let typingSentences: TypingSentence[] = [
  { id: "s01", text: "A brave coder sharpens ideas before drawing the sword." },
  { id: "s02", text: "Tiny sparks of focus can light the whole arena." },
  { id: "s03", text: "Clean code wins battles long before the final strike." },
  { id: "s04", text: "The castle gate creaks while clouds sketch lazy loops." },
  { id: "s05", text: "Every accurate keystroke sends blue fire across the page." },
  { id: "s06", text: "The red wizard mutters bugs into the notebook margin." },
  { id: "s07", text: "Fast fingers are useful, but calm fingers are dangerous." },
  { id: "s08", text: "Debug the dragon by reading one clue at a time." },
  { id: "s09", text: "A looping spell should always know when to stop." },
  { id: "s10", text: "Combo streaks grow when rhythm and accuracy agree." },
  { id: "s11", text: "The mountains lean in to watch the duel unfold." },
  { id: "s12", text: "Do not fear the bug; make it explain itself." },
  { id: "s13", text: "Careful typing turns pencil scratches into thunder." },
  { id: "s14", text: "A missing return can steal victory from perfect logic." },
  { id: "s15", text: "The best spell is the one you can still read tomorrow." },
  { id: "s16", text: "Jagged stars burst when a sentence lands without error." },
  { id: "s17", text: "The arena floor is ruled paper and stubborn ambition." },
  { id: "s18", text: "Accuracy banks power more reliably than frantic speed." },
  { id: "s19", text: "One wrong operator can turn treasure into trouble." },
  { id: "s20", text: "Blue ink flashes when the player finds the perfect line." },
  { id: "s21", text: "A steady combo makes the opponent's staff wobble." },
  { id: "s22", text: "Sketchy clouds drift behind a very serious duel." },
  { id: "s23", text: "The notebook remembers every typo and every comeback." },
  { id: "s24", text: "Hard words hide extra energy for patient champions." },
  { id: "s25", text: "Victory often begins with a small corrected variable." },
  { id: "s26", text: "The sword hums softly when the attack bank is full." },
  { id: "s27", text: "Read the task twice and the bug may blink first." },
  { id: "s28", text: "Pencil dust rises as the fighters charge again." },
  { id: "s29", text: "A perfect sentence unlocks a star bright enough to sting." },
  { id: "s30", text: "Typing with care can outpace the wildest wand." },
  { id: "s31", text: "Every hidden test is a tiny judge with sharp glasses." },
  { id: "s32", text: "The cleanest fix often changes only one small thing." },
  { id: "s33", text: "Code becomes magic when the tests finally turn green." },
  { id: "s34", text: "The arena cheers quietly from the edge of the page." },
  { id: "s35", text: "A recursive loop needs to know when to pack its bags and return." },
  { id: "s36", text: "Curly braces act like brackets enclosing a chaotic magical storm." },
  { id: "s37", text: "A database query should always be fast, clean, and indexed." },
  { id: "s38", text: "A floating point number might lose its balance if you look too closely." },
  { id: "s39", text: "Do not feed the bugs after midnight or they will multiply." },
  { id: "s40", text: "Comments are love letters we write to our future forgetful selves." },
  { id: "s41", text: "The compiler scans for typos like a hawk looking for lazy mice." },
  { id: "s42", text: "A regular expression is a spell that few wizards truly understand." },
  { id: "s43", text: "Logic errors are devious shadows hiding in plain sight." },
  { id: "s44", text: "An elegant algorithm solves many problems with very few steps." },
  { id: "s45", text: "Pencil sketch warriors never sleep; they just wait in the margins." },
  { id: "s46", text: "A dictionary lookup takes constant time if the hash is good." },
  { id: "s47", text: "Git commit messages should explain why you changed that variable." },
  { id: "s48", text: "Infinite recursion is a staircase that never reaches the floor." },
  { id: "s49", text: "Clean indentation is the secret handshake of professional coders." },
  { id: "s50", text: "A well-named boolean variable is a flag that flies high and clear." },
  { id: "s51", text: "Software design patterns are maps left behind by older explorers." },
  { id: "s52", text: "Memory leaks are slow drips that can eventually drown a server." },
  { id: "s53", text: "Unit tests are tiny guard dogs checking every code gate." },
  { id: "s54", text: "A simple refactoring can make ugly code shine like a new sword." },
  { id: "s55", text: "The mouse cursor blinks as if it knows we are thinking hard." },
  { id: "s56", text: "A script that runs on startup should be extremely polite." },
  { id: "s57", text: "API keys are golden tickets that must never be shared on GitHub." },
  { id: "s58", text: "Binary search cuts the forest in half with every single step." },
  { id: "s59", text: "The browser console is full of red warnings we usually ignore." },
  { id: "s60", text: "A good coder deletes more lines of code than they write." }
];

export async function fetchOnlineQuotes() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/skolakoda/programming-quotes-api/master/Data/quotes.json");
    if (!res.ok) return;
    const quotes = await res.json();
    if (Array.isArray(quotes)) {
      const extraSentences = quotes
        .map((q: any, idx: number) => ({
          id: `online-quote-${idx}`,
          text: (q.en || q.text || "").trim()
        }))
        .filter((s: any) => 
          s.text && 
          s.text.length >= 25 && 
          s.text.length <= 110 && 
          !/[^\x00-\x7F]/.test(s.text) // ASCII only
        );
      
      if (extraSentences.length > 0) {
        // Dedup and push
        const existingTexts = new Set(typingSentences.map(s => s.text.toLowerCase()));
        const uniqueExtras = extraSentences.filter((s: any) => !existingTexts.has(s.text.toLowerCase()));
        typingSentences.push(...uniqueExtras);
        console.log(`Loaded ${uniqueExtras.length} custom programming quotes from GitHub!`);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch online quotes, using offline database.", err);
  }
}

export async function fetchOnlineJokes() {
  try {
    const res = await fetch("https://official-joke-api.appspot.com/jokes/programming/ten");
    if (!res.ok) return;
    const jokes = await res.json();
    if (Array.isArray(jokes)) {
      const extraSentences = jokes
        .map((j: any, idx: number) => {
          const text = `${j.setup} ${j.punchline}`.trim();
          return { id: `online-joke-${idx}-${Date.now()}`, text };
        })
        .filter((s: any) => 
          s.text && 
          s.text.length >= 25 && 
          s.text.length <= 115 && 
          !/[^\x00-\x7F]/.test(s.text)
        );
      
      if (extraSentences.length > 0) {
        const existingTexts = new Set(typingSentences.map(s => s.text.toLowerCase()));
        const uniqueExtras = extraSentences.filter((s: any) => !existingTexts.has(s.text.toLowerCase()));
        typingSentences.push(...uniqueExtras);
        console.log(`Loaded ${uniqueExtras.length} random programming jokes from API!`);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch online programming jokes.", err);
  }
}
