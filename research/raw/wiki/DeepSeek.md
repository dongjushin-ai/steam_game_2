Source: https://en.wikipedia.org/wiki/DeepSeek
DeepSeek - Wikipedia
Hangzhou DeepSeek Artificial Intelligence Basic Technology Research Co., Ltd.,[a] doing business as DeepSeek,[b] is a Chinese artificial intelligence (AI) company that develops open weights large language models (LLMs). Based in Hangzhou, Zhejiang, DeepSeek is owned and funded by High-Flyer, a Chinese hedge fund.

## Background
DeepSeek was founded in July 2023 by Liang Wenfeng. The company launched an eponymous chatbot alongside its DeepSeek-R1 model in January 2025.
DeepSeek's models are open-weight, meaning that the exact parameters are openly shared, but the training data is not openly licensed. Since January 2025, DeepSeek has released its models under free and open-source software licenses. The company reportedly recruits AI researchers from top Chinese universities and hires from outside traditional computer science fields to broaden its models' knowledge and capabilities. DeepSeek is considered more closely linked to China's defense industry due to previous affiliations of its researchers and its chatbot's adoption for non-combat roles by the People's Liberation Army since March 2025.

## History

## Pre-founding years
In June 2015, the hedge fund High-Flyer was co-founded by Liang Wenfeng. By 2021, Liang had started buying large quantities of Nvidia GPUs for an AI project, reportedly obtaining 10,000 Nvidia A100 GPUs before the United States restricted chip sales to China. Fewer than 5 Chinese tech companies owned more than 10,000 GPUs.

## Founding
On 14 April 2023, High-Flyer announced the launch of an artificial general intelligence (AGI) research lab, stating that the new lab would focus on developing AI tools unrelated to the firm's financial business. Two months later, on 17 July 2023, that lab was spun off into an independent company. That lab was named DeepSeek, with High-Flyer as its principal investor and backer. Initially, venture capital investors were reluctant to provide funding, as they considered it unlikely that the venture would be able to quickly generate an exit (an ownership stake in an investment).

## Company operation
DeepSeek is headquartered in Hangzhou, Zhejiang, and is owned and funded by High-Flyer. Its co-founder, Liang Wenfeng, serves as CEO. As of May 2024, Liang personally held an 84% stake in DeepSeek through two shell corporations.[note 1] In February 2026, Anthropic accused DeepSeek of using thousands of fraudulent accounts to generate millions of conversations with Claude to train its own LLMs. In April 2026, investors began speaking with DeepSeek for a $300 million funding round, which would bring DeepSeek to a total valuation of $10 billion.[needs update] DeepSeek completed a May 2026 Series A round receiving US$7 billion, reaching a post-money valuation of US$52 billion. In July 2026, Bloomberg and the Financial Times reported the company had begun preparations for an IPO that would see it list as soon as 2027. The same month, it began another discussion targeting a US$70 billion pre-money valuation.
Due to its open weight framework, DeepSeek models have been hosted natively by cloud providers including Microsoft Azure and Perplexity AI.

## Strategy
DeepSeek has stated that it focuses on research and does not have immediate plans for commercialization. This posture also means it can skirt certain provisions of China's AI regulations aimed at consumer-facing technologies.[needs update][original research?]
DeepSeek operates with a relaxed, academic research-style workplace culture that deliberately avoids China’s "996" overtime practices. Founder Liang Wenfeng structured the company to eliminate rigid Key Performance Indicators (KPIs) and mandatory overtime, allowing significant time for unstructured research and creative exploration.
DeepSeek's hiring approach emphasizes skills over lengthy work experience, resulting in many hired after completing university. The company likewise recruits individuals without computer science backgrounds to expand the range of expertise incorporated into the models, for instance in poetry or advanced mathematics. According to The New York Times, dozens of DeepSeek researchers have or have previously had affiliations with People's Liberation Army laboratories and the Seven Sons of National Defence. Since 2025, its chatbot was adopted in non-combat roles by the People's Liberation Army, including hospitals, the People's Armed Police paramilitary, and national mobilization organizations.
Due to U.S. chip restrictions, DeepSeek has continuously refined its algorithms to maximize computational efficiency, leveraging older hardware and reducing energy consumption.: 19
DeepSeek also expanded into Africa, offering more affordable and less power-hungry AI solutions. The company has bolstered African language models and generated a number of startups, for example in Nairobi. Along with Huawei's storage and cloud computing services, the impact on the tech scene in sub-Saharan Africa is considerable. DeepSeek offers local data sovereignty and more flexibility compared to Western AI platforms.

## Training framework
High-Flyer/DeepSeek had operated at least two primary computing clusters: Fire-Flyer and Fire-Flyer 2. Fire-Flyer 1 was constructed in 2019 and was retired after 1.5 years of operation. Fire-Flyer 2 is still in operation as of 2025. Fire-Flyer 2 consists of co-designed software and hardware architecture. On the hardware side, Nvidia GPUs use 200 Gbps interconnects. The cluster is divided into two zones, and the platform supports cross-zone tasks. The network topology consisted of two fat trees, chosen for their high bisection bandwidth. On the software side, there are:
- 3FS (Fire-Flyer File System): A distributed parallel file system designed for asynchronous random reads. It uses Direct I/O and RDMA Read. In contrast to standard Buffered I/O, Direct I/O does not cache data. Caching is useless in this case, since each piece of data read is random and is not reused.
- hfreduce: Library for asynchronous communication, originally designed to replace Nvidia Collective Communication Library (NCCL). It is mainly used for allreduce, especially of gradients during backpropagation. It runs asynchronously on the CPU to avoid blocking kernels on the GPU. It uses two-tree broadcast like NCCL.
- hfai.nn: Software library of commonly used operators for neural network training, similar to torch.nn in PyTorch.
- HaiScale Distributed Data Parallel (DDP): Parallel training library that implements various forms of parallelism such as data parallelism (DP), pipeline parallelism (PP), tensor parallelism (TP), experts parallelism (EP), fully sharded data parallel (FSDP) and zero redundancy optimizer (ZeRO). It is similar to PyTorch DDP, which uses NCCL on the backend.
- HAI Platform: Various applications such as task scheduling, fault handling, and disaster recovery.
As of 2022, Fire-Flyer 2 had 5,000 PCIe A100 GPUs in 625 nodes, each containing 8 GPUs.

## DeepSeek Harness
| This section needs expansion. You can help by adding missing information. (August 2026)
DeepSeek Harness is an open-source AI agent harness developed by DeepSeek. It provides an environment for building and running AI agents, with components including models, tools, skills, sessions, sandboxes, storage, scheduling, and user interfaces. The software uses Cordis plugin architecture and is distributed under the MIT License. As of August 2026, DeepSeek Harness is available as a developer preview.

## Plugin architecture
DeepSeek Harness uses an "everything-is-a-plugin" design philosophy powered by the Cordis framework. This allows major agent components to be added, removed, or reloaded while the software is running. The modular design enables developers to switch between third-party providers or alternative model configurations without changing the rest of the system.

## Model releases
| This section needs expansion. You can help by adding missing information. (July 2026)
On 21 August 2025, DeepSeek released DeepSeek V3.1 under the MIT License. This model features a hybrid architecture with thinking and non-thinking modes. It also surpasses prior models like V3 and R1, by over 40% on certain benchmarks like SWE-bench and Terminal-bench. It was updated to V3.1-Terminus on 22 September 2025, which fixed multiple language artifacts and improved in intelligence in general.
DeepSeek V3.2-Exp was released on 29 September 2025. It uses DeepSeek Sparse Attention, a more efficient attention mechanism based on previous research published in February. It was based on DeepSeek V3.1 Terminus. DeepSeek-V3.2 was released on 1 December 2025, alongside a DeepSeek-V3.2-Speciale variant that focused on reasoning.

## R1 series
On 20 January 2025, DeepSeek launched the DeepSeek-R1 model, which was free for iOS and Android. By 27 January, DeepSeek surpassed ChatGPT as the most downloaded freeware app on the iOS App Store in the United States, triggering an 18% drop in Nvidia's share price.
On 28 May 2025, DeepSeek released DeepSeek-R1-0528 under the MIT License, which was a minor update upon R1. Its scores have also exceeded both DeepSeek R1 (January) and DeepSeek V3-0324 in certain benchmarks.

## V4 series
On 24 April 2026, DeepSeek released a preview of its V4 series, including the 284-billion parameter DeepSeek-V4-Flash and the 1.6-trillion parameter DeepSeek-V4-Pro. Both feature a one million token context window, under the MIT License. V4 has been adopted by semiconductor manufacturers such as Huawei and Cambricon Technologies. The official versions of DeepSeek V4-Flash and V4-Pro were released on 31 July and 13 August, respectively. V4.1-Flash, which was made available on 10 September 2026, introduced a "causal encoder-decoder" system and had lower memory usage compared to previous versions, according to DeepSeek.

## List of models
| Base (pretrained)Instruct (with instruction-finetuned)
| The architecture is essentially the same as Llama.[original research?]
| Developed Group Relative Policy Optimization (GRPO), a variant of Proximal Policy Optimization (PPO).
| DeepSeek-V2, DeepSeek-V2-ChatDeepSeek-V2-Lite, DeepSeek-V2-Lite-ChatDeepSeek-Coder-V2DeepSeek-V2.5
| Developed multi-head latent attention (MLA). Also used MoE. Implemented KV caching.
| DeepSeek-V3-BaseDeepSeek-V3 (a chat model)
| The architecture is essentially the same as V2. Updated on 24 March 2025.[original research?]
| DeepSeek-Prover-V2-671BDeepSeek-Prover-V2-7B
| Preview version, only accessed through API and a chat interface.
| DeepSeek-R1DeepSeek-R1-ZeroDeepSeek-R1-0528
| Initialized from DeepSeek-V3-Base and sharing the V3 architecture.
| Initialized from other models, such as Llama, Qwen, etc. Distilled from data synthesized by R1 and R1-Zero.
| DeepSeek-V3.1-BaseDeepSeek-V3.1 (a chat model)
| Hybrid architecture (thinking and non-thinking modes available). Trained on over 800B additional tokens on top of V3.
| Reducing instances of mixed Chinese-English text and occasional abnormal characters on top of V3.1.
| Preview release on 24 April. Official release of V4-Flash on 31 July, and V4-Pro on 13 August

## Legal status
In the United States, the National Defense Authorization Act for Fiscal Year 2026 instructs the United States Secretary of Defense and the Director of National Intelligence to remove and exclude any artificial intelligence developed by DeepSeek or owned by HighFlyer from devices operated by the United States Department of Defense and United States Intelligence Community or their contractors. Artificial intelligence by DeepSeek is only allowed with explicit permissions for research, training, and evaluation or military activities supporting national security functions such as counterterrorism or counterintelligence.
In Australia, the Department of Home Affairs issued a government-wide directive "to prevent the use or installation of DeepSeek products, applications and web services and where found remove all existing instances of DeepSeek products, applications and web services from all Australian Government systems and devices."
- Free and open-source software portal
- Business portal
- China portal
- Artificial intelligence industry in China
- List of AI-assisted software development tools
- List of LLMs
- Lists of open-source artificial intelligence software
- Reasoning model – Large language model designed for reasoning tasks
- Six Little Dragons – Informal group of Chinese tech startups
- Zhejiang University – Public university in Hangzhou, Zhejiang, China
- Official website
- DeepSeek on GitHub
- DeepSeek on Hugging Face
- Official API documentation
- Anthology of DeepSeek papers
- Research blog of High-Flyer