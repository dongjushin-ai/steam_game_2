Source: https://en.wikipedia.org/wiki/Ampere_(microarchitecture)
Ampere (microarchitecture) - Wikipedia
Ampere is the codename for a graphics processing unit (GPU) microarchitecture developed by Nvidia as the successor to both the Volta and Turing architectures. It was officially announced on May 14, 2020, and is named after French mathematician and physicist André-Marie Ampère.
Nvidia announced the Ampere architecture GeForce 30 series consumer GPUs at a GeForce Special Event on September 1, 2020. Nvidia announced the A100 80 GB GPU at SC20 on November 16, 2020. Mobile RTX graphics cards and the RTX 3060 based on the Ampere architecture were revealed on January 12, 2021.
Nvidia announced Ampere's successor, Hopper, at GTC 2022, and "Ampere Next Next" (Blackwell) for a 2024 release at GPU Technology Conference 2021.

## Details
Architectural improvements of the Ampere architecture include the following:
- CUDA Compute Capability 8.0 for A100 and 8.6 for the GeForce 30 series
- TSMC's 7 nm FinFET process for A100
- Custom version of Samsung's 8 nm process (8N) for the GeForce 30 series
- Third-generation Tensor Cores with FP16, bfloat16, TensorFloat-32 (TF32) and FP64 support and sparsity acceleration. The individual Tensor cores have with 256 FP16 FMA operations per clock 4x processing power (GA100 only, 2x on GA10x) compared to previous Tensor Core generations; the Tensor Core Count is reduced to one per SM.
- Second-generation ray tracing cores; concurrent ray tracing, shading, and compute for the GeForce 30 series
- High Bandwidth Memory 2 (HBM2) on A100 40 GB & A100 80 GB
- GDDR6X memory for GeForce RTX 3090, RTX 3080 Ti, RTX 3080, RTX 3070 Ti
- Double FP32 cores per SM on GA10x GPUs
- NVLink 3.0 with a 50 Gbit/s per pair throughput
- PCI Express 4.0 with SR-IOV support (SR-IOV is reserved only for A100)
- Multi-instance GPU (MIG) virtualization and spatial GPU partitioning feature in A100 supporting up to seven instances
- PureVideo feature set K hardware video decoding with AV1 hardware decoding for the GeForce 30 series and feature set J for A100
- 5 NVDEC for A100
- Adds new hardware-based 5-core JPEG decode (NVJPG) with YUV420, YUV422, YUV444, YUV400, RGBA. Should not be confused with Nvidia NVJPEG (GPU-accelerated library for JPEG encoding/decoding)

## Chips
- GA100
- GA102
- GA103
- GA104
- GA106
- GA107
- GA10B
Comparison of Compute Capability: GP100 vs GV100 vs GA100
| GPU features
| Nvidia Tesla P100
| Nvidia Tesla V100
| Nvidia A100
| GPU codename
| GP100
| GV100
| GA100
| GPU architecture
| Pascal
| Volta
| Ampere
| Compute capability
| 6.0
| 7.0
| 8.0
| Threads / warp
| 32
| 32
| 32
| Max warps / SM
| 64
| 64
| 64
| Max threads / SM
| 2048
| 2048
| 2048
| Max thread blocks / SM
| 32
| 32
| 32
| Max 32-bit registers / SM
| 65536
| 65536
| 65536
| Max registers / block
| 65536
| 65536
| 65536
| Max registers / thread
| 255
| 255
| 255
| Max thread block size
| 1024
| 1024
| 1024
| FP32 cores / SM
| 64
| 64
| 64
| Ratio of SM registers to FP32 cores
| 1024
| 1024
| 1024
| Shared Memory Size / SM
| 64 KB
| Configurable up to 96 KB
| Configurable up to 164 KB
Comparison of Precision Support Matrix
| Supported CUDA Core Precisions
| Supported Tensor Core Precisions
| FP16
| FP32
| FP64
| INT1
| INT4
| INT8
| TF32
| BF16
| FP16
| FP32
| FP64
| INT1
| INT4
| INT8
| TF32
| BF16
| Nvidia Tesla P4
| No
| Yes
| Yes
| No
| No
| Yes
| No
| No
| No
| No
| No
| No
| No
| No
| No
| No
| Nvidia P100
| Yes
| Yes
| Yes
| No
| No
| No
| No
| No
| No
| No
| No
| No
| No
| No
| No
| No
| Nvidia Volta
| Yes
| Yes
| Yes
| No
| No
| Yes
| No
| No
| Yes
| No
| No
| No
| No
| No
| No
| No
| Nvidia Turing
| Yes
| Yes
| Yes
| No
| No
| No
| No
| No
| Yes
| No
| No
| Yes
| Yes
| Yes
| No
| No
| Nvidia A100
| Yes
| Yes
| Yes
| No
| No
| Yes
| No
| Yes
| Yes
| No
| Yes
| Yes
| Yes
| Yes
| Yes
| Yes
Legend:
- FPnn: floating point with nn bits
- INTn: integer with n bits
- INT1: binary
- TF32: TensorFloat32
- BF16: bfloat16
Comparison of Decode Performance
| Concurrent streams
| H.264 decode (1080p30)
| H.265 (HEVC) decode (1080p30)
| VP9 decode (1080p30)
| V100
| 16
| 22
| 22
| A100
| 75
| 157
| 108

## Ampere dies
| Die
| GA100
| GA102
| GA103
| GA104
| GA106
| GA107
| GA10B
| GA10F
| Die size
| 826 mm2
| 628 mm2
| 496 mm2
| 392 mm2
| 276 mm2
| 200 mm2
| 448 mm2
| ?
| Transistors
| 54.2B
| 28.3B
| 22B
| 17.4B
| 12B
| 8.7B
| 21B
| ?
| Transistor density
| 65.6 MTr/mm2
| 45.1 MTr/mm2
| 44.4 MTr/mm2
| 44.4 MTr/mm2
| 43.5 MTr/mm2
| 43.5 MTr/mm2
| 46.9 MTr/mm2
| ?
| Graphics processing clusters
| 8
| 7
| 6
| 6
| 3
| 2
| 2
| 1
| Streaming multiprocessors
| 128
| 84
| 60
| 48
| 30
| 20
| 16
| 12
| CUDA cores
| 8192
| 10752
| 7680
| 6144
| 3840
| 2560
| 2048
| 1536
| Texture mapping units
| 512
| 336
| 240
| 192
| 120
| 80
| 64
| 48
| Render output units
| 192
| 112
| 96
| 96
| 48
| 32
| 32
| 16
| Tensor cores
| 512
| 336
| 240
| 192
| 120
| 80
| 64
| 48
| RT cores
| N/A
| 84
| 60
| 48
| 30
| 20
| 8
| 12
| L1 cache
| 24 MB
| 10.5 MB
| 7.5 MB
| 6 MB
| 3 MB
| 2.5 MB
| 3 MB
| 1.5 MB
| 192 KBper SM
| 128 KB per SM
| 192 KBper SM
| 128 KBper SM
| L2 cache
| 40 MB
| 6 MB
| 4 MB
| 4 MB
| 3 MB
| 2 MB
| 4 MB
| 1 MB

## A100 accelerator and DGX A100
The Ampere-based A100 accelerator was announced and released on May 14, 2020. The A100 features 19.5 teraflops of FP32 performance, 6912 FP32/INT32 CUDA cores, 3456 FP64 CUDA cores, 40 GB of graphics memory, and 1.6 TB/s of graphics memory bandwidth. The A100 accelerator was initially available only in the 3rd generation of DGX server, including 8 A100s. Also included in the DGX A100 is 15 TB of PCIe gen 4 NVMe storage, two 64-core AMD Rome 7742 CPUs, 1 TB of RAM, and Mellanox-powered HDR InfiniBand interconnect. The initial price for the DGX A100 was $199,000.
Starting from P100, to V100, to A100, to H100, to B200 and to R100; the comparison of accelerators used in DGX:

## General & Architecture
| Model
| Architecture
| Socket
| GPU
| Fabrication Process
| Transistor count (billion)
(billion)
| Die size (mm2)
(mm2)
| Launched
| P100
| Pascal
| SXM/SXM2
| GP100
| TSMC 16FF+
| 15.3
| 610
| Q2 2016
| V100 16GB
| Volta
| SXM2
| GV100
| TSMC 12FFN
| 21.1
| 815
| Q3 2017
| V100 32GB
| SXM3
| A100 40GB
| Ampere
| SXM4
| GA100
| TSMC N7
| 54.2
| 826
| Q1 2020
| A100 80GB
| Q4 2020
| H100
| Hopper
| SXM5
| GH100
| TSMC 4N
| 80
| 814
| Q3 2022
| H200
| Q3 2023
| B100
| Blackwell
| SXM6
| GB100
| TSMC 4NP
| 208
| N/A
| Q4 2024
| B200
| R100
| Rubin
| SXM7
| —.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap}N/a
| TSMC 3N
| 338
| —N/a
| H2 2026

## Cores, Clock & Power
| Model
| Boost clock (MHz)
(MHz)
| #SM
| Cores (FP32 CUDA)
(FP32 CUDA)
| Cores (FP64 excl. tensor)
(FP64 excl. tensor)
| Cores (Mixed INT32/FP32)
(Mixed INT32/FP32)
| Cores (INT32)
(INT32)
| TDP (W)
(W)
| P100
| 1480
| 56
| 3584
| 1792
| —N/a
| —N/a
| 300
| V100 16GB
| 1530
| 80
| 5120
| 2560
| N/A
| 5120
| 300
| V100 32GB
| 350
| A100 40GB
| 1410
| 108
| 6912
| 3456
| 6912
| N/A
| 400
| A100 80GB
| H100
| 1980
| 132
| 16896
| 4608
| 16896
| N/A
| 700
| H200
| 1000
| B100
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| 700
| B200
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| 1000
| R100
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| 2300

## Memory & Cache
| Model
| Memory Type (HBM)
(HBM)
| VRAM Size (GB)
(GB)
| Memory Speed (Gb/s)
(Gb/s)
| Bus width (bits)
(bits)
| Bandwidth (TB/s)
(TB/s)
| L1 Cache Per SM (KB)
Per SM (KB)
| L1 Cache Total (KB)
Total (KB)
| L2 Cache (KB)
(KB)
| P100
| HBM2
| 16
| 1.4
| 4096
| 0.72
| 24
| 1344
| 4096
| V100 16GB
| HBM2
| 16
| 1.75
| 4096
| 0.9
| 128
| 10240
| 6144
| V100 32GB
| 32
| A100 40GB
| HBM2
| 40
| 2.4
| 5120
| 1.52
| 192
| 20736
| 40960
| A100 80GB
| HBM2e
| 80
| 3.2
| H100
| HBM3
| 80
| 5.2
| 5120
| 3.35
| 192
| 25344
| 51200
| H200
| HBM3e
| 141
| 6.3
| 6144
| 4.8
| B100
| HBM3e
| 192
| 8
| 8192
| 8
| N/A
| N/A
| N/A
| B200
| R100
| HBM4
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a

## Compute Performance, Interconnect & Networking
| Model
| FP32 (TFLOPS)
(TFLOPS)
| FP64 (TFLOPS)
(TFLOPS)
| INT8 dense tensor
dense tensor
| FP16 dense tensor
dense tensor
| bfloat16 dense tensor
dense tensor
| TF32 dense tensor
dense tensor
| FP64 dense tensor
dense tensor
| Interconnect (NVLink; TB/s)
(NVLink; TB/s)
| Networking
| P100
| 10.6
| 5.3
| —N/a
| 21.2
| —N/a
| —N/a
| —N/a
| 0.16
| ConnectX-4 (100 Gb/s)
(100 Gb/s)
| V100 16GB
| 15.7
| 7.8
| N/A
| 125 TFLOPS
| N/A
| N/A
| N/A
| 0.3
| ConnectX-5 (100 Gb/s)
(100 Gb/s)
| V100 32GB
| A100 40GB
| 19.5
| 9.7
| 624 TOPS
| 312 TFLOPS
| 312 TFLOPS
| 156 TFLOPS
| 19.5 TFLOPS
| 0.6
| ConnectX-6 (200 Gb/s)
(200 Gb/s)
| A100 80GB
| H100
| 67
| 34
| 1.98 POPS
| 990 TFLOPS
| 990 TFLOPS
| 495 TFLOPS
| 67 TFLOPS
| 0.9
| ConnectX-7 (400 Gb/s)
(400 Gb/s)
| H200
| B100
| —N/a
| —N/a
| 3.5 POPS
| 1.98 PFLOPS
| 1.98 PFLOPS
| 989 TFLOPS
| 30 TFLOPS
| 1.8
| ConnectX-7 (400 Gb/s)
(400 Gb/s)
| B200
| —N/a
| —N/a
| 4.5 POPS
| 2.25 PFLOPS
| 2.25 PFLOPS
| 1.2 PFLOPS
| 40 TFLOPS
| R100
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| ConnectX-9 (1600 Gb/s)
(1600 Gb/s)

## Products using Ampere
- GeForce MX series GeForce MX570 (mobile) (GA107)
- GeForce MX570 (mobile) (GA107)
- GeForce 20 series GeForce RTX 2050 (mobile) (GA107)
- GeForce RTX 2050 (mobile) (GA107)
- GeForce 30 series GeForce RTX 3050 Laptop GPU (GA107) GeForce RTX 3050 (GA106 or GA107) GeForce RTX 3050 Ti Laptop GPU (GA107) GeForce RTX 3060 Laptop GPU (GA106) GeForce RTX 3060 (GA106 or GA104) GeForce RTX 3060 Ti (GA104 or GA103) GeForce RTX 3070 Laptop GPU (GA104) GeForce RTX 3070 (GA104) GeForce RTX 3070 Ti Laptop GPU (GA104) GeForce RTX 3070 Ti (GA104 or GA102) GeForce RTX 3080 Laptop GPU (GA104) GeForce RTX 3080 (GA102) GeForce RTX 3080 12 GB (GA102) GeForce RTX 3080 Ti Laptop GPU (GA103) GeForce RTX 3080 Ti (GA102) GeForce RTX 3090 (GA102) GeForce RTX 3090 Ti (GA102)
- GeForce RTX 3050 Laptop GPU (GA107)
- GeForce RTX 3050 (GA106 or GA107)
- GeForce RTX 3050 Ti Laptop GPU (GA107)
- GeForce RTX 3060 Laptop GPU (GA106)
- GeForce RTX 3060 (GA106 or GA104)
- GeForce RTX 3060 Ti (GA104 or GA103)
- GeForce RTX 3070 Laptop GPU (GA104)
- GeForce RTX 3070 (GA104)
- GeForce RTX 3070 Ti Laptop GPU (GA104)
- GeForce RTX 3070 Ti (GA104 or GA102)
- GeForce RTX 3080 Laptop GPU (GA104)
- GeForce RTX 3080 (GA102)
- GeForce RTX 3080 12 GB (GA102)
- GeForce RTX 3080 Ti Laptop GPU (GA103)
- GeForce RTX 3080 Ti (GA102)
- GeForce RTX 3090 (GA102)
- GeForce RTX 3090 Ti (GA102)
- Nvidia Workstation GPUs (formerly Quadro) RTX A1000 (mobile) (GA107) RTX A2000 (mobile) (GA106) RTX A2000 (GA106) RTX A3000 (mobile) (GA104) RTX A4000 (mobile) (GA104) RTX A4000 (GA104) RTX A5000 (mobile) (GA104) RTX A5500 (mobile) (GA103) RTX A4500 (GA102) RTX A5000 (GA102) RTX A5500 (GA102) RTX A6000 (GA102) A800 Active
- RTX A1000 (mobile) (GA107)
- RTX A2000 (mobile) (GA106)
- RTX A2000 (GA106)
- RTX A3000 (mobile) (GA104)
- RTX A4000 (mobile) (GA104)
- RTX A4000 (GA104)
- RTX A5000 (mobile) (GA104)
- RTX A5500 (mobile) (GA103)
- RTX A4500 (GA102)
- RTX A5000 (GA102)
- RTX A5500 (GA102)
- RTX A6000 (GA102)
- A800 Active
- Nvidia Data Center GPUs (formerly Tesla) Nvidia A2 (GA107) Nvidia A10 (GA102) Nvidia A16 (4 × GA107) Nvidia A30 (GA100) Nvidia A40 (GA102) Nvidia A100 (GA100) Nvidia A100 80 GB (GA100) Nvidia A100X NVIDIA A30X
- Nvidia A2 (GA107)
- Nvidia A10 (GA102)
- Nvidia A16 (4 × GA107)
- Nvidia A30 (GA100)
- Nvidia A40 (GA102)
- Nvidia A100 (GA100)
- Nvidia A100 80 GB (GA100)
- Nvidia A100X
- NVIDIA A30X
- Tegra SoCs AGX Orin (GA10B) Orin NX (GA10B) Orin Nano (GA10B) T239 (Nintendo Switch 2, GA10F)
- AGX Orin (GA10B)
- Orin NX (GA10B)
- Orin Nano (GA10B)
- T239 (Nintendo Switch 2, GA10F)
| Type
| GA10B
| GA107
| GA106
| GA104
| GA103
| GA102
| GA100
| GeForce MX series
| —N/a
| GeForce MX570 (mobile)
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| GeForce 20 series
| —N/a
| GeForce RTX 2050 (mobile)
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| GeForce 30 series
| —N/a
| GeForce RTX 3050 LaptopGeForce RTX 3050GeForce RTX 3050 Ti Laptop
| GeForce RTX 3050GeForce RTX 3060 LaptopGeForce RTX 3060
| GeForce RTX 3060GeForce RTX 3060 TiGeForce RTX 3070 LaptopGeForce RTX 3070GeForce RTX 3070 Ti LaptopGeForce RTX 3070 TiGeForce RTX 3080 Laptop
| GeForce RTX 3060 TiGeForce RTX 3080 Ti Laptop
| GeForce RTX 3070 TiGeForce RTX 3080GeForce RTX 3080 TiGeForce RTX 3090GeForce RTX 3090 Ti
| —N/a
| Nvidia Workstation GPUs
| —N/a
| RTX A1000 (mobile)
| RTX A2000 (mobile) RTX A2000
| RTX A3000 (mobile)RTX A4000 (mobile)RTX A4000RTX A5000 (mobile)
| RTX A5500 (mobile)
| RTX A4500RTX A5000RTX A5500RTX A6000
| —N/a
| Nvidia Data Center GPUs
| —N/a
| Nvidia A2Nvidia A16
| —N/a
| —N/a
| —N/a
| Nvidia A10Nvidia A40
| Nvidia A30Nvidia A100
| Tegra SoCs
| AGX OrinOrin NXOrin Nano
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
| —N/a
- List of eponyms of Nvidia GPU microarchitectures
- List of Nvidia graphics processing units
- Nvidia NVENC
- Nvidia NVDEC
- Nvidia A100 Tensor Core GPU Architecture whitepaper
- Nvidia Ampere GA102 GPU Architecture whitepaper
- Nvidia Ampere Architecture
- Nvidia A100 Tensor Core GPU
- Nvidia Ampere Architecture In-Depth