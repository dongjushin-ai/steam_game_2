Source: https://en.wikipedia.org/wiki/Ollama
Ollama - Wikipedia
Ollama is an open-source software platform developed by Jeffrey Morgan and Michael Chiang in 2023 for running and managing large language models on local GPU infrastructure and through hosted cloud models. It provides a command-line interface, a native GUI, a local REST API, model-management tools, and integrations for using open-weight models with coding assistants and other applications.

## History
Ollama was first released in July 8, 2023. The project became associated with the growth of local large language model software, allowing users to download and run models such as Llama, Gemma, Mistral, Qwen, gpt-oss, GLM and DeepSeek on a local machine.
In 2025 and 2026, Ollama added additional application and cloud features, including hosted cloud models, web search support, tool and coding-agent integrations, and support for using Ollama with applications such as Claude Code, Codex, OpenCode, Copilot CLI, and OpenClaw. In March 2026, Ollama announced preview support for Apple silicon.
In July 2026, the company has raised $65 million dollars in funding.

## Features
Ollama includes tools for downloading, running, importing, and managing large language models. Users can run models from the command line, interact with them through a local HTTP API, or use client libraries for programming languages such as Python and JavaScript.
The project provides a REST API for chat and model-management functions, with the default local service commonly exposed on port 11434. Ollama also distributes an official Docker image and provides model libraries and documentation for running supported models.
Ollama uses the llama.cpp backend for local model inference. It supports a model-library format that allows users to pull, run, and manage model variants by name.
Meanwhile, the project's downloadable software is being explored as a back-end platform for low-code/no-code self-hosting of LLMs, potentially allowing natural language processing use cases to become more accessible to nontechnical end users.
Ollama also has experimental support for image generation, using models such as Flux, on macOS, with Windows and Linux support expected in the future.

## Security
Because Ollama is commonly used to run local or self-hosted AI models, security researchers have examined risks from misconfigured public deployments. In January 2026, The Hacker News reported on research by SentinelOne and Censys that found many Ollama servers were exposed to the public internet, mainly by binding to the .mw-parser-output .monospaced{font-family:monospace,monospace}INADDR_ANY interface (0.0.0.0) which on an inadequately-secured system would allow access from other local or remote devices despite the fact that Ollama is intended to run locally by default.
- Generative artificial intelligence
- List of open-source artificial intelligence software
- llama.cpp
- LM Studio — desktop application for locally running and interacting with LLMs
- MLX (Apple ML framework)
- SGLang
- vLLM
- Official website
- ollama on GitHub
- Ollama Docker at Docker Hub