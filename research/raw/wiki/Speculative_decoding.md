Source: https://en.wikipedia.org/wiki/Speculative_decoding
Speculative decoding - Wikipedia
Speculative decoding is an inference-time optimization for autoregressive large language models (LLMs) that generates multiple tokens per decoding step instead of one. A smaller draft model proposes a sequence of candidate tokens, and the larger target model verifies them in a single forward pass through a modified rejection sampling scheme. The verification preserves the target model's original output distribution, so the technique produces the same results as standard decoding while cutting latency by roughly two to three times. The name is an analogy to speculative execution in CPU design, where a processor runs instructions along a predicted branch before the outcome is known.

## Background
Standard autoregressive decoding in large language models generates one token at a time. The model computes a probability distribution over its vocabulary, samples the next token, and feeds that token back as input. For large models, this process is bottlenecked by memory bandwidth rather than arithmetic throughput: loading the model's parameters from high-bandwidth memory (HBM) to the processor takes up most of the wall-clock time at each step. Because of this, a forward pass over one token and a forward pass over several tokens in a batch take roughly the same time. Speculative decoding relies on this property.

## Mechanism
The technique alternates between two phases: drafting and verification.
During drafting, a fast approximation model generates a short run of K candidate tokens, typically between 3 and 12. The draft model is usually a much smaller version of the target model or a lightweight auxiliary network.
During verification, the target model scores the entire draft sequence in one batched forward pass. A modified rejection sampling algorithm compares the draft and target probabilities at each position. If the target model would have been at least as likely to produce a given token, that token is accepted; the first token that fails is resampled from a corrected distribution, and everything after it is thrown out. The result is that the output distribution is the same as if each token had been generated one at a time.
How many tokens get accepted per cycle depends on how well the draft model matches the target. For common words and predictable continuations the match tends to be good, so the target model can confirm several tokens at once.

## History
An early precursor was blockwise parallel decoding, proposed in 2018 by Stern, Shazeer, and Uszkoreit. Their method predicted multiple future tokens through auxiliary prediction heads and validated them against the autoregressive model, but it only worked with greedy decoding and did not preserve the full sampling distribution.
The modern form of the technique came from Yaniv Leviathan, Matan Kalman, and Yossi Matias at Google Research, who posted "Fast Inference from Transformers via Speculative Decoding" on arXiv in November 2022. Separately and at about the same time, Charlie Chen and colleagues at DeepMind arrived at a closely related method they called speculative sampling, published in February 2023. Both papers introduced the use of rejection sampling to guarantee that the output distribution is unchanged. Leviathan et al. showed roughly 2–3x speedup on T5-XXL (11 billion parameters); Chen et al. reported 2–2.5x on the Chinchilla model (70 billion parameters).
The Leviathan et al. paper was presented as an oral at the International Conference on Machine Learning in July 2023.

## Variants
SpecInfer (Miao et al., 2024) uses multiple small language models to jointly build a tree of candidate continuations rather than a single chain. The target model verifies the whole tree in parallel and keeps the longest valid path, with reported speedups of 1.5–3.5x.
Medusa (Cai et al., 2024) takes a different approach by not using a separate draft model at all. Extra lightweight decoding heads are attached to the target model itself, and each one predicts a token at a different future position. The candidates are evaluated through a tree-structured attention mechanism. The authors measured 2.2–3.6x speedup.
EAGLE (Li et al., 2024) performs autoregression on the target model's internal feature representations (specifically the second-to-top layer) rather than on tokens directly. On LLaMA 2 Chat 70B, this gave a 2.7–3.5x latency reduction. Later versions added dynamic draft trees (EAGLE-2) and further optimizations (EAGLE-3), reaching 3–6.5x speedup.

## Adoption
By 2024, speculative decoding had become a standard part of production LLM serving. Google uses it in the AI Overviews feature of Google Search. Open-source inference frameworks such as vLLM, NVIDIA's TensorRT-LLM, and SGLang all include built-in support for speculative decoding and its variants. Apple, AWS, and Meta have also published research extending the method or deploying it at scale.
- Transformer (deep learning architecture)
- Large language model
- Speculative execution
- Autoregressive model