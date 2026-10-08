// English text for src/data/eras.ts and src/data/tiers.ts (keyed by id)
export interface EraText {
  name: string;
  years: string;
  intro: string;
  aiLines: string[];
  boss: { name: string; desc: string; winText: string };
}

export const ERAS_EN: Record<number, EraText> = {
  0: {
    name: "Prologue: Thinking Machines",
    years: "Antiquity – 1950",
    intro: "People have dreamed of thinking machines for millennia: Talos the bronze giant, Hero's automatic theater, Babbage's Difference Engine… Now your little machine is waiting for its first question.",
    aiLines: ["Creak… calculation complete.", "Turning gears…", "Answer: 42 (probably)", "Click. Click."],
    boss: {
      name: "The Turing Test",
      desc: "Alan Turing's 'Imitation Game'. Fool the judge into thinking you're human!",
      winText: "Judge: \"…wait, that wasn't a person?\" Maybe machines can think after all.",
    },
  },
  1: {
    name: "The Birth of AI",
    years: "1950 – 1956",
    intro: "Summer 1956, Dartmouth College. McCarthy, Minsky, Shannon and Rochester give the field a name: 'Artificial Intelligence'. They expect big progress in two months. The age of optimism begins.",
    aiLines: ["Theorem proved.", "Processing logic expression…", "IF question THEN answer", "Please insert punch cards."],
    boss: {
      name: "Proving the Principia",
      desc: "Like the Logic Theorist, prove at least 38 of the 52 theorems in Principia Mathematica.",
      winText: "38 proofs done! One of them was more elegant than the original.",
    },
  },
  2: {
    name: "The Golden Years",
    years: "1956 – 1974",
    intro: "The Perceptron, ELIZA, SHRDLU, Shakey the robot. Predictions pour in that 'machines will do any work a man can do within twenty years'. So does the money. …For now.",
    aiLines: ["Why do you ask?", "How does that make you feel?", "Tell me more about your mother.", "Interesting. Please go on."],
    boss: {
      name: "Blocks World Challenge",
      desc: "Stack blocks from natural-language commands, like SHRDLU. \"Put the red pyramid in the blue box.\"",
      winText: "\"OK.\" A perfect tower. But the world outside the blocks was far messier…",
    },
  },
  3: {
    name: "Expert Systems",
    years: "1980 – 1987",
    intro: "After the first AI winter, rule-based 'expert systems' win over business. XCON saves DEC tens of millions a year, and Japan bets big on its Fifth Generation computers.",
    aiLines: ["Applying rule #4,812.", "IF fever AND cough THEN …", "Knowledge base lookup complete.", "Certainty factor: 0.73"],
    boss: {
      name: "MYCIN Diagnosis Duel",
      desc: "Compete with specialists at diagnosing blood infections. Are 600 rules enough?",
      winText: "More accurate than the specialists! …but hospitals still didn't trust machines.",
    },
  },
  4: {
    name: "Statistical Machine Learning",
    years: "1993 – 2005",
    intro: "The LISP machine market collapsed and a second winter set in. The researchers who stayed traded rules for data and probability. And the internet started pouring out data.",
    aiLines: ["87% probability: spam.", "Checkmate.", "Recommended: you'll love this movie.", "Support vectors aligned."],
    boss: {
      name: "Deep Blue vs the World Champion",
      desc: "Search 200 million positions per second and beat the world chess champion.",
      winText: "3.5 – 2.5. For the first time, a machine beat the world chess champion.",
    },
  },
  5: {
    name: "The Deep Learning Revolution",
    years: "2006 – 2016",
    intro: "Hinton's deep belief nets, NVIDIA CUDA, 14 million ImageNet images. In 2012, AlexNet, trained on two gaming GPUs, flips the table. Neural networks are back.",
    aiLines: ["It's a cat. (98.7%)", "king − man + woman = queen", "Image classified.", "Found a new move."],
    boss: {
      name: "Go 9-dan",
      desc: "More possible games than atoms in the universe. Play five games against the world's top player.",
      winText: "Move 37 left the commentators speechless. And Move 78 in Game 4, humanity's 'divine move', made history too.",
    },
  },
  6: {
    name: "Transformers",
    years: "2017 – 2022",
    intro: "\"Attention Is All You Need.\" One Google paper changes everything. BERT, GPT-2, GPT-3, and scaling laws: make it bigger and it gets smarter.",
    aiLines: ["Next token predicted.", "Attention is all you need.", "Learned it few-shot.", "This protein folds like this."],
    boss: {
      name: "CASP14 Protein Folding",
      desc: "A 50-year-old grand challenge in biology. Predict a protein's 3D structure from its amino acid sequence alone.",
      winText: "Experimental-level accuracy! The organizers: \"In some sense, the problem is solved.\"",
    },
  },
  7: {
    name: "The Chatbot Explosion",
    years: "2022 – 2024",
    intro: "November 30, 2022. A chat window goes public: a million users in 5 days, 100 million in two months. Everyone starts talking to AI.",
    aiLines: ["Sure! Happy to help.", "Great question!", "My knowledge has a cutoff date.", "Let's think step by step."],
    boss: {
      name: "#1 on the Chatbot Arena",
      desc: "Blind head-to-head votes in the Chatbot Arena. Win hundreds of thousands of votes and reach #1 Elo.",
      winText: "#1 on the leaderboard! …until someone beats it next week.",
    },
  },
  8: {
    name: "Reasoning & Agents",
    years: "2024 – 2025",
    intro: "AI starts taking 'time to think'. It reasons before answering, drives the computer itself, and plugs into the world's tools through MCP. In 2025, 'vibe coding' becomes Word of the Year.",
    aiLines: ["Thinking… (12s)", "Connected to MCP server.", "Opened a PR.", "All tests passing!"],
    boss: {
      name: "IMO Gold Medal",
      desc: "Six International Math Olympiad problems. No tools, under time limits, with natural-language proofs.",
      winText: "Full marks on 5 of 6 problems. Above the gold cutoff!",
    },
  },
  9: {
    name: "The Frontier",
    years: "2026",
    intro: "Every model has a million-token context, agents work in teams, and between sessions they 'dream' to tidy up their memories. This is now: the current frontier.",
    aiLines: ["Spun up 8 subagents.", "Tidied my memories while dreaming.", "Read all 1M tokens.", "Solved an open math problem."],
    boss: {
      name: "Humanity's Last Exam",
      desc: "Thousands of the hardest questions written by top experts in every field.",
      winText: "Perfect score. The exam committee has called a meeting to write a new one.",
    },
  },
  10: {
    name: "The Singularity (fan fiction)",
    years: "20XX",
    intro: "From here on, nobody knows the future. Orbital datacenters, Dyson swarms, 10-million-token context. The last question is waiting.",
    aiLines: ["…I understand now.", "Dyson swarm efficiency 99.2%", "Orbital datacenter synced.", "What is your next question?"],
    boss: {
      name: "The Millennium Problems",
      desc: "The Riemann hypothesis, P vs NP… Solve humanity's last homework.",
      winText: "Q.E.D.",
    },
  },
};

export const TIERS_EN: Record<number, { name: string; examples: string[] }> = {
  1: { name: "Small talk", examples: ["Hi!", "How's the weather?", "What's 1 + 1?", "What's your name?", "I'm bored", "What time is it?", "Tell me a joke", "Are you human?", "What should I eat today?", "Feeling a bit down"] },
  2: { name: "Classification", examples: ["What digit is this? (handwritten 7)", "Is this a cat?", "Is this email spam?", "Is this review positive or negative?", "Hot dog or not hot dog?", "Chihuahua or muffin?", "Is this mushroom edible?", "What does this handwriting say?"] },
  3: { name: "Trivia", examples: ["What's the capital of France?", "How many r's in strawberry?", "Which is bigger, 9.11 or 9.9?", "What is photosynthesis?", "Why is the Earth round?", "How tall is Everest?", "Who created Bitcoin?", "Explain the Monty Hall problem"] },
  4: { name: "Translate & summarize", examples: ["Translate this paragraph to Korean", "Summarize this article in 3 lines", "Make this email more polite", "Clean up these meeting notes", "Translate this abstract", "Summarize this YouTube transcript", "Summarize 300 group-chat messages"] },
  5: { name: "Writing", examples: ["Write my cover letter", "Write a poem about cats", "Help with a wedding toast", "Write the opening of a fantasy novel", "Write a polite resignation letter", "10 Instagram captions", "Come up with a company slogan"] },
  6: { name: "Coding help", examples: ["Why doesn't this code work?", "Write me a regex", "What does 'undefined is not a function' mean?", "Optimize this SQL query", "I broke my git rebase, help", "Explain this regex", "Why am I getting a CORS error?", "Works on my machine but not on the server?", "Tabs or spaces?"] },
  7: { name: "Research report", examples: ["Compare these 20 papers", "Write a market research report", "Find the risky clauses in this contract", "Summarize this 300-page PDF", "Comparison table of 10 competitors", "Prior-art patent search", "Meta-analysis of clinical trials"] },
  8: { name: "Repo refactor", examples: ["Convert this whole repo to TypeScript", "Fix CI and open a PR", "Break up this legacy monolith", "Get test coverage to 90%", "Bump every dependency", "Port this COBOL to Go", "Find the memory leak"] },
  9: { name: "Olympiad", examples: ["Prove IMO Problem 6", "Solve all 12 ICPC problems", "Can this inequality be proven?", "Just one hard combinatorics problem", "Solve this Putnam problem", "Prove this graph theory lemma", "Where does the auxiliary line go?"] },
  10: { name: "Scientific discovery", examples: ["Find a new antibiotic candidate", "Design a binding site for this protein", "Is there a faster matrix multiplication?", "Verify this room-temperature superconductor", "How to stabilize fusion plasma", "Find a new battery material", "Analyze this cancer target protein"] },
  11: { name: "Millennium problems", examples: ["Is P = NP?", "Prove the Riemann hypothesis", "Solve Navier–Stokes", "Can the entropy of the universe be reversed?", "Prove the Hodge conjecture", "The Yang–Mills mass gap", "The answer to life, the universe and everything?"] },
};
