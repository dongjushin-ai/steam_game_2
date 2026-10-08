Source: https://en.wikipedia.org/wiki/Hopper_(microarchitecture)
Hopper (microarchitecture) - Wikipedia
Hopper is a graphics processing unit (GPU) microarchitecture developed by Nvidia. It is designed for datacenters and is used alongside the Lovelace microarchitecture.
Named for computer scientist and United States Navy rear admiral Grace Hopper, the Hopper architecture was leaked in November 2019 and officially revealed in March 2022. It improves upon its predecessors, the Turing and Ampere microarchitectures, featuring a new streaming multiprocessor, a faster memory subsystem, and a transformer acceleration engine.

## Architecture
The Nvidia Hopper H100 GPU is implemented using the TSMC N4 process with 80 billion transistors. It consists of up to 144 streaming multiprocessors. Due to the increased memory bandwidth provided by the SXM5 socket, the Nvidia Hopper H100 offers better performance when used in an SXM5 configuration than in the typical PCIe socket.

## Streaming multiprocessor
The streaming multiprocessors for Hopper improve upon the Turing and Ampere microarchitectures, although the maximum number of concurrent warps per streaming multiprocessor (SM) remains the same between the Ampere and Hopper architectures, 64. The Hopper architecture provides a Tensor Memory Accelerator (TMA), which supports bidirectional asynchronous memory transfer between shared memory and global memory. Under TMA, applications may transfer up to 5D tensors. When writing from shared memory to global memory, elementwise reduction and bitwise operators may be used, avoiding registers and SM instructions while enabling users to write warp specialized codes. TMA is exposed through cuda::memcpy_async.
When parallelizing applications, developers can use thread block clusters. Thread blocks may perform atomics in the shared memory of other thread blocks within its cluster, otherwise known as distributed shared memory. Distributed shared memory may be used by an SM simultaneously with L2 cache; when used to communicate data between SMs, this can utilize the combined bandwidth of distributed shared memory and L2. The maximum portable cluster size is 8, although the Nvidia Hopper H100 can support a cluster size of 16 by using the cudaFuncAttributeNonPortableClusterSizeAllowed function, potentially at the cost of reduced number of active blocks. With L2 multicasting and distributed shared memory, the required bandwidth for dynamic random-access memory read and writes is reduced.
Hopper features improved single-precision floating-point format (FP32) throughput with twice as many FP32 operations per cycle per SM than its predecessor. Additionally, the Hopper architecture adds support for new instructions, including the Smith–Waterman algorithm. Like Ampere, TensorFloat-32 (TF-32) arithmetic is supported. The mapping pattern for both architectures is identical.

## Memory
The Nvidia Hopper H100 supports HBM3 and HBM2e memory up to 80 GB; the HBM3 memory system supports 3 TB/s, an increase of 50% over the Nvidia Ampere A100's 2 TB/s. Across the architecture, the L2 cache capacity and bandwidth were increased.
Hopper allows CUDA compute kernels to utilize automatic inline compression, including in individual memory allocation, which allows accessing memory at higher bandwidth. This feature does not increase the amount of memory available to the application, because the data (and thus its compressibility) may be changed at any time. The compressor will automatically choose between several compression algorithms.
The Nvidia Hopper H100 increases the capacity of the combined L1 cache, texture cache, and shared memory to 256 KB. Like its predecessors, it combines L1 and texture caches into a unified cache designed to be a coalescing buffer. The attribute cudaFuncAttributePreferredSharedMemoryCarveout may be used to define the carveout of the L1 cache. Hopper introduces enhancements to NVLink through a new generation with faster overall communication bandwidth.

## Memory synchronization domains
Some CUDA applications may experience interference when performing fence or flush operations due to memory ordering. Because the GPU cannot know which writes are guaranteed and which are visible by chance timing, it may wait on unnecessary memory operations, thus slowing down fence or flush operations. For example, when a kernel performs computations in GPU memory and a parallel kernel performs communications with a peer, the local kernel will flush its writes, resulting in slower NVLink or PCIe writes. In the Hopper architecture, the GPU can reduce the net cast through a fence operation.

## DPX instructions
The Hopper architecture math application programming interface (API) exposes functions in the SM such as __viaddmin_s16x2_relu, which performs the per-halfword max ( min ( a + b , c ) , 0 ) {\displaystyle {\textrm {max}}({\textrm {min}}(a+b,c),0)} . In the Smith–Waterman algorithm, __vimax3_s16x2_relu can be used, a three-way min or max followed by a clamp to zero. Similarly, Hopper speeds up implementations of the Needleman–Wunsch algorithm.

## Transformer engine
The Hopper architecture was the first Nvidia architecture to implement the transformer engine. The transformer engine accelerates computations by dynamically reducing them from higher numerical precisions (i.e., FP16) to lower precisions that are faster to perform (i.e., FP8) when the loss in precision is deemed acceptable. The transformer engine is also capable of dynamically allocating bits in the chosen precision to either the mantissa or exponent at runtime to maximize precision.

## Power efficiency
The SXM5 form factor H100 has a thermal design power (TDP) of 700 watts. With regards to its asynchrony, the Hopper architecture may attain high degrees of utilization and thus may have a better performance-per-watt.

## Grace Hopper
The GH200 combines a Hopper-based H100 GPU with a Grace-based 72-core CPU on a single module. The total power draw of the module is up to 1000 W. CPU and GPU are connected via NVLink, which provides memory coherence between CPU and GPU memory.

## History
In November 2019, a well-known Twitter account posted a tweet revealing that the next architecture after Ampere would be called Hopper, named after computer scientist and United States Navy rear admiral Grace Hopper, one of the first programmers of the Harvard Mark I. The account stated that Hopper would be based on a multi-chip module design, which would result in a yield gain with lower wastage.
During the March 2022 Nvidia GTC, Nvidia announced Hopper.
In late 2022, due to US regulations limiting the export of chips to the People's Republic of China, Nvidia adapted the H100 chip to the Chinese market with the H800. This model has lower bandwidth compared to the original H100 model. In late 2023, the US government announced new restrictions on the export of AI chips to China, including the A800 and H800 models. This led to Nvidia creating another chip predicated on Hopper microarchitecture: the H20, a modified version of the H100. The H20 had become the most prominent chip in the Chinese market as of 2025.
By 2023, during the AI boom, H100s were in great demand. Larry Ellison of Oracle Corporation said that year that at a dinner with Nvidia CEO Jensen Huang, he and Elon Musk of Tesla, Inc. and xAI "were begging" for H100s, "I guess is the best way to describe it. An hour of sushi and begging".
In January 2024, Raymond James Financial analysts estimated that Nvidia was selling the H100 GPU in the price range of $25,000 to $30,000 each, while on eBay, individual H100s cost over $40,000. As of February 2024, Nvidia was reportedly shipping H100 GPUs to data centers in armored cars.

## H100 accelerator and DGX H100
Starting from P100, to V100, to A100, to H100, to B200 and to R100; the comparison of accelerators used in DGX:

## General & Architecture
(billion)
(mm2)
| —.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap}N/a

## Cores, Clock & Power
(MHz)
(FP32 CUDA)
(FP64 excl. tensor)
(Mixed INT32/FP32)
(INT32)
(W)

## Memory & Cache
(HBM)
(GB)
(Gb/s)
(bits)
(TB/s)
Per SM (KB)
Total (KB)
(KB)

## Compute Performance, Interconnect & Networking
(TFLOPS)
(TFLOPS)
dense tensor
dense tensor
dense tensor
dense tensor
dense tensor
(NVLink; TB/s)
(100 Gb/s)
(100 Gb/s)
(200 Gb/s)
(400 Gb/s)
(400 Gb/s)
(1600 Gb/s)

## Export controls and international trade issues
In early 2026, Nvidia’s Hopper-based H200 AI accelerator became a focal point in international trade disputes involving U.S. export policy and Chinese import controls. Although the U.S. government approved the limited export of H200 chips to China under specific security conditions, reports indicated that Chinese customs officials prevented shipments of the processors from entering the country despite the U.S. clearance, leading suppliers to pause production of H200 components amid uncertainty over the import block. Chinese authorities reportedly instructed domestic firms against purchasing the chips unless necessary, though no formal ban was publicly announced and the long-term status of the restrictions remained unclear. The situation highlighted the geopolitical sensitivities surrounding advanced AI hardware exports and the complex interplay between U.S. export regulations and Chinese import policies.
In May 2026, the US government's export controls on the Nvidia H200 processor became a key discussion point during US president Donald Trump's state visit to China. The US allowed 10 Chinese companies, including Alibaba Group, Tencent, ByteDance, and JD.com, and distributors including Lenovo and Foxconn, to purchase NVIDIA's H200 chips.

## Works cited
- Elster, Anne; Haugdahl, Tor (March 2022). "Nvidia Hopper GPU and Grace CPU Highlights". Computing in Science & Engineering. 24 (2): 95–100. Bibcode:2022CSE....24b..95E. doi:10.1109/MCSE.2022.3163817. hdl:11250/3051840. S2CID 249474974. Retrieved May 29, 2023.
- Fujita, Kohei; Yamaguchi, Takuma; Kikuchi, Yuma; Ichimura, Tsuyoshi; Hori, Muneo; Maddegedara, Lalith (April 2023). "Calculation of cross-correlation function accelerated by TensorFloat-32 Tensor Core operations on NVIDIA's Ampere and Hopper GPUs". Journal of Computational Science. 68. doi:10.1016/j.jocs.2023.101986.
- CUDA C++ Programming Guide (PDF). Nvidia. April 17, 2023.
- Hopper Tuning Guide (PDF). Nvidia. April 13, 2023.
- NVIDIA H100 Tensor Core GPU Architecture (PDF). Nvidia. 2022.[permanent dead link]
- Choquette, Jack (May 2023). "NVIDIA Hopper H100 GPU: Scaling Performance". IEEE Micro. 43 (3): 9–17. doi:10.1109/MM.2023.3256796. S2CID 257544490. Retrieved May 29, 2023.
- Moore, Samuel (April 8, 2022). "Nvidia's Next GPU Shows That Transformers Are Transforming AI". IEEE Spectrum. Retrieved May 29, 2023.
- Morgan, Timothy (March 31, 2022). "Deep Dive Into Nvidia's "Hopper" GPU Architecture". The Next Platform. Retrieved May 29, 2023.