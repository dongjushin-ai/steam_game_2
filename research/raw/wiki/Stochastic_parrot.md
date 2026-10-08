Source: https://en.wikipedia.org/wiki/Stochastic_parrot
Stochastic parrot - Wikipedia
In machine learning, the term stochastic parrot is a metaphor that frames large language models as systems that statistically mimic text without real understanding. The word "stochastic" – from the ancient Greek "στοχαστικός" (stokhastikos, 'based on guesswork') – is a term from probability theory meaning "randomly determined". The word "parrot" refers to the ability of parrots to mimic human speech.
The term was introduced in a 2021 paper on AI ethics titled "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big? 🦜" that was authored by Timnit Gebru, Emily M. Bender, Angelina McMillan-Major, and Margaret Mitchell.[a] The paper outlined possible risks associated with large language models (LLMs). In December 2020, it was the subject of a workplace dispute between Gebru (then co-leader of Google's Ethical Artificial Intelligence Team) and Google, which had requested the retraction of the paper. The incident culminated in Gebru's controversial departure from the company.
The paper was later presented at the 2021 ACM Conference on Fairness, Accountability, and Transparency, and the term "stochastic parrot" has seen widespread use in academic research concerning generative AI and LLMs. The term has been interpreted negatively as an insult towards AI.

## Background
Timnit Gebru is an AI ethics researcher, Emily M. Bender is a linguist specializing in computational linguistics, and Margaret Mitchell is a computer scientist specializing in algorithmic bias. Gebru had joined Google in 2018, where she co-led a team on the ethics of artificial intelligence with Mitchell.
In late 2020, the paper "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big? 🦜" was co-written by Gebru and five other researchers, four of whom were Google employees. The paper argues that large language models (LLMs) present significant risks such as environmental and financial costs, inscrutability leading to unknown dangerous biases, and potential for deception as LLMs do not understand the concepts underlying what they learn.
The paper states that LLMs are "stitching together sequences of linguistic forms ... observed in its vast training data, according to probabilistic information about how they combine, but without any reference to meaning." Therefore, they are labeled "stochastic parrots".

## Dismissal of Gebru by Google
After the paper was submitted for consideration to the 2021 ACM Conference, Google requested that Gebru either retract the paper from the conference or remove the names of Google employees from it. Gebru refused to do so without further discussion, and emailed Google Research vice president Megan Kacholia that if the company could not explain the request for retraction and address other concerns regarding similar projects, she would plan to resign after a transition period, stating that they could "work on a last date". The following day, on December 2, 2020, Gebru received an email saying that Google was "accepting her resignation". Her abrupt firing sparked protests by Google employees and negative publicity for the company.

## Usage
The phrase has been used by AI skeptics to signify that LLMs lack understanding of the meaning of their outputs.
Sam Altman, CEO of OpenAI, used the term shortly after the release of ChatGPT in December 2022, tweeting "i am a stochastic parrot, and so r u". The term was nominated as the 2023 AI-related Word of the Year by the American Dialect Society.

## Debate
Some LLMs, such as ChatGPT, have become capable of interacting with users in convincingly human-like conversations. The development of these new systems has deepened the discussion of the extent to which LLMs understand or are simply "parroting".
According to machine learning researchers Lindholm, Wahlström, Lindsten, and Schön, the term "stochastic parrot" highlights two vital limitations of LLMs:
- LLMs are limited by the data they are trained on and are simply stochastically repeating contents of datasets.
- Because they are just making up outputs based on training data, LLMs do not understand if they are saying something incorrect or inappropriate.
Lindholm et al. noted that, with poor quality datasets and other limitations, a learning machine might produce results that are "dangerously wrong".

## Subjective experience
In the mind of a human being, words and language correspond to things one has experienced. For LLMs, according to proponents of the theory, words correspond only to other words and patterns of usage fed into their training data. Proponents of the idea of stochastic parrots thus conclude that statements about LLMs are due to "the human tendency to attribute meaning to text", and claim this occurs despite the LLMs not actually understanding language.

## Fine-tuning
Kelsey Piper argued that the claim that LLMs are stochastic parrots or mere "next-token predictors" focuses on pre-training, ignoring that modern LLMs are also fine-tuned to follow instructions and to prefer accurate answers.

## Hallucinations and mistakes
The tendency of early LLMs to pass off false information as fact was held as support. Called hallucinations or confabulations, LLMs will occasionally synthesize information that matches some pattern. LLMs may fail to distinguish fact and fiction, which leads to the claim that they can't connect words to a comprehension of the world, as humans do. Furthermore, LLMs may fail to decipher complex or ambiguous grammar cases that rely on understanding the meaning of language. For example:
The wet newspaper that fell down off the table is my favorite newspaper. But now that my favorite newspaper fired the editor I might not like reading it anymore. Can I replace 'my favorite newspaper' by 'the wet newspaper that fell down off the table' in the second sentence?
GPT-4, an LLM released in March 2023, responded yes, not understanding that the meaning of "newspaper" is different in these two contexts; it is first an object and second an institution.

## Benchmarks and experiments
One argument against the hypothesis that LLMs are stochastic parrots is their results on benchmarks for reasoning, common sense and language understanding. In 2023, some LLMs have shown good results on many language understanding tests, such as the Super General Language Understanding Evaluation (SuperGLUE). GPT-4 scored in the >90th-percentile on the Uniform Bar Examination and achieved 93% accuracy on the MATH benchmark of high-school Olympiad problems, results that exceed rote pattern-matching expectations. Such tests, and the smoothness of many LLM responses, help as many as 51% of AI professionals believe they can truly understand language with enough data, according to a 2022 survey.

## Expert rebuttals
Some AI researchers dispute the notion that LLMs merely "parrot" their training data.
A 2024 Scientific American investigation described a closed Berkeley workshop where state-of-the-art models solved novel tier-4 mathematics problems and produced coherent proofs, indicating reasoning abilities beyond memorization.
The GPT-4 Technical Report showed human-level results on professional and academic exams (e.g., the Uniform Bar Exam and USMLE), challenging the "parrot" characterization.
Anthropic conducted mechanistic interpretability research on Claude, using attribution graphs to identify circuits. The research showed how the LLM processes information via chains of fuzzy logical inference, and indicated an ability to plan ahead. They found that Claude 3.5 Haiku "employs remarkably general abstractions", forms "internally generated plans for its future outputs" and "works backwards from its longer-term goals". They noted that "The mechanisms of the model can apparently only be faithfully described using an overwhelmingly large causal graph." They also found that the model includes "mechanisms that could underlie a simple form of metacognition", in that it "thinks about" the level of its own knowledge before reaching its answer.

## Interpretability
Another line of evidence against the 'stochastic parrot' claim comes from mechanistic interpretability, a research field dedicated to reverse-engineering LLMs to understand their internal workings. Rather than only observing the model's input-output behavior, these techniques probe the model's internal activations, which can be used to determine if they contain structured representations of the world. The goal is to investigate whether LLMs are merely manipulating surface statistics or if they are building and using internal "world models" to process information.
One example is Othello-GPT, where a small transformer was trained to predict legal Othello moves. It has been found that this model has an internal representation of the Othello board, and that modifying this representation changes the predicted legal Othello moves in the correct way. This supports the idea that LLMs have a "world model", and are not just doing superficial statistics.
In another example, a small transformer was trained on computer programs written in the programming language Karel. Similar to the Othello-GPT example, this model developed an internal representation of Karel program semantics. Modifying this representation results in appropriate changes to the output. Additionally, the model generates correct programs that are, on average, shorter than those in the training set.
Researchers also studied "grokking", a phenomenon where an AI model initially memorizes the training data outputs, and then, after further training, suddenly finds a solution that generalizes to unseen data.

## Shortcut learning and benchmark flaws
A significant counterpoint in the debate is the well-documented phenomenon of "shortcut learning." Critics of claims for LLM understanding argue that high benchmark scores can be misleading.
When tests created to test people for language comprehension are used to test LLMs, they sometimes result in false positives caused by spurious correlations within text data. Models have shown examples of shortcut learning, which is when a system makes unrelated correlations within data instead of using human-like understanding.
- Autocomplete
- Chinese room
- Criticism of artificial neural networks
- Criticism of deep learning
- ELIZA effect
- Generative AI
- Mark V. Shaney, an early chatbot that used a very simple three-word Markov chain algorithm to generate Markov text
- Psittacism, repetitive speech or writing in the manner of a parrot
- Talking bird

## Works cited
- Lindholm, A.; Wahlström, N.; Lindsten, F.; Schön, T. B. (2022). Machine Learning: A First Course for Engineers and Scientists. Cambridge University Press. ISBN 978-1-108-84360-7.
- Weller, Adrian (13 July 2021). On the Dangers of Stochastic Parrots: Can Language Models Be Too Big? 🦜 (video). Alan Turing Institute. Keynote by Emily Bender. The presentation was followed by a panel discussion.
- Bogost, Ian (7 December 2022). "ChatGPT Is Dumber Than You Think: Treat it like a toy, not a tool". The Atlantic. Retrieved 17 January 2024.
- Chomsky, Noam (8 March 2023). "The False Promise of ChatGPT". The New York Times. Retrieved 17 January 2024.
- Glenberg, Arthur; Jones, Cameron Robert (6 April 2023). "It takes a body to understand the world – why ChatGPT and other language AIs don't know what they're saying". The Conversation. Retrieved 17 January 2024.
- McQuillan, D. (2022). Resisting AI: An Anti-fascist Approach to Artificial Intelligence. Bristol University Press. ISBN 978-1-5292-1350-8.
- Thompson, E. (2022). Escape from Model Land: How Mathematical Models Can Lead Us Astray and What We Can Do about It. Basic Books. ISBN 978-1-5416-0098-0.
- Zhong, Qihuang; Ding, Liang; Liu, Juhua; Du, Bo; Tao, Dacheng (2023). "Can ChatGPT Understand Too? A Comparative Study on ChatGPT and Fine-tuned BERT". arXiv:2302.10198 [cs.CL].
- "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big? 🦜" at Wikimedia Commons