Source: https://en.wikipedia.org/wiki/Cyc
Cyc - Wikipedia
Cyc (pronounced /ˈsaɪk/ SYKE) is a long-term artificial intelligence (AI) project that aims to assemble a comprehensive ontology and knowledge base that spans the basic concepts and rules about how the world works. Hoping to capture common sense knowledge, Cyc focuses on implicit knowledge. The project began in July 1984 at MCC and was developed later by the Cycorp company.
The name "Cyc" (from "encyclopedia") is a registered trademark owned by Cycorp. CycL has a publicly released specification, and dozens of HL (Heuristic Level) modules were described in Lenat and Guha's textbook, but the Cyc inference engine code and the full list of HL modules are Cycorp-proprietary.

## History
The project was begun in July 1984 by Douglas Lenat at the Microelectronics and Computer Technology Corporation (MCC), a research consortium started by two United States–based corporations "to counter a then ominous Japanese effort in AI, the so-called 'fifth-generation' project." From January 1995 on, the project was under active development by Cycorp, where Douglas Lenat was the CEO.
The CycL representation language started as an extension of RLL (the Representation Language Language, developed in 1979–1980 by Lenat and his graduate student Russell Greiner while at Stanford University). In 1989, CycL had expanded in expressive power to higher-order logic (HOL).
Cyc's ontology grew to about 100,000 terms in 1994, and as of 2017, it contained about 1,500,000 terms. The Cyc knowledge base involving ontological terms was largely created by hand axiom-writing; it was at about 1 million in 1994, and as of 2017, it was at about 24.5 million.
By 2002, Cyc was described as having "consumed $60 million and 600 person-years of effort from programmers, philosophers and others—collectively known as Cyclists—who have been codifying what Lenat calls 'consensus reality' and entering it into a massive database."
In 2008, Cyc resources were mapped to many Wikipedia articles.
In 2014, Lenat said "We've been keeping a very low profile, mostly intentionally", with no outside investments and no debt.

## Knowledge base
The knowledge base is divided into microtheories. Unlike the knowledge base as a whole, each microtheory must be free from monotonic contradictions. Each microtheory is a first-class object in the Cyc ontology; it has a name that is a regular constant. The concept names in Cyc are CycL terms or constants. Constants start with an optional #$ and are case-sensitive. There are constants for:
- Individual items known as individuals, such as #$BillClinton or #$France.
- Collections, such as #$Tree-ThePlant (containing all trees) or #$EquivalenceRelation (containing all equivalence relations). A member of a collection is called an instance of that collection.
- Functions, which produce new terms from given ones. For example, #$FruitFn, when provided with an argument describing a type (or collection) of plants, will return the collection of its fruits. By convention, function constants start with an upper-case letter and end with the string Fn.
- Truth functions, which can apply to one or more other concepts and return either true or false. For example, #$siblings is the sibling relationship, true if the two arguments are siblings. By convention, truth function constants start with a lowercase letter.
For every instance of the collection #$ChordataPhylum (i.e., for every chordate), there exists a female animal (instance of #$FemaleAnimal), which is its mother (described by the predicate #$biologicalMother).

## Inference engine
An inference engine is a computer program that tries to derive answers from a knowledge base. The Cyc inference engine performs general logical deduction. It also performs inductive reasoning, statistical machine learning and symbolic machine learning, and abductive reasoning.
The Cyc inference engine separates the epistemological problem from the heuristic problem. For the latter, Cyc used a community-of-agents architecture in which specialized modules, each with its own algorithm, became prioritized if they could make progress on the sub-problem.

## Releases

## OpenCyc
The first version of OpenCyc was released in spring 2002 and contained only 6,000 concepts and 60,000 facts. The knowledge base was released under the Apache License. Cycorp stated its intention to release OpenCyc under parallel, unrestricted licences to meet the needs of its users. The CycL and SubL interpreter (the program that allows users to browse and edit the database as well as to draw inferences) was released free of charge, but only as a binary, without source code. It was made available for Linux and Microsoft Windows. The open source Texai project released the RDF-compatible content extracted from OpenCyc. The user interface was in Java 6.
Cycorp was a participant of a working group for the Semantic Web, Standard Upper Ontology Working Group, which was active from 2001 to 2003.
A Semantic Web version of OpenCyc was available starting in 2008, but ending sometime after 2016.
OpenCyc 4.0 was released in June 2012. OpenCyc 4.0 contained 239,000 concepts and 2,093,000 facts; however, these are mainly taxonomic assertions.
4.0 was the last released version, and around March 2017, OpenCyc was shut down for the purported reason that "because such “fragmenting” led to divergence, and led to confusion amongst its users and the technical community generally thought that OpenCyc fragment was Cyc.".

## ResearchCyc
In July 2006, Cycorp released the executable of ResearchCyc 1.0, a version of Cyc aimed at the research community, at no charge. (ResearchCyc was in beta stage of development during all of 2004; a beta version was released in February 2005.) In addition to the taxonomic information, ResearchCyc includes more semantic knowledge; it also includes a large lexicon, English parsing and generation tools, and Java-based interfaces for knowledge editing and querying. It contains a system for ontology-based data integration.

## Applications
In 2001, GlaxoSmithKline was funding the Cyc, though for unknown applications. In 2007, the Cleveland Clinic has used Cyc to develop a natural-language query interface of biomedical information on cardiothoracic surgeries. A query is parsed into a set of CycL fragments with open variables. The Terrorism Knowledge Base was an application of Cyc that tried to contain knowledge about "terrorist"-related descriptions. The knowledge is stored as statements in mathematical logic. The project lasted from 2004 to 2008. Lycos used Cyc for search term disambiguation, but stopped in 2001. CycSecure was produced in 2002, a network vulnerability assessment tool based on Cyc, with trials at the US STRATCOM Computer Emergency Response Team.
One Cyc application has the stated aim to help students doing math at a 6th grade level. The application, called MathCraft, was supposed to play the role of a fellow student who is slightly more confused than the user about the subject. As the user gives good advice, Cyc allows the avatar to make fewer mistakes.

## Criticisms
The Cyc project has been described as "one of the most controversial endeavors of the artificial intelligence history". Catherine Havasi, CEO of Luminoso, says that Cyc is the predecessor project to IBM's Watson. Machine-learning scientist Pedro Domingos refers to the project as a "catastrophic failure" for the unending amount of data required to produce any viable results and the inability for Cyc to evolve on its own.
Gary Marcus, a cognitive scientist and the cofounder of an AI company called Geometric Intelligence, said in 2016 that "it represents an approach that is very different from all the deep-learning stuff that has been in the news." This is consistent with Doug Lenat's position that "Sometimes the veneer of intelligence is not enough".

## Notable employees
This is a list of some of the notable people who work or have worked on Cyc either while it was a project at MCC (where Cyc was first started) or Cycorp.
- Douglas Lenat
- Michael Witbrock
- Pat Hayes
- Ramanathan V. Guha
- Stuart J. Russell
- Srinija Srinivasan
- Jared Friedman
- John McCarthy
- BabelNet
- DARPA Agent Markup Language
- DBpedia
- Fifth generation computer
- Freebase
- Wikidata
- List of notable artificial intelligence projects
- Alan Belasco et al. (2004). "Representing Knowledge Gaps Effectively". In: D. Karagiannis, U. Reimer (Eds.): Practical Aspects of Knowledge Management, Proceedings of PAKM 2004, Vienna, Austria, December 2–3, 2004. Springer-Verlag, Berlin Heidelberg.
- Bertino, Elisa; Piero, Gian; Zarria, B.C. (2001). Intelligent Database Systems. Addison-Wesley Professional.
- John Cabral & others (2005). "Converting Semantic Meta-Knowledge into Inductive Bias". In: Proceedings of the 15th International Conference on Inductive Logic Programming. Bonn, Germany, August 2005.
- Jon Curtis et al. (2005). "On the Effective Use of Cyc in a Question Answering System". In: Papers from the IJCAI Workshop on Knowledge and Reasoning for Answering Questions. Edinburgh, Scotland: 2005.
- Chris Deaton et al. (2005). "The Comprehensive Terrorism Knowledge Base in Cyc". In: Proceedings of the 2005 International Conference on Intelligence Analysis, McLean, Virginia, May 2005.
- Kenneth Forbus et al. (2005) ."Combining analogy, intelligent information retrieval, and knowledge integration for analysis: A preliminary report". In: Proceedings of the 2005 International Conference on Intelligence Analysis, McLean, Virginia, May 2005
- douglas foxvog (2010), "Cyc". In: Theory and Applications of Ontology: Computer Applications Archived 2018-11-12 at the Wayback Machine, Springer.
- Fritz Lehmann and d. foxvog (1998), "Putting Flesh on the Bones: Issues that Arise in Creating Anatomical Knowledge Bases with Rich Relational Structures". In: Knowledge Sharing across Biological and Medical Knowledge Based Systems, AAAI.
- Douglas Lenat and R. V. Guha (1990). Building Large Knowledge-Based Systems: Representation and Inference in the Cyc Project. Addison-Wesley. ISBN 0-201-51752-3.
- Douglas Lenat and Gary Marcus, "Getting from Generative AI to Trustworthy AI: What LLMs might learn from Cyc", July 31, 2023
- James Masters (2002). "Structured Knowledge Source Integration and its applications to information fusion". In: Proceedings of the Fifth International Conference on Information Fusion. Annapolis, MD, July 2002.
- James Masters and Z. Güngördü (2003). ."Structured Knowledge Source Integration: A Progress Report" In: Integration of Knowledge Intensive Multiagent Systems. Cambridge, Massachusetts, USA, 2003.
- Cynthia Matuszek et al. (2006). "An Introduction to the Syntax and Content of Cyc.". In: Proc. of the 2006 AAAI Spring Symposium on Formalizing and Compiling Background Knowledge and Its Applications to Knowledge Representation and Question Answering. Stanford, 2006
- Cynthia Matuszek et al. (2005) ."Searching for Common Sense: Populating Cyc from the Web". In: Proceedings of the Twentieth National Conference on Artificial Intelligence. Pittsburgh, Pennsylvania, July 2005.
- Tom O'Hara et al. (2003). "Inducing criteria for mass noun lexical mappings using the Cyc Knowledge Base and its Extension to WordNet". In: Proceedings of the Fifth International Workshop on Computational Semantics. Tilburg, 2003.
- Fabrizio Morbini and Lenhart Schubert (2009). "Evaluation of EPILOG: a Reasoner for Episodic Logic". University of Rochester, Commonsense '09 Conference (describes Cyc's library of ~1600 'Commonsense Tests')
- Kathy Panton et al. (2002). "Knowledge Formation and Dialogue Using the KRAKEN Toolset". In: Eighteenth National Conference on Artificial Intelligence. Edmonton, Canada, 2002.
- Deepak Ramachandran P. Reagan & K. Goolsbey (2005). "First-Orderized ResearchCyc: Expressivity and Efficiency in a Common-Sense Ontology" Archived 2014-03-24 at the Wayback Machine. In: Papers from the AAAI Workshop on Contexts and Ontologies: Theory, Practice and Applications. Pittsburgh, Pennsylvania, July 2005.
- Stephen Reed and D. Lenat (2002). "Mapping Ontologies into Cyc". In: AAAI 2002 Conference Workshop on Ontologies For The Semantic Web. Edmonton, Canada, July 2002.
- Benjamin Rode et al. (2005). "Towards a Model of Pattern Recovery in Relational Data". In: Proceedings of the 2005 International Conference on Intelligence Analysis. McLean, Virginia, May 2005.
- Dave Schneider et al. (2005). "Gathering and Managing Facts for Intelligence Analysis". In: Proceedings of the 2005 International Conference on Intelligence Analysis. McLean, Virginia, May 2005.
- Schneider, D., & Witbrock, M. J. (2015, May). "Semantic construction grammar: bridging the NL/Logic divide" In Proceedings of the 24th International Conference on World Wide Web (pp. 673–678).
- Blake Shepard et al. (2005). "A Knowledge-Based Approach to Network Security: Applying Cyc in the Domain of Network Risk Assessment". In: Proceedings of the Seventeenth Innovative Applications of Artificial Intelligence Conference. Pittsburgh, Pennsylvania, July 2005.
- Nick Siegel et al. (2004). "Agent Architectures: Combining the Strengths of Software Engineering and Cognitive Systems". In: Papers from the AAAI Workshop on Intelligent Agent Architectures: Combining the Strengths of Software Engineering and Cognitive Systems. Technical Report WS-04-07, pp. 74–79. Menlo Park, California: AAAI Press, 2004.
- Nick Siegel et al. (2005). Hypothesis Generation and Evidence Assembly for Intelligence Analysis: Cycorp's Nooscape Application". In Proceedings of the 2005 International Conference on Intelligence Analysis, McLean, Virginia, May 2005.
- Michael Witbrock et al. (2002). "An Interactive Dialogue System for Knowledge Acquisition in Cyc". In: Proceedings of the Eighteenth International Joint Conference on Artificial Intelligence. Acapulco, Mexico, 2003.
- Michael Witbrock et al. (2004). "Automated OWL Annotation Assisted by a Large Knowledge Base". In: Workshop Notes of the 2004 Workshop on Knowledge Markup and Semantic Annotation at the 3rd International Semantic Web Conference ISWC2004. Hiroshima, Japan, November 2004, pp. 71–80.
- Michael Witbrock et al. (2005). "Knowledge Begets Knowledge: Steps towards Assisted Knowledge Acquisition in Cyc". In: Papers from the 2005 AAAI Spring Symposium on Knowledge Collection from Volunteer Contributors (KCVC). pp. 99–105. Stanford, California, March 2005.
- William Jarrold (2001). "Validation of Intelligence in Large Rule-Based Systems with Common Sense". "Model-Based Validation of Intelligence: Papers from the 2001 AAAI Symposium" (AAAI Technical Report SS-01-04).
- William Jarrold. (2003). Using an Ontology to Evaluate a Large Rule Based Ontology: Theory and Practice. {\em Performance Metrics for Intelligent Systems PerMIS '03} (NIST Special Publication 1014).
- Cycorp website
- Cyc: Obituary for the greatest monument to logical AGI Article by Yuxi Liu (UC Berkeley), 2025