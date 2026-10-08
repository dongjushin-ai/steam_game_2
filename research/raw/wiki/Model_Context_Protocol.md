Source: https://en.wikipedia.org/wiki/Model_Context_Protocol
Model Context Protocol - Wikipedia
The Model Context Protocol (MCP) is an open standard and open-source framework introduced by Anthropic in November 2024 to standardize the way artificial intelligence (AI) systems like large language models (LLMs) integrate and share data with external tools, systems, and data sources. MCP provides a standardized interface for reading files, executing functions, and handling contextual prompts. Following its announcement, the protocol was adopted by major AI providers, including OpenAI and Google DeepMind. In December 2025, Anthropic donated MCP to the Agentic AI Foundation, a fund under the Linux Foundation.

## Background
MCP was announced by Anthropic in November 2024 as an open standard for connecting AI assistants to data systems such as content repositories, business management tools, and development environments. The protocol was created at Anthropic by engineers David Soria Parra and Justin Spahr-Summers. MCP was designed to address information silos and legacy systems. Before MCP, developers often had to build custom connectors for each data source or tool, resulting in what Anthropic described as an "N×M" data integration problem.
Earlier approaches such as OpenAI's 2023 "function-calling" API and the ChatGPT plug-in framework—solved similar problems but required vendor-specific connectors. MCP reuses the message-flow ideas of the Language Server Protocol (LSP).
In December 2025, Anthropic donated MCP to the Agentic AI Foundation (AAIF), a directed fund under the Linux Foundation, co-founded by Anthropic, Block and OpenAI, with support from other companies. Later that month, Anthropic also published Agent Skills, a companion open standard for packaging task-specific instructions and resources that AI agents load on demand.

## Features
MCP defines a standardized framework for integrating AI systems with external data sources and tools. Applications include querying structured databases in plain language.
The protocol distinguishes between MCP hosts, MCP clients and MCP servers. An MCP host is typically an AI agent that interacts with an LLM and requires services from one or more MCP servers. For each of these MCP servers, the MCP host will create a dedicated MCP client that communicates with that server. Client and host will typically run on the same machine, while the MCP servers may be local or remote.
Each server provides one or more tools or resources. Tools might include database access, calculators, or access to code or repositories; a resource might be a document such as an FAQ. The MCP client asks its server for a list of tools and resources the server provides; the server replies with a natural-language description of the capabilities of each tool and the expected format to call the tool. This information is given to the LLM; if the LLM requires the services of one of these tools, the MCP host will instruct the relevant MCP client to call the tool. The MCP server performs the tool action and returns the results, which the MCP host then injects into the LLM conversation. Client and server communicate using the JSON-RPC 2.0 messages.
The protocol was released with software development kits (SDKs) in programming languages including Python, TypeScript, C# and Java and examples of MCP server implementations.
The protocol is used in AI-assisted software development tools. Integrated development environments (IDEs), coding platforms such as Replit, and code intelligence tools like Sourcegraph have adopted MCP to grant AI coding assistants real-time access to project context.
MCP Apps is an official extension to the Model Context Protocol built on mcp-ui. While the base MCP specification is restricted to text and structured data, MCP Apps standardizes the delivery of interactive user interfaces—such as dashboards, forms, and data visualizations—from MCP servers to host applications like Claude and ChatGPT.

## Adoption
In March 2025, OpenAI officially adopted the MCP, after having integrated the standard across its products, including the ChatGPT desktop app. In September 2025, OpenAI added support for MCP to ChatGPT apps. This allows for third-party access inside ChatGPT.
MCP can be integrated with Microsoft Semantic Kernel, and Azure OpenAI. MCP servers can be deployed to Cloudflare.
In April 2026, the AAIF held the MCP Dev Summit North America in New York City, drawing approximately 1,200 attendees. That same month, Salesforce's Headless 360 platform began routing customer and agent interactions via MCP; in late May, Salesforce reported 4.5 million MCP calls had been processed since launch.
By mid-2026, more than 10,000 MCP servers had reportedly been deployed in production, with the protocol's SDKs downloaded over 97 million times per month.

## 2026-07-28 revision
On July 28, 2026, MCP's maintainers finalized a major revision of the specification, described by Anthropic technical staff member David Soria Parra as the most substantial change to the protocol since the addition of authorization. The revision removes protocol-level session tracking, making MCP stateless at the protocol layer: information about protocol version, client identity, and capabilities is instead carried in a _meta parameter with each request. The change brings MCP's request model closer to that of Anthropic's own Claude Messages API.
The revision also deprecated several features that had seen limited use, including sampling (allowing a server to request a completion from the client's model) and roots (allowing clients to indicate relevant file-system locations to a server); deprecated features remain functional for a minimum of twelve months. Some previously core functionality, such as the Tasks feature for long-running operations, was moved out of the base protocol and into optional extensions. Not all of the changes are backward compatible, and servers implementing the new revision may not interoperate with older clients without a compatibility layer.

## Security risks and vulnerabilities
MCP has been subject to several security vulnerabilities, both in how models handle tool calling and in MCP software itself.
In April 2025, Invariant Labs described "tool poisoning attacks" in which malicious instructions are hidden in MCP tool descriptions that the AI model can read but users cannot see. The vulnerability comes from the assumption that tool descriptions are trustworthy. These problems are not specific to MCP and can occur whenever an LLM has access to tools with untrusted input. Tool poisoning is a form of prompt injection.
Several vulnerabilities have also been found in MCP software itself. In July 2025, JFrog disclosed CVE-2025-6514, a critical flaw (CVSS 9.6) in mcp-remote, a tool that connects MCP clients to remote servers. The flaw allowed a malicious server to run arbitrary commands on the user's machine. The vulnerability affected versions 0.0.5 through 0.1.15 and was fixed in version 0.1.16. Around the same time, researchers reported CVE-2025-49596 in Anthropic's MCP Inspector developer tool. Because the Inspector required no authentication by default, attackers could use it to run code on a user's computer.
The MCP specification has since added security requirements. The specification now requires implementations to follow OAuth 2.1 security best practices. Its security guidance describes "confused deputy" risks in MCP proxy servers and states that token passthrough is forbidden. In a May 2026 report, the U.S National Security Agency stated that MCP's "rapid proliferation has outpaced the development of its security model".

## Reception
The Verge reported that MCP addresses a growing demand for AI agents that are contextually aware and capable of pulling from diverse sources.
MCP has been likened to OpenAPI, a similar specification that aims to describe APIs.
- Agent2Agent – Open protocol for communication between AI agents
- AI governance
- Application programming interface – Connection between computers or programsPages displaying short descriptions of redirect targets
- LangChain – Language model application development framework
- Machine learning – Subset of artificial intelligence
- Open weights
- Software agent – Computer program acting for a user
- Retrieval-augmented generation
- Hou, Xinyi; Zhao, Yanjie; Wang, Shenao; Wang, Haoyu (2025). "Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions". arXiv:2503.23278 [cs.CR].
- Edwards, Benj (April 1, 2025). "MCP: The new "USB-C for AI" that's bringing fierce rivals together". Ars Technica.
- Jackson, Fiona (March 28, 2025). "OpenAI Agents Now Support Rival Anthropic's Protocol, Making Data Access 'Simpler, More Reliable'". TechRepublic.
- Official website
- Model Context Protocol on GitHub