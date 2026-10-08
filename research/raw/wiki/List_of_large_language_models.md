Source: https://en.wikipedia.org/wiki/List_of_large_language_models
List of large language models - Wikipedia
| This article needs more citations. Please help improve this article by adding citations to reliable sources. Unsourced material may be challenged and removed.Find sources: "List of large language models" – news · newspapers · books · scholar · JSTOR (February 2026) (Learn how and when to remove this message)
A large language model (LLM) is a type of machine learning model designed for natural language processing tasks such as language generation. LLMs are language models with many parameters, and are trained with self-supervised learning on a vast amount of text.

## List
For the training cost column, 1 petaFLOP-day equals 1 petaFLOP/sec × 1 day, or 8.64×1019 FLOP (floating point operations). Only the cost of the largest model is shown. The number of parameters is measured in billions,[a] and the training cost is measured in petaFLOP-days.

## 2018
| .mw-parser-output .hidden-begin{box-sizing:border-box;width:100%;padding:5px;border:none;font-size:95%}.mw-parser-output .hidden-title{font-weight:bold;line-height:1.6;text-align:left}.mw-parser-output .hidden-content{text-align:left}@media all and (max-width:500px){.mw-parser-output .hidden-begin{width:auto!important;clear:none!important;float:none!important}} First GPT model, decoder-only transformer. Trained for 30 days on 8 P600 GPUs.
| An early and influential language model. Encoder-only and thus not built to be prompted or generative. Training took 4 days on 64 TPUv2 chips.

## 2019
| Base model for Google projects like Imagen.
| An alternative to BERT; designed as encoder-only. Trained on 512 TPU v3 chips for 5.5 days.

## 2020
| A fine-tuned variant of GPT-3, termed GPT-3.5, was made available to the public through ChatGPT in 2022.

## 2021
| The first of a series of free GPT-3 alternatives released by EleutherAI. GPT-Neo outperformed an equivalent-size GPT-3 model on some benchmarks, but was significantly worse than the largest GPT-3.
| Its technical report says the model is the "first discovery on near 100B-scale non-English LM" by "constructing a large Korean-centric corpus of 560B tokens."
| Trained for 3 months on over 2000 A100 GPUs on the NVIDIA Selene Supercomputer, for over 3 million GPU-hours.
| Fine-tuned for desirable behavior in conversations.

## 2022
| LaMDA (Language Models for Dialog Applications)
| Trained for ~60 days on ~6000 TPU v4 chips.
| GPT-3 architecture with some adaptations from Megatron. The training logbook written by the team was published. The smaller models including 66B are publicly available, while the 175B model is available on request.
| 38.5B tokens from webpages filtered for math content and from arXiv
| For solving "mathematical and scientific questions using step-by-step reasoning".

## 2023
| Facebook's license and distribution scheme restricted access to approved researchers, but the model weights were leaked and became widely available.
| Fine-tuned from LLaMA 7B on instruction-following demonstrations generated using OpenAI's text-davinci-003.
| 1T tokens, from RefinedWeb (filtered web text corpus) plus some "curated corpora".
| 363B tokens from Bloomberg's proprietary data sources, plus 345B tokens from general purpose datasets
| Fine-tuned from LLaMA on user-shared conversations collected from ShareGPT.
| Trained over 3.3 million GPU (A100) hours.
| Used in the Claude chatbot. Has a context window of 200,000 tokens, or ~500 pages.
| Used in the Grok chatbot. Grok 1 has a context length of 8,192 tokens and has access to X (Twitter).
| Multimodal model, comes in three sizes. Used in the chatbot of the same name.
| Outperforms GPT-3.5 and Llama 2 70B on many benchmarks. Mixture of experts model, with 12.9 billion parameters activated per token.
| Trained on English and Chinese text. Used 1024 training FLOPs for 67B model, 10b FLOPs for 7B.: figure 5
| Trained on real and synthetic "textbook-quality" data over 14 days on 96 A100 GPUs.

## 2024
| Multimodal model based on a MoE architecture. Context window above 1 million tokens.
| Includes three models: Haiku, Sonnet, and Opus.
| Fujitsu, Tokyo Institute of Technology, Tohoku University, RIKEN, etc.
| The largest model ever trained on CPU-only, on the Fugaku supercomputer; the model was trained from scratch on 380 billion tokens using 13,824 Fugaku nodes.
| Marketed by Microsoft as a "small language model".
| Trained for 1 epoch. Trained on 6144 H100 GPUs between December 2023 and May 2024.
| Initially, only one model, Sonnet, was released. In October 2024, Sonnet 3.5 was upgraded, and Haiku 3.5 became available.
| 405B version took 31 million hours on H100-80GB, at 3.8E25 FLOPs.
| Originally closed-source, then re-released as "Grok 2.5" under a source-available license in August 2025.
| First LLM described as a "reasoning model".[better source needed]
| Upgraded over time. The latest version is 24.11.
| Multimodal. There is also a 12B version which is under Apache 2 license.
| Marketed by Microsoft as a "small language model".
| Used 2.788M training hours on H800 GPUs. Originally released under the DeepSeek License, then re-released under the MIT License as "DeepSeek-V3-0324" in March 2025.
| Includes three models: Nova Micro, Nova Lite, and Nova Pro.

## 2025
| No pretraining; reinforcement-learned upon V3-Base.
| 7 dense models with parameter counts from 0.5B to 72B. Alibaba also released 2 MoE variants.
| Three models released: Flash, Flash-Lite and Pro.
| Training cost claimed to be "10x the compute of previous state-of-the-art models".
| OpenAI's largest non-reasoning model at the time.
| Three models released: Flash, Flash-Lite and Pro.
| Multiple sizes, the smallest being 0.6B.
| Hybrid reasoning model fine-tuned on Mistral Small base; optimized for math, programming, and Indian languages.
| Corpus is "focus[ed] on India’s linguistic landscape".
| Released in 355B and 106B sizes. Corpus size was calculated by combining the 15 trillion tokens and the 7 trillion tokens pre-training mix.
| Includes three models: GPT-5, GPT-5 mini, and GPT-5 nano. GPT-5 is available in ChatGPT and API. It includes reasoning abilities.
| Corpus size based on DeepSeek V3 (trained on 14.8T tokens); further trained on 839B tokens from the extension phases (630B + 209B). A hybrid model that can switch between thinking and non-thinking modes.
| The first LLM to be compliant with the Artificial Intelligence Act of the European Union.
| Includes 7B and 32B parameter versions, alongside reasoning and instruction-following models.
| Uses a custom DeepSeek Sparse Attention (DSA) mechanism
| It was able to solve an open problem in statistical learning theory that had previously remained unresolved by human researchers.

## 2026
| Proprietary reasoning model with adaptive tool-use, test-time scaling, and iterative self-reflection.
| Multimodal MoE with 32B active parameters, derived from Kimi K2. Can use "Agent Swarm" technology to coordinate up to 100 parallel sub-agents.
| MoE model with 11B active parameters out of 196B total
| Mixture-of-experts model, successor of Param-1; many more Indic languages are supported. Trained on H100 GPUs for 24 days.
| India's first independently-trained foundation model; has 105B and 30B versions. Based on mixture-of-experts model, using only 10.3B active parameters at a time. Interprets Indic languages and Hinglish. An early checkpoint of the model was released in January.
| MoE model with 6B active parameters out of 119B total
| Mixture-of-experts (MoE) model with more than 1 trillion parameters (43 billion active). Designed for agentic scenarios. Initially available on OpenRouter under the codename "Hunter Alpha" before official release.
| Released in 31B, 26B A4B (3.8B active parameters), E4B (4B effective parameters), and E2B variants
| MoE model with 3B active parameters out of 35B total
| Mixture-of-experts model with 21B active parameters and a 256K-token context window. Preview predecessor to Hy3.
| MoE model designed for agentic coding and long-horizon software engineering tasks.
| Omni-modal MoE model with agentic capabilities and 1M-token context.
| Mistral AI's flagship model that merges instruction-following, reasoning, and coding into a single 128B dense model
| Agentic coding model available in the Cursor IDE. Built on Kimi K2.5 with additional reinforcement learning; reported 1T total / 32B active parameters.
| Parameter count is 196B (base) + 1.8B (ViT).
| 48B active parameters. Preview version previously released as "Owl Alpha" on OpenRouter.
| Frontier model for coding, agentic tasks, and knowledge work; trained alongside Cursor. Public availability followed on 9 July 2026.
| Coding model for the Devin agent; trained from a Kimi K2.7 base with Cognition's reinforcement-learning pipeline. Available via Devin (not as open weights).
| 104B active parameters. Weights released on 27 July.
| Available in 2.4T (95B active parameters) and 27B variants. Preview of Qwen3.8-Max (proprietary variant with image input) was released on 19 July. Weights for 2.4T variant released on 12 August. 27B variant released on 14 August.
| 13.2B active parameters. Preview release on 21 July. Official version and weights released on 13 August.
| Upgraded Fugu-Ultra with stronger coding, agentic, and reasoning benchmarks vs v1.0.
| 13B active parameters. Preview released on 24 April 2026. Official release on 31 July 2026.
| 49B active parameters. Preview released on 24 April 2026. Official release on 13 August 2026.
| 8B (prefill) and 16B (decode) active parameters.
| Native omni-modal models released as part of the MiMo-V2.6 series.
- Comparison of deep learning software
- Comparison of machine learning software
- List of AI-assisted software development tools
- List of chatbots
- List of language model benchmarks
- OpenRouter – LLM gateway to multiple AI providers
- Open weights
- Small language model
- Language