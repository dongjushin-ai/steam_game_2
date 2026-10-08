Source: https://en.wikipedia.org/wiki/Chinchilla_(language_model)
Chinchilla (language model) - Wikipedia
| This article may require cleanup to meet Wikipedia's quality standards. The specific problem is: Writing style does not match Wikipedia's standards of prose. Please help improve this article if you can. (March 2026) (Learn how and when to remove this message)
Chinchilla is a family of large language models (LLMs) developed by the research team at Google DeepMind, presented in March 2022.

## Models
It is named "chinchilla" because it is a further development over a previous model family named Gopher. Both model families were trained in order to investigate the scaling laws of large language models.
It claimed to outperform GPT-3. It considerably simplifies downstream utilization because it requires much less computer power for inference and fine-tuning. Based on the training of previously employed language models, it has been determined that if one doubles the model size, one must also have twice the number of training tokens. This hypothesis has been used to train Chinchilla by DeepMind. Similar to Gopher in terms of cost, Chinchilla has 70B parameters and four times as much data (1.4T tokens vs. 300B).
Chinchilla has an average accuracy of 67.5% on the Measuring Massive Multitask Language Understanding (MMLU) benchmark, which is 7% higher than Gopher's performance. Chinchilla was still in the testing phase as of January 12, 2023.
Chinchilla contributes to developing an effective training paradigm for large autoregressive language models with limited compute resources. The Chinchilla team recommends that the number of training tokens is twice for every model size doubling, meaning that using larger, higher-quality training datasets can lead to better results on downstream tasks.
It has been used for the Flamingo vision-language model.

## Architecture
Both the Gopher family and Chinchilla family are families of transformer models.
In particular, they are essentially the same as GPT-2, with different sizes and minor modifications. Gopher family uses RMSNorm instead of LayerNorm; relative positional encoding rather than absolute positional encoding. The Chinchilla family is the same as the Gopher family, but trained with AdamW instead of Adam optimizer.
The Gopher family contains six models of increasing size, from 44 million parameters to 280 billion parameters. They refer to the largest one as "Gopher" by default. Similar naming conventions apply for the Chinchilla family.
Table 1 of shows the entire Gopher family:
| Parameter count
| Layers
| Number of heads
| Key/value size
| Internal dimension
| Max learning rate
| Batch size
| 44M
| 8
| 16
| 32
| 512
| 6 × 10−4
| 0.25M
| 117M
| 12
| 12
| 64
| 768
| 6 × 10−4
| 0.25M
| 417M
| 12
| 12
| 128
| 1,536
| 2 × 10−4
| 0.25M
| 1.4B
| 24
| 16
| 128
| 2,048
| 2 × 10−4
| 0.25M
| 7.1B
| 32
| 32
| 128
| 4,096
| 1.2 × 10−4
| 2M
| Gopher 280B
| 80
| 128
| 128
| 16,384
| 4 × 10−5
| 3M → 6M
Table 4 of compares the 70-billion-parameter Chinchilla with Gopher 280B.
| Parameter count
| Layers
| Number of heads
| Key/value size
| Internal dimension
| Max learning rate
| Batch size
| Gopher 280B
| 80
| 128
| 128
| 16,384
| 4 × 10−5
| 3M → 6M
| Chinchilla 70B
| 80
| 64
| 128
| 8,192
| 1 × 10−4
| 1.5M → 3M
- LaMDA