Source: https://en.wikipedia.org/wiki/CUDA
CUDA - Wikipedia
| This article has multiple issues. Please help improve it or discuss these issues on the talk page. (Learn how and when to remove these messages) This article contains instructions or advice. Wikipedia is not a guidebook; please help rewrite such content to be encyclopedic or move it to Wikiversity, Wikibooks, or Wikivoyage. (February 2024) (Learn how and when to remove this message)This article contains a pro and con list. Please help rewrite it into consolidated sections based on topics. (February 2024) (Learn how and when to remove this message)
| This article contains instructions or advice. Wikipedia is not a guidebook; please help rewrite such content to be encyclopedic or move it to Wikiversity, Wikibooks, or Wikivoyage. (February 2024) (Learn how and when to remove this message)
| This article contains a pro and con list. Please help rewrite it into consolidated sections based on topics. (February 2024)
CUDA (Compute Unified Device Architecture) is a proprietary parallel computing platform and application programming interface (API) developed by Nvidia that allows software to use certain types of graphics processing units (GPUs) for accelerated general-purpose processing, significantly broadening their utility in artificial intelligence, scientific and high-performance computing. CUDA was created in 2004 and was officially released in 2007. When introduced, the name was an acronym for Compute Unified Device Architecture, but Nvidia later dropped the initial meaning of the acronym and now rarely expands it.
CUDA is both a software layer that manages data, giving direct access to the GPU and CPU as necessary, and a library of APIs that enable parallel computation. In addition to drivers and runtime kernels, the CUDA platform includes compilers, libraries and developer tools to help programmers.
CUDA is written in the C programming language, but is designed to work with other programming languages including C++, Fortran, Python and Julia. This accessibility makes it easier for specialists in parallel programming to use GPU resources, in contrast to prior APIs like Direct3D and OpenGL, which require advanced skills in graphics programming. CUDA-powered GPUs support programming frameworks such as OpenMP, OpenACC and OpenCL.

## Graphics processing unit
The graphics processing unit (GPU) is a specialized processor. It addresses the demands of real-time high-resolution, compute-intensive tasks such as 3D graphics. By 2012, GPUs had evolved into highly parallel multi-core systems allowing efficient manipulation of large blocks of data. This design is more effective than general-purpose central processing unit (CPUs) for algorithms in situations where processing large blocks of data is done in parallel, such as:
- cryptographic hash functions
- machine learning
- molecular dynamics simulations
- physics engines

## History
CUDA traces to the early 2000s, when Ian Buck, a computer science PhD student at Stanford University, began experimenting with using GPUs for purposes beyond rendering graphics. Buck had become interested in GPUs during his undergraduate studies at Princeton University, initially through video gaming. After graduation, he interned at Nvidia, gaining deeper exposure to GPU architecture. At Stanford, he built an 8K gaming rig using 32 GeForce graphics cards, originally to push the limits of graphics performance in games like Quake and Doom. However, his interests shifted toward exploring the potential of GPUs for general-purpose parallel computing.
To that end, Buck developed Brook, a programming language designed to enable general-purpose computing on GPUs. His work attracted support from Nvidia and the Defense Advanced Research Projects Agency (DARPA). In 2004, Nvidia hired Buck and paired him with John Nickolls, then director of architecture for GPU computing. Together, they began transforming Brook into CUDA. CUDA was officially released in 2007.
CUDA became central to the company's strategy of positioning GPUs as versatile hardware for scientific applications. By 2015, CUDA's development increasingly focused on accelerating machine learning and artificial neural network workloads.

## Ontology
The following table offers an approximate summary of the CUDA ontology.
| simultaneous call of the same subroutine on many processors
| thread (aka. "SP", "streaming processor", "cuda core", but these names are now deprecated)
| analogous to individual scalar ops within a vector op

## Programming abilities
- Copy data from main memory to GPU memory
- CPU initiates the GPU compute kernel
- GPU's CUDA cores execute the kernel in parallel
- Copy the resulting data from GPU memory to main memory
The CUDA platform is accessible to software developers through CUDA-accelerated libraries, compiler directives such as OpenACC, and extensions to industry-standard programming languages including C, C++, Fortran and Python. C/C++ programmers can use 'CUDA C/C++', compiled to PTX with nvcc (Nvidia's LLVM-based C/C++ compiler) or by clang itself. Fortran programmers can use 'CUDA Fortran', compiled with the PGI CUDA Fortran compiler from The Portland Group.[needs update] Python programmers can use the cuPyNumeric library to accelerate applications on Nvidia GPUs.
In addition to libraries, compiler directives, CUDA C/C++ and CUDA Fortran, the CUDA platform supports other computational interfaces, including the Khronos Group's OpenCL, Microsoft's DirectCompute, OpenGL Compute Shader and C++ AMP. Third party wrappers are also available for Python, Perl, Fortran, Java, Ruby, Lua, Common Lisp, Haskell, R, MATLAB, IDL, Julia, and native support in Mathematica.
In the computer game industry, GPUs are used for graphics rendering, and for game physics calculations (physical effects such as debris, smoke, fire, fluids); examples include PhysX and Bullet. CUDA has also been used to accelerate non-graphical applications in computational biology, cryptography and other fields by an order of magnitude or more.
CUDA provides both a low level API (CUDA Driver API, non single-source) and a higher level API (CUDA Runtime API, single-source). The initial CUDA SDK was made public on 15 February 2007, for Microsoft Windows and Linux. Mac OS X support was later added in version 2.0, which supersedes the beta released February 14, 2008. CUDA works with all Nvidia GPUs from the G8x series onwards, including GeForce, Quadro and the Tesla line. CUDA is compatible with most standard operating systems.
CUDA 8.0 comes with the following libraries (for compilation & runtime, in alphabetical order):
- cuBLAS – CUDA Basic Linear Algebra Subroutines library
- CUDART – CUDA Runtime library
- cuFFT – CUDA Fast Fourier Transform library
- cuRAND – CUDA Random Number Generation library
- cuSOLVER – CUDA based collection of dense and sparse direct solvers
- cuSPARSE – CUDA Sparse Matrix library
- NPP – NVIDIA Performance Primitives library
- nvGRAPH – NVIDIA Graph Analytics library
- NVML – NVIDIA Management Library
- NVRTC – NVIDIA Runtime Compilation library for CUDA C++
CUDA 8.0 comes with these other software components:
- nView – NVIDIA nView Desktop Management Software
- NVWMI – NVIDIA Enterprise Management Toolkit
- GameWorks PhysX – is a multi-platform game physics engine
CUDA 9.0–9.2 comes with these other components:
- CUTLASS 1.0 – custom linear algebra algorithms,
- NVIDIA Video Decoder was deprecated in CUDA 9.2; it is now available in NVIDIA Video Codec SDK
CUDA 10 comes with these other components:
- nvJPEG – Hybrid (CPU and GPU) JPEG processing
CUDA 11.0–11.8 comes with these other components:
- CUB is new one of more supported C++ libraries
- MIG multi instance GPU support
- nvJPEG2000 – JPEG 2000 encoder and decoder

## Advantages
CUDA has several advantages over traditional general-purpose computation on GPUs (GPGPU) using graphics APIs:
- Scattered reads – code can read from arbitrary addresses in memory
- Unified virtual memory (CUDA 4.0 and above)
- Unified memory (CUDA 6.0 and above)
- Shared memory – CUDA exposes a fast shared memory region that can be shared among threads. This can be used as a user-managed cache, enabling higher bandwidth than is possible using texture lookups.
- Faster downloads and readbacks to and from the GPU
- Full support for integer and bitwise operations, including integer texture lookups

## Limitations
- Whether for the host computer or the GPU device, all CUDA source code is now processed according to C++ syntax rules. This was not always the case. Earlier versions of CUDA were based on C syntax rules. As with the more general case of compiling C code with a C++ compiler, it is therefore possible that old C-style CUDA source code will either fail to compile or will not behave as originally intended.
- Interoperability with rendering languages such as OpenGL is one-way, with OpenGL having access to registered CUDA memory but CUDA not having access to OpenGL memory.
- Copying between host and device memory may incur a performance hit due to system bus bandwidth and latency (this can be partly alleviated with asynchronous memory transfers, handled by the GPU's DMA engine).
- Threads should be running in groups of at least 32 for best performance, with total number of threads numbering in the thousands. Branches in the program code do not affect performance significantly, provided that each of 32 threads takes the same execution path; the SIMD execution model becomes a significant limitation for any inherently divergent task (e.g. traversing a space partitioning data structure during ray tracing).
- No emulation or fallback functionality is available for modern revisions.
- Valid C++ may sometimes be flagged and prevent compilation due to the way the compiler approaches optimization for target GPU device limitations.
- C++ run-time type information (RTTI) and C++-style exception handling are only supported in host code, not in device code.
- In single-precision on first generation CUDA compute capability 1.x devices, denormal numbers are unsupported and are instead flushed to zero, and the precision of both the division and square root operations are slightly lower than IEEE 754-compliant single precision math. Devices that support compute capability 2.0 and above support denormal numbers, and the division and square root operations are IEEE 754 compliant by default. However, users can obtain the prior faster gaming-grade math of compute capability 1.x devices if desired by setting compiler flags to disable accurate divisions and accurate square roots, and enable flushing denormal numbers to zero.
- Unlike OpenCL, CUDA-enabled GPUs are only available from Nvidia as it is proprietary. Attempts to implement CUDA on other GPUs include: Project Coriander: Converts CUDA C++11 source to OpenCL 1.2 C. A fork of CUDA-on-CL intended to run TensorFlow. CU2CL: Convert CUDA 3.2 C++ to OpenCL C. GPUOpen HIP: A thin abstraction layer on top of CUDA and ROCm intended for AMD and Nvidia GPUs. Has a conversion tool for importing CUDA C++ source. Supports CUDA 4.0 plus C++11 and float16. ZLUDA is a drop-in replacement for CUDA on AMD GPUs and formerly Intel GPUs with near-native performance. The developer, Andrzej Janik, was separately contracted by both Intel and AMD to develop the software in 2021 and 2022, respectively. However, neither company decided to release it officially due to the lack of a business use case. AMD's contract included a clause that allowed Janik to release his code for AMD independently, allowing him to release the new version that only supports AMD GPUs. ChipStar can compile and run CUDA/HIP programs on advanced OpenCL 3.0 or Level Zero platforms. SCALE is a CUDA-compatible programming toolkit for ahead of time compilation of CUDA source code on AMD GPUs, aiming to expand support for other GPUs in the future.
- Project Coriander: Converts CUDA C++11 source to OpenCL 1.2 C. A fork of CUDA-on-CL intended to run TensorFlow.
- CU2CL: Convert CUDA 3.2 C++ to OpenCL C.
- GPUOpen HIP: A thin abstraction layer on top of CUDA and ROCm intended for AMD and Nvidia GPUs. Has a conversion tool for importing CUDA C++ source. Supports CUDA 4.0 plus C++11 and float16.
- ZLUDA is a drop-in replacement for CUDA on AMD GPUs and formerly Intel GPUs with near-native performance. The developer, Andrzej Janik, was separately contracted by both Intel and AMD to develop the software in 2021 and 2022, respectively. However, neither company decided to release it officially due to the lack of a business use case. AMD's contract included a clause that allowed Janik to release his code for AMD independently, allowing him to release the new version that only supports AMD GPUs.
- ChipStar can compile and run CUDA/HIP programs on advanced OpenCL 3.0 or Level Zero platforms.
- SCALE is a CUDA-compatible programming toolkit for ahead of time compilation of CUDA source code on AMD GPUs, aiming to expand support for other GPUs in the future.

## Example
This example code in C++ loads a texture from an image into an array on the GPU:
Below is an example given in Python that computes the product of two arrays on the GPU. The unofficial Python language bindings can be obtained from PyCUDA.
Additional Python bindings to simplify matrix multiplication operations can be found in the program pycublas.
while CuPy directly replaces NumPy:

## GPUs supported
Note on notation: compute capability X.Y is also written as SMXY or sm_XY (e.g. 10.3 as SM103 or sm_103) in professional Nvidia software and the code Nvidia has contributed to LLVM.
Below is a table of supported CUDA compute capabilities based on the CUDA SDK version and microarchitecture, listed by code name:
Note: CUDA SDK 10.2 is the last official release for macOS, as support will not be available for macOS in newer releases.
CUDA compute capability by version with associated GPU semiconductors and GPU card models (separated by their various application areas):
| GeForce 8800 Ultra, GeForce 8800 GTX, GeForce 8800 GTS(G80)
| Quadro FX 5600, Quadro FX 4600, Quadro Plex 2100 S4
| GeForce GTS 250, GeForce 9800 GX2, GeForce 9800 GTX, GeForce 9800 GT, GeForce 8800 GTS(G92), GeForce 8800 GT, GeForce 9600 GT, GeForce 9500 GT, GeForce 9400 GT, GeForce 8600 GTS, GeForce 8600 GT, GeForce 8500 GT,GeForce G110M, GeForce 9300M GS, GeForce 9200M GS, GeForce 9100M G, GeForce 8400M GT, GeForce G105M
| Quadro FX 4700 X2, Quadro FX 3700, Quadro FX 1800, Quadro FX 1700, Quadro FX 580, Quadro FX 570, Quadro FX 470, Quadro FX 380, Quadro FX 370, Quadro FX 370 Low Profile, Quadro NVS 450, Quadro NVS 420, Quadro NVS 290, Quadro NVS 295, Quadro Plex 2100 D4,Quadro FX 3800M, Quadro FX 3700M, Quadro FX 3600M, Quadro FX 2800M, Quadro FX 2700M, Quadro FX 1700M, Quadro FX 1600M, Quadro FX 770M, Quadro FX 570M, Quadro FX 370M, Quadro FX 360M, Quadro NVS 320M, Quadro NVS 160M, Quadro NVS 150M, Quadro NVS 140M, Quadro NVS 135M, Quadro NVS 130M, Quadro NVS 450, Quadro NVS 420, Quadro NVS 295
| GeForce GT 340*, GeForce GT 330*, GeForce GT 320*, GeForce 315*, GeForce 310*, GeForce GT 240, GeForce GT 220, GeForce 210,GeForce GTS 360M, GeForce GTS 350M, GeForce GT 335M, GeForce GT 330M, GeForce GT 325M, GeForce GT 240M, GeForce G210M, GeForce 310M, GeForce 305M
| Quadro FX 380 Low Profile, Quadro FX 1800M, Quadro FX 880M, Quadro FX 380M,Nvidia NVS 300, NVS 5100M, NVS 3100M, NVS 2100M, ION
| GeForce GTX 295, GTX 285, GTX 280, GeForce GTX 275, GeForce GTX 260
| Quadro FX 5800, Quadro FX 4800, Quadro FX 4800 for Mac, Quadro FX 3800, Quadro CX, Quadro Plex 2200 D2
| GeForce GTX 590, GeForce GTX 580, GeForce GTX 570, GeForce GTX 480, GeForce GTX 470, GeForce GTX 465,GeForce GTX 480M
| Quadro 6000, Quadro 5000, Quadro 4000, Quadro 4000 for Mac, Quadro Plex 7000,Quadro 5010M, Quadro 5000M
| Tesla C2075, Tesla C2050/C2070, Tesla M2050/M2070/M2075/M2090
| GF104, GF106 GF108, GF114, GF116, GF117, GF119
| GeForce GTX 560 Ti, GeForce GTX 550 Ti, GeForce GTX 460, GeForce GTS 450, GeForce GTS 450*, GeForce GT 640 (GDDR3), GeForce GT 630, GeForce GT 620, GeForce GT 610, GeForce GT 520, GeForce GT 440, GeForce GT 440*, GeForce GT 430, GeForce GT 430*, GeForce GT 420*,GeForce GTX 675M, GeForce GTX 670M, GeForce GT 635M, GeForce GT 630M, GeForce GT 625M, GeForce GT 720M, GeForce GT 620M, GeForce 710M, GeForce 610M, GeForce 820M, GeForce GTX 580M, GeForce GTX 570M, GeForce GTX 560M, GeForce GT 555M, GeForce GT 550M, GeForce GT 540M, GeForce GT 525M, GeForce GT 520MX, GeForce GT 520M, GeForce GTX 485M, GeForce GTX 470M, GeForce GTX 460M, GeForce GT 445M, GeForce GT 435M, GeForce GT 420M, GeForce GT 415M, GeForce 710M, GeForce 410M
| Quadro 2000, Quadro 2000D, Quadro 600,Quadro 4000M, Quadro 3000M, Quadro 2000M, Quadro 1000M,NVS 310, NVS 315, NVS 5400M, NVS 5200M, NVS 4200M
| GeForce GTX 770, GeForce GTX 760, GeForce GT 740, GeForce GTX 690, GeForce GTX 680, GeForce GTX 670, GeForce GTX 660 Ti, GeForce GTX 660, GeForce GTX 650 Ti BOOST, GeForce GTX 650 Ti, GeForce GTX 650,GeForce GTX 880M, GeForce GTX 870M, GeForce GTX 780M, GeForce GTX 770M, GeForce GTX 765M, GeForce GTX 760M, GeForce GTX 680MX, GeForce GTX 680M, GeForce GTX 675MX, GeForce GTX 670MX, GeForce GTX 660M, GeForce GT 750M, GeForce GT 650M, GeForce GT 745M, GeForce GT 645M, GeForce GT 740M, GeForce GT 730M, GeForce GT 640M, GeForce GT 640M LE, GeForce GT 735M, GeForce GT 730M
| Quadro K5000, Quadro K4200, Quadro K4000, Quadro K2000, Quadro K2000D, Quadro K600, Quadro K420,Quadro K500M, Quadro K510M, Quadro K610M, Quadro K1000M, Quadro K2000M, Quadro K1100M, Quadro K2100M, Quadro K3000M, Quadro K3100M, Quadro K4000M, Quadro K5000M, Quadro K4100M, Quadro K5100M,NVS 510, Quadro 410
| Tesla K10, GRID K340, GRID K520, GRID K2
| GeForce GTX Titan Z, GeForce GTX Titan Black, GeForce GTX Titan, GeForce GTX 780 Ti, GeForce GTX 780, GeForce GT 640 (GDDR5), GeForce GT 630 v2, GeForce GT 730, GeForce GT 720, GeForce GT 710, GeForce GT 740M (64-bit, DDR3), GeForce GT 920M
| GeForce GTX 750 Ti, GeForce GTX 750, GeForce GTX 960M, GeForce GTX 950M, GeForce 940M, GeForce 930M, GeForce GTX 860M, GeForce GTX 850M, GeForce 845M, GeForce 840M, GeForce 830M
| Quadro K1200, Quadro K2200, Quadro K620, Quadro M2000M, Quadro M1000M, Quadro M600M, Quadro K620M, NVS 810
| GeForce GTX Titan X, GeForce GTX 980 Ti, GeForce GTX 980, GeForce GTX 970, GeForce GTX 960, GeForce GTX 950, GeForce GTX 750 SE,GeForce GTX 980M, GeForce GTX 970M, GeForce GTX 965M
| Quadro M6000 24GB, Quadro M6000, Quadro M5000, Quadro M4000, Quadro M2000, Quadro M5500,Quadro M5000M, Quadro M4000M, Quadro M3000M
| Tesla M4, Tesla M40, Tesla M6, Tesla M60
| Tegra X1,Jetson TX1,Jetson Nano,DRIVE CX,DRIVE PX
| Nvidia TITAN Xp, Titan X,GeForce GTX 1080 Ti, GTX 1080, GTX 1070 Ti, GTX 1070, GTX 1060, GTX 1050 Ti, GTX 1050, GT 1030, GT 1010, MX350, MX330, MX250, MX230, MX150, MX130, MX110
| Quadro P6000, Quadro P5000, Quadro P4000, Quadro P2200, Quadro P2000, Quadro P1000, Quadro P400, Quadro P500, Quadro P520, Quadro P600,Quadro P5000 (mobile), Quadro P4000 (mobile), Quadro P3000 (mobile)
GV11B
| Tegra Xavier,Jetson Xavier NX,Jetson AGX Xavier,DRIVE AGX Xavier,DRIVE AGX Pegasus,Clara AGX
| NVIDIA TITAN RTX,GeForce RTX 2080 Ti, RTX 2080 Super, RTX 2080, RTX 2070 Super, RTX 2070, RTX 2060 Super, RTX 2060 12GB, RTX 2060,GeForce GTX 1660 Ti, GTX 1660 Super, GTX 1660, GTX 1650 Super, GTX 1650, MX550, MX450
| Quadro RTX 8000, Quadro RTX 6000, Quadro RTX 5000, Quadro RTX 4000, T1000, T600, T400T1200 (mobile), T600 (mobile), T500 (mobile), Quadro T2000 (mobile), Quadro T1000 (mobile)
| GeForce RTX 3090 Ti, RTX 3090, RTX 3080 Ti, RTX 3080 12GB, RTX 3080, RTX 3070 Ti, RTX 3070, RTX 3060 Ti, RTX 3060, RTX 3050, RTX 3050 Ti (mobile), RTX 3050 (mobile), RTX 2050 (mobile), MX570
| RTX A6000, RTX A5500, RTX A5000, RTX A4500, RTX A4000, RTX A2000 RTX A5000 (mobile), RTX A4000 (mobile), RTX A3000 (mobile), RTX A2000 (mobile)
| Jetson Orin Nano,Jetson Orin NX,Jetson AGX Orin,DRIVE AGX Orin,IGX Orin
| GeForce RTX 4090, RTX 4080 Super, RTX 4080, RTX 4070 Ti Super, RTX 4070 Ti, RTX 4070 Super, RTX 4070, RTX 4060 Ti, RTX 4060, RTX 4050 (mobile)
| RTX 6000 Ada, RTX 5880 Ada, RTX 5000 Ada, RTX 4500 Ada, RTX 4000 Ada, RTX 4000 SFF Ada, RTX 2000 Ada, RTX 5000 Ada (mobile), RTX 4000 Ada (mobile), RTX 3500 Ada (mobile), RTX 2000 Ada (mobile)
| GeForce RTX 5090, RTX 5080, RTX 5070 Ti, RTX 5070, RTX 5060 Ti, RTX 5060, RTX 5050
| RTX PRO 6000 Blackwell Workstation, RTX PRO 5000 Blackwell, RTX PRO 4500 Blackwell, RTX PRO 4000 Blackwell, RTX PRO 2000 Blackwell
| RTX PRO 6000 Blackwell Server, RTX PRO 4500 Blackwell Server
* – OEM-only products

## Version features and specifications
Note: A GPU with a higher compute capacity is able to execute PTX code meant for a GPU of a lower range of compute capacities. However, it is possible to compile CUDA code into a form that only works on one family (same "X") of GPUs; if existing code is compiled this way, recompilation will be needed for it to work on a newer GPU.
| Memory fence functions (__threadfence_system())
| Synchronization functions (__syncthreads_count(), __syncthreads_and(), __syncthreads_or())
| Hardware-accelerated split arrive/wait barrier
| DPX instructions for accelerated dynamic programming

## Data types

## Floating-point types
| Used for scaling(any FP4 or FP6 or FP8 format)
| Exponent/range of FP32,fits into 16 bits
| Exponent/range of FP32,mantissa/precision of FP16

## Version support
| —.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap}N/a
| addition, subtraction,multiplication, comparison,warp shuffle functions, conversion
| addition, subtraction,multiplication, comparison,warp shuffle functions, conversion
Note: Any missing lines or empty entries do reflect some lack of information on that exact item.

## Tensor cores
| 6-bit floating point FP6 (E3M2 and E2M3)
| 8-bit floating point FP8 (E4M3 and E5M2) with FP16 accumulate
| 8-bit floating point FP8 (E4M3 and E5M2) with FP32 accumulate
| 16-bit floating point FP16 with FP16 accumulate
| 16-bit floating point FP16 with FP32 accumulate
| 16-bit floating point BF16 with FP32 accumulate
| 32-bit (19 bits used) floating point TF32
Note: Any missing lines or empty entries do reflect some lack of information on that exact item.
| Dot Product Unit Width in FP16 units (in bytes)
| Full throughput (Bytes/cycle) per SM partition
| FP Tensor Cores: Minimum cycles for warp-wide matrix calculation
| FP Tensor Cores: Minimum Matrix Shape for full throughput (Bytes)
| INT Tensor Cores: Minimum cycles for warp-wide matrix calculation
| INT Tensor Cores: Minimum Matrix Shape for full throughput (Bytes)
| Dot Product Unit Width in FP64 units (in bytes)
| Full throughput (Bytes/cycle) per SM partition
| Minimum cycles for warp-wide matrix calculation
| Minimum Matrix Shape for full throughput (Bytes)

## Technical specifications
| Maximum number of resident grids per device(concurrent kernel execution, can be lower for specific devices)
| Maximum dimensionality of grid of thread blocks
| Maximum x-dimension of a grid of thread blocks
| Maximum y-, or z-dimension of a grid of thread blocks
| Maximum number of resident blocks per multiprocessor
| Maximum number of resident warps per multiprocessor
| Maximum number of resident threads per multiprocessor
| Number of 32-bit regular registers per multiprocessor
| Number of 32-bit uniform registers per multiprocessor
| Maximum number of 32-bit registers per thread block
| Maximum number of 32-bit regular registers per thread
| Maximum number of 32-bit uniform registers per warp
| Amount of shared memory per multiprocessor(out of overall shared memory + L1 cache, where applicable)
| 0 / 8 / 16 / 32 / 64 / 96 KiB (of 128 KiB)
| 0 / 8 / 16 / 32 / 64 / 100 / 132 / 164 KiB (of 192 KiB)
| 0 / 8 / 16 / 32 / 64 / 100 KiB (of 128 KiB)
| 0 / 8 / 16 / 32 / 64 / 100 / 132 / 164 KiB (of 192 KiB)
| 0 / 8 / 16 / 32 / 64 / 100 KiB (of 128 KiB)
| 0 / 8 / 16 / 32 / 64 / 100 / 132 / 164 / 196 / 228 KiB (of 256 KiB)
| 0 / 8 / 16 / 32 / 64 / 100 KiB (of 128 KiB)
| Maximum amount of shared memory per thread block
| Constant memory size accessible by CUDA C/C++(1 bank, PTX can access 11 banks, SASS can access 18 banks)
| Cache working set per multiprocessor for constant memory
| Cache working set per multiprocessor for texture memory
| Maximum width for 1D texture reference bound to a CUDA array
| Maximum width for 1D texture reference bound to linear memory
| Maximum width and number of layers for a 1D layered texture reference
| Maximum width and height for 2D texture reference bound to a CUDA array
| Maximum width and height for 2D texture reference bound to a linear memory
| Maximum width and height for 2D texture reference bound to a CUDA array supporting texture gather
| Maximum width, height, and number of layers for a 2D layered texture reference
| Maximum width, height and depth for a 3D texture reference bound to linear memory or a CUDA array
| Maximum width (and height) for a cubemap texture reference
| Maximum width (and height) and number of layers for a cubemap layered texture reference
| Maximum number of textures that can be bound to a kernel
| Maximum width for a 1D surface reference bound to a CUDA array
| Maximum width and number of layers for a 1D layered surface reference
| Maximum width and height for a 2D surface reference bound to a CUDA array
| Maximum width, height, and number of layers for a 2D layered surface reference
| Maximum width, height, and depth for a 3D surface reference bound to a CUDA array
| Maximum width (and height) for a cubemap surface reference bound to a CUDA array
| Maximum width and number of layers for a cubemap layered surface reference
| Maximum number of surfaces that can be bound to a kernel
| Maximum number of instructions per kernel
| Maximum number of Thread Blocks per Thread Block Cluster

## Multiprocessor architecture
| Number of ALU lanes for INT32 arithmetic operations
| Number of ALU lanes for any INT32 or FP32 arithmetic operation
| Number of ALU lanes for FP32 arithmetic operations
| Number of ALU lanes for FP16x2 arithmetic operations
| Number of ALU lanes for FP64 arithmetic operations
| Number of special function units for single-precision floating-point transcendental functions
| Number of ALU lanes for uniform INT32 arithmetic operations
| Number of SM Partitions = Processing Blocks
| Number of warp schedulers per SM partition
| Max number of new instructions issued each cycle by a single scheduler
| Size of unified memory for data cache and shared memory
| Size of L2 instruction cache per Texture Processor Cluster (TPC)
| Size of L0 instruction cache per SM partition
| 32 bits instructions and 64 bits instructions
| 64 bits instructions + 64 bits control logic every 7 instructions
| 64 bits instructions + 64 bits control logic every 3 instructions
| 128 bits combined instruction and control logic
| Memory Bus Width per Memory Controller in bits
| Number of Render Output Units (ROP) per memory controller (or per GPC in later models)
For more information read the Nvidia CUDA C++ Programming Guide.

## Usages of CUDA architecture
- Accelerated rendering of 3D graphics
- Accelerated interconversion of video file formats
- Accelerated encryption, decryption and compression
- Bioinformatics, e.g. NGS DNA sequencing BarraCUDA
- Distributed calculations, such as predicting the native conformation of proteins
- Medical analysis simulations, for example virtual reality based on CT and MRI scan images
- Physical simulations, particularly in fluid dynamics
- Neural network training in machine learning problems
- Large Language Model inference
- Face recognition
- Volunteer computing projects, such as SETI@home and other projects using BOINC software
- Molecular dynamics
- Mining cryptocurrencies
- Structure from motion (SfM) software

## Comparison with competitors
CUDA competes with other GPU computing stacks: Intel OneAPI and AMD ROCm.
Whereas Nvidia's CUDA is closed-source, Intel's OneAPI and AMD's ROCm are open source.

## Intel OneAPI
oneAPI is an initiative based in open standards, created to support software development for multiple hardware architectures. The oneAPI libraries must implement open specifications that are discussed publicly by the Special Interest Groups, offering the possibility for any developer or organization to implement their own versions of oneAPI libraries.
Originally made by Intel, other hardware adopters include Fujitsu and Huawei.

## Unified Acceleration Foundation (UXL)
Unified Acceleration Foundation (UXL) is a new technology consortium working on the continuation of the OneAPI initiative, with the goal to create a new open standard accelerator software ecosystem, related open standards and specification projects through Working Groups and Special Interest Groups (SIGs). The goal is to offer open alternatives to Nvidia's CUDA. The main companies behind it are Intel, Google, ARM, Qualcomm, Samsung, Imagination, and VMware.

## AMD ROCm
ROCm is an open source software stack for graphics processing unit (GPU) programming from Advanced Micro Devices (AMD).
- Array programming
- BrookGPU – the Stanford University graphics group's compiler
- CUDA binary (cubin) – a type of fat binary
- Molecular modeling on GPUs
- Numerical Library Collection – by NEC for their vector processor
- OptiX – ray tracing API by NVIDIA
- Parallel computing
- rCUDA – an API for computing on remote computers
- Stream processing
- SYCL – an open standard from Khronos Group for programming a variety of platforms, including GPUs, with single-source modern C++, similar to higher-level CUDA Runtime API (single-source)
- Vulkan – low-level, high-performance 3D graphics and computing API
- Buck, Ian; Foley, Tim; Horn, Daniel; Sugerman, Jeremy; Fatahalian, Kayvon; Houston, Mike; Hanrahan, Pat (2004-08-01). "Brook for GPUs: stream computing on graphics hardware". ACM Transactions on Graphics. 23 (3): 777–786. doi:10.1145/1015706.1015800. ISSN 0730-0301.
- Nickolls, John; Buck, Ian; Garland, Michael; Skadron, Kevin (2008-03-01). "Scalable Parallel Programming with CUDA: Is CUDA the parallel programming model that application developers have been waiting for?". ACM Queue. 6 (2): 40–53. doi:10.1145/1365490.1365500. ISSN 1542-7730.
- Official website
- CUDA textbooks