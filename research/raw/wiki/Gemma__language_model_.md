Source: https://en.wikipedia.org/wiki/Gemma_(language_model)
Gemma (language model) - Wikipedia
Gemma is a series of source-available large language models developed by Google DeepMind. It is based on similar technologies as Gemini. The first version was released in February 2024, followed by Gemma 2 in June 2024, Gemma 3 in March 2025, and the open-weights Gemma 4 in April 2026. Variants of Gemma have also been developed, such as the vision-language model PaliGemma and the model MedGemma for medical consultation topics.

## History
In February 2024, Google debuted Gemma, a collection of open weight LLMs that serve as a lightweight version of Gemini. The initial release came in two sizes: neural networks with two and seven billion parameters respectively. Multiple publications viewed this as a response to competitors such as Meta releasing source code for their AI models, and a shift from Google's longstanding practice of keeping its AI source code private.
Gemma 2 was released on June 27, 2024, and Gemma 3 was released on March 12, 2025. On April 2, 2026, Google released Gemma 4 under the free and open-source Apache 2.0 license.

## Overview
Based on similar technologies as the Gemini series of models, Gemma is described by Google as helping support its mission of "making AI helpful for everyone". Google offers official Gemma variants optimized for specific use cases, such as MedGemma for medical analysis.
Since its release, Gemma models have had over 150 million downloads, with 70,000 variants available on Hugging Face.
Gemma 3 was offered in 1, 4, 12, and 27 billion parameter sizes with support for over 140 languages. As multimodal models, they support both text and image input. Google also offers Gemma 3n – smaller models optimized for execution on consumer devices like smartphones, laptops, and tablets.
The latest generation of models is Gemma 4, released on April 2, 2026. It is available in four sizes: Effective 2B (E2B), Effective 4B (E4B), 26B Mixture of Experts (MoE), and 31B Dense. Gemma 4 supports multimodal input, including images and video across all models, with native audio input on the E2B and E4B models. Gemma 4's 31B Dense variant reached third place on Arena's text leaderboard, and the 26B variant reached sixth place. Gemma 4 12B was released on June 3, 2026 and features a unified multimodal architecture that processes images and audio without encoders.

## Architecture
Gemma 3 is based on a decoder-only transformer architecture with grouped-query attention (GQA) and the SigLIP vision encoder. Every model has a context length of 128K, with the exception of Gemma 3 1B, which has a context length of 32K.
Quantized versions fine-tuned using quantization-aware training (QAT) are also available, offering sizable memory usage improvements with some negative impact on accuracy and precision.

## Variants
Google develops official variants of Gemma models designed for specific purposes, like medical analysis or programming. These include:
- CodeGemma (2B and 7B): CodeGemma is a group of models designed for code completion as well as general coding use. It supports multiple programming languages, including Python, Java, C++, and more.
- DolphinGemma (roughly 400M): Developed in collaboration with researchers at Georgia Tech and the Wild Dolphin Project, DolphinGemma aims to better understand dolphin communication through audio analysis. However, no model or data have been publicly released.
- MedGemma (4B and 27B): Also based on Gemma 3, MedGemma is designed for medical applications like image analysis. However, Google also notes that MedGemma "isn't yet clinical grade". Developers at Tap Health in Gurgaon, India, have used MedGemma to enhance AI-assisted diabetes management applications.
- PaliGemma (3B, 10B and 28B, based on Gemma 2 with 2B, 9B and 27B, respectively): For machine vision and image analysis.
- ShieldGemma 2 (4B): Based on the Gemma 3 family, ShieldGemma is designed to identify and filter violent, dangerous, and sexually explicit images.
- TranslateGemma (4B, 12B and 27B): For machine translation.
| Generation
| Release date
| Parameters
| Context length
| Multimodal
| License
| Notes
| Gemma 1
| 2024-02-21
| 2B, 7B
| 8,192
| No
| Source-available (Gemma Terms of Use)
| 2B distilled from 7B. 2B uses multi-query attention while 7B uses multi-head attention.
| CodeGemma
| 2B, 7B
| 8,192
| Gemma 1 fine-tuned for code generation.
| RecurrentGemma
| 2024-04-11
| 2B, 9B
| Unlimited (trained on 8,192)
| Griffin-based, instead of transformer-based.
| Gemma 2
| 2024-06-27
| 2B, 9B, 27B
| 8,192
| 27B trained from web documents, code, science articles. Gemma 2 9B was distilled from 27B. Gemma 2 2B was distilled from a 7B model that remained unreleased. Uses Grouped-Query Attention.
| PaliGemma
| 2024-07-10
| 3B
| 8,192
| Image
| A vision-language model that takes text and image inputs, and outputs text. It is made by connecting a SigLIP-So400m image encoder with Gemma v1.0 2B.
| PaliGemma 2
| 2024-12-04
| 3B, 10B, 28B
| 8,192
| Made by mating SigLIP-So400m with Gemma v2.0 2B, 9B, and 27B. Capable of more vision-language tasks.
| Gemma 3
| 2025-03-12
| 1B, 4B, 12B, 27B
| 131,072
| All models trained with distillation. Post-training focuses on math, coding, chat, instruction following, and multilingual (supports 140 languages). Capable of function calling. 1B is not capable of vision.
| Gemma 4
| 2026-04-02
| 31B, 26B A4B, 12B, 4B, ~2B
| 128K (edge)256K (larger)
| Yes (vision, audio)
| Apache 2.0
| The 31B and 26B A4B models are not capable of audio.
Note: open-weight models can have their context length rescaled at inference time. With Gemma 1, Gemma 2, PaliGemma, and PaliGemma 2, the cost is a linear increase of kv-cache size relative to context window size. With Gemma 3, there is an improved growth curve due to the separation of local and global attention. With RecurrentGemma, the memory use is unchanged after 2,048 tokens.
- List of large language models
- Lists of open-source artificial intelligence software
- Official website