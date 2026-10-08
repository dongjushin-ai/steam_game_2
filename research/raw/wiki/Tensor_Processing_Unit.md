Source: https://en.wikipedia.org/wiki/Tensor_Processing_Unit
Tensor Processing Unit - Wikipedia
The Tensor Processing Unit (TPU) is a neural processing unit (NPU) application-specific integrated circuit (ASIC) developed by Google for neural network machine learning. Tensorflow, Jax, and PyTorch are supported frameworks for TPU. Google began using TPUs internally in 2015, and in 2018 made them available for third-party use, both as part of its cloud infrastructure and by offering a smaller version of the chip for sale. Currently, Google Cloud generates product revenues primarily from the sale of TPU systems.

## Comparison of TPUs and GPUs
Compared to a graphics processing unit, TPUs are designed for a high volume of low precision computation (e.g. as little as 8-bit precision) with more input/output operations per joule, without hardware for rasterisation or texture mapping. The TPU ASICs are mounted in a heatsink assembly, which can fit in a hard drive slot within a data center rack, according to Norman Jouppi.
Different types of processors are suited for different types of machine learning models. TPUs are well suited for convolutional neural networks (CNNs), while GPUs have benefits for some fully connected neural networks, and CPUs can have advantages for recurrent neural networks (RNNs). In workflows using transformer-based neural networks for LLMs, TPUs are often used for inference and GPUs for training.

## History
In 2013, Google recruited Amir Salek to establish custom silicon development capabilities for the company's datacenters. As founder and head of Custom Silicon for Google Technical Infrastructure and Google Cloud, Salek led the development of the original TPU (Google's first production chip), TPUv2 (the industry's first production deep-learning training chip), TPUv3, TPUv4, Edge-TPU, and additional silicon products including the VCU, IPU, and OpenTitan. According to Jonathan Ross, one of the original TPU engineers, and later the founder of Groq, three separate groups at Google were developing AI accelerators, with the TPU, a systolic array, being the design that was ultimately selected. The TPU shares a genealogy with systolic array systems including the WARP.
Norman P. Jouppi served as the tech lead and principal architect for Google's Tensor Processing Unit development, leading the rapid design, verification, and deployment of the first TPU to production in just 15 months. As lead author of the seminal 2017 paper "In-Datacenter Performance Analysis of a Tensor Processing Unit," presented at the 44th International Symposium on Computer Architecture (ISCA 2017), Jouppi demonstrated that the TPU achieved 15–30× higher performance and 30–80× higher performance-per-watt than contemporary CPUs and GPUs, establishing the TPU as a foundational platform for neural network inference at scale across Google's production services.
The tensor processing unit was announced in May 2016 at the Google I/O conference, when the company said that the TPU had been used inside their data centers for over a year. Google's 2017 paper describing its creation cites previous systolic matrix multipliers of similar architecture built in the 1990s. The chip was specifically designed for Google's TensorFlow framework, a symbolic math library used for machine learning applications such as neural networks. However, as of 2017 Google still used CPUs and GPUs for other types of machine learning. Other AI accelerator designs are appearing from other vendors also and are aimed at embedded and robotics markets.
Google's TPUs are proprietary. Some models are commercially available, and on February 12, 2018, The New York Times reported that Google "would allow other companies to buy access to those chips through its cloud-computing service." Google has said that they were used in the AlphaGo versus Lee Sedol series of human-versus-machine Go games, as well as in the AlphaZero system, which produced chess, shogi and go playing programs from the game rules alone and went on to beat the leading programs in those games. Google has also used TPUs for Google Street View text processing and was able to find all the text in the Street View database in less than five days. In Google Photos, an individual TPU can process over 100 million photos a day. It is also used in RankBrain which Google uses to provide search results.
Google provides third parties access to TPUs through its Cloud TPU service as part of the Google Cloud Platform and through its notebook-based services Kaggle and Colaboratory.
Broadcom is a co-developer of TPUs, translating Google's architecture and specifications into manufacturable silicon. It provides proprietary technologies such as SerDes high-speed interfaces, overseeing ASIC design, and managing chip fabrication and packaging through third-party foundries like Taiwan Semiconductor Manufacturing Company (TSMC), covering all generations since the program's inception.
In September 2025, Google is in talks with several "neoclouds," including Crusoe and CoreWeave, about deploying TPU in their datacenter. In November 2025, Meta is in talks with Google to deploy TPUs in its AI datacenters.

## Products
| Computational performance (trillion operations per second)
393 (int8)
918 (int8)
1836 (int8)
10100 (v8i fp4)

## First generation TPU
The first-generation TPU is an 8-bit matrix multiplication engine, driven with CISC instructions by the host processor across a PCIe 3.0 bus. It is manufactured on a 28 nm process with a die size ≤ 331 mm2. The clock speed is 700 MHz and it has a thermal design power of 28–40 W. It has 28 MiB of on chip memory, and 4 MiB of 32-bit accumulators taking the results of a 256×256 systolic array of 8-bit multipliers. Within the TPU package is 8 GiB of dual-channel 2133 MHz DDR3 SDRAM offering 34 GB/s of bandwidth. Instructions transfer data to or from the host, perform matrix multiplications or convolutions, and apply activation functions.

## Second generation TPU
The second-generation TPU was announced in May 2017. Google stated the first-generation TPU design was limited by memory bandwidth and using 16 GB of High Bandwidth Memory in the second-generation design increased bandwidth to 600 GB/s and performance to 45 teraFLOPS. The TPUs are then arranged into four-chip modules with a performance of 180 teraFLOPS. Then 64 of these modules are assembled into 256-chip pods with 11.5 petaFLOPS of performance. Notably, while the first-generation TPUs were limited to integers, the second-generation TPUs can also calculate in floating point, introducing the bfloat16 format invented by Google Brain. This makes the second-generation TPUs useful for both training and inference of machine learning models. Google has stated these second-generation TPUs will be available on the Google Compute Engine for use in TensorFlow applications.

## Third generation TPU
The third-generation TPU was announced on May 8, 2018. Google announced that processors themselves are twice as powerful as the second-generation TPUs, and would be deployed in pods with four times as many chips as the preceding generation. This results in an 8-fold increase in performance per pod (with up to 1,024 chips per pod) compared to the second-generation TPU deployment.

## Fourth generation TPU
On May 18, 2021, Google CEO Sundar Pichai spoke about TPU v4 Tensor Processing Units during his keynote at the Google I/O virtual conference. TPU v4 improved performance by more than 2x over TPU v3 chips. Pichai said "A single v4 pod contains 4,096 v4 chips, and each pod has 10x the interconnect bandwidth per chip at scale, compared to any other networking technology.” An April 2023 paper by Google claims TPU v4 is 5–87% faster than a Nvidia A100 at machine learning benchmarks.
There is also an "inference" version, called v4i, that does not require liquid cooling.

## Fifth generation TPU
In 2021, Google revealed the physical layout of TPU v5 is being designed with the assistance of a novel application of deep reinforcement learning. Google claims TPU v5 is nearly twice as fast as TPU v4, and based on that and the relative performance of TPU v4 over A100, some speculate TPU v5 as being as fast as or faster than an H100.
Similar to the v4i being a lighter-weight version of the v4, the fifth generation has a "cost-efficient" version called v5e. In December 2023, Google announced TPU v5p which is claimed to be competitive with the Nvidia H100.

## Sixth generation TPU
In May 2024, at the Google I/O conference, Google announced Trillium, which became available in preview in October 2024. Google claimed a 4.7 times performance increase relative to TPU v5e, via larger matrix multiplication units and an increased clock speed. High bandwidth memory (HBM) capacity and bandwidth have also doubled. A pod can contain up to 256 Trillium units.

## Seventh generation TPU
In April 2025, at Google Cloud Next conference, Google unveiled TPU v7. This new chip, called Ironwood, will come in two configurations: a 256-chip cluster and a 9,216-chip cluster. Ironwood will have a peak computational performance rate of 4,614 TFLOP/s.

## Eighth generation TPU
On April 22, 2026, Google announced the eighth generation of its Tensor Processing Units, consisting of two specialized chips: the TPU 8t and the TPU 8i. This marks the first time Google has bifurcated its TPU architecture into separate training and inference-optimized designs. Both chips are hosted on Google's custom Arm-based Axion CPUs and utilize 4th-generation liquid cooling.

## TPU 8t
The TPU 8t ("Training") is optimized for large-scale pre-training of frontier models and embedding-heavy workloads. It delivers 12.6 FP4 PFLOPs of peak performance and features 216 GB of HBM3e memory with 6,528 GB/s bandwidth. It uses the Virgo Network fabric, allowing it to scale up to 9,600 chips per "superpod," delivering 121 FP4 ExaFLOPs of compute performance.

## TPU 8i
The TPU 8i ("Inference") is designed for high-speed serving, AI agents, and long-context reasoning. It delivers 10.1 FP4 PFLOPs of peak performance and features 288 GB of HBM3e memory with 8,601 GB/s bandwidth. It includes 384 MB of on-chip SRAM, a three-fold increase over the previous generation. The TPU 8i introduces a "Boardfly" network topology and a Collectives Acceleration Engine (CAE) which reduces synchronization latency by five times.

## Edge TPU
In July 2018, Google announced the Edge TPU. The Edge TPU is Google's purpose-built ASIC chip designed to run machine learning (ML) models for edge computing, meaning it is much smaller and consumes far less power compared to the TPUs hosted in Google datacenters (also known as Cloud TPUs). In January 2019, Google made the Edge TPU available to developers with a line of products under the Coral brand. The Edge TPU is capable of 4 trillion operations per second with 2 W of electrical power.
The product offerings include a single-board computer (SBC), a system on module (SoM), a USB accessory, a mini PCI-e card, and an M.2 card. The SBC Coral Dev Board and Coral SoM both run Mendel Linux OS – a derivative of Debian. The USB, PCI-e, and M.2 products function as add-ons to existing computer systems, and support Debian-based Linux systems on x86-64 and ARM64 hosts (including Raspberry Pi).
The machine learning runtime used to execute models on the Edge TPU is based on TensorFlow Lite. The Edge TPU is only capable of accelerating forward-pass operations, which means it's primarily useful for performing inferences (although it is possible to perform lightweight transfer learning on the Edge TPU). The Edge TPU also only supports 8-bit math, meaning that for a network to be compatible with the Edge TPU, it needs to either be trained using the TensorFlow quantization-aware training technique, or since late 2019 it's also possible to use post-training quantization.
On November 12, 2019, Asus announced a pair of single-board computer (SBCs) featuring the Edge TPU. The Asus Tinker Edge T and Tinker Edge R Board designed for IoT and edge AI. The SBCs officially support Android and Debian operating systems. ASUS has also demonstrated a mini PC called Asus PN60T featuring the Edge TPU.
On January 2, 2020, Google announced the Coral Accelerator Module and Coral Dev Board Mini, to be demonstrated at CES 2020 later the same month. The Coral Accelerator Module is a multi-chip module featuring the Edge TPU, PCIe and USB interfaces for easier integration. The Coral Dev Board Mini is a smaller single-board computer (SBC) featuring the Coral Accelerator Module and MediaTek 8167s SoC.

## Pixel Neural Core
On October 15, 2019, Google announced the Pixel 4 smartphone, which contains an Edge TPU called the Pixel Neural Core. Google described it as "customized to meet the requirements of key camera features in Pixel 4", using a neural network search that sacrifices some accuracy in favor of minimizing latency and power use.

## Google Tensor
Google followed the Pixel Neural Core by integrating an Edge TPU into a custom system-on-chip named Google Tensor, which was released in 2021 with the Pixel 6 line of smartphones. The Google Tensor SoC demonstrated "extremely large performance advantages over the competition" in machine learning-focused benchmarks; although instantaneous power consumption also was relatively high, the improved performance meant less energy was consumed due to shorter periods requiring peak performance.

## Lawsuit
In 2019, Singular Computing, founded in 2009 by Joseph Bates, a visiting professor at MIT, filed suit against Google alleging patent infringement in TPU chips. By 2020, Google had successfully lowered the number of claims the court would consider to just two: claim 53 of .mw-parser-output .citation{word-wrap:break-word}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}US 8407273 filed in 2012 and claim 7 of US 9218156 filed in 2013, both of which claim a dynamic range of 10−6 to 106 for floating point numbers, which the standard float16 cannot do (without resorting to subnormal numbers) as it only has five bits for the exponent. In a 2023 court filing, Singular Computing specifically called out Google's use of bfloat16, as that exceeds the dynamic range of float16. Singular Computing claims non-standard floating point formats were non-obvious in 2009, but Google retorts that the VFLOAT format, with a configurable number of exponent bits, existed as prior art in 2002. By January 2024, subsequent lawsuits by Singular Computing had brought the number of patents being litigated up to eight. Towards the end of the trial later that month, Google agreed to a settlement with undisclosed terms.
- AI accelerator
- AI datacenter
- Cognitive computer
- Google Colab—Python online IDE that can utilize TPUs via the cloud
- Tensor Core—similar architecture by Nvidia
- TrueNorth—similar device simulating spiking neurons instead of low-precision tensors
- Vision processing unit—similar device specialised for vision processing
- Cloud Tensor Processing Units (TPUs) (Documentation from Google Cloud)
- Photo of Google's TPU chip and board
- Photo of Google's TPU v2 board. Archived 2021-08-09 at the Wayback Machine
- Photo of Google's TPU v3 board. Archived 2021-03-08 at the Wayback Machine
- Photo of Google's TPU v2 pod. Archived 2021-08-09 at the Wayback Machine