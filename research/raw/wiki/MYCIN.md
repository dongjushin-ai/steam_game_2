Source: https://en.wikipedia.org/wiki/MYCIN
Mycin - Wikipedia
MYCIN was an early backward chaining expert system that used black box to identify bacteria causing severe infections, such as bacteremia and meningitis, and to recommend antibiotics, with the dosage adjusted for patient's body weight — the name derived from the antibiotics themselves, as many antibiotics have the suffix "-mycin". The Mycin system was also used for the diagnosis of blood clotting diseases. MYCIN was developed over five or six years in the early 1970s at Stanford University. It was written in Lisp as the doctoral dissertation of Edward Shortliffe under the direction of Bruce G. Buchanan, Stanley N. Cohen and others.
MYCIN emerged from the Stanford Heuristic Programming Project. MYCIN demonstrated the potential for expert systems in building high-performance medical reasoning programs. MYCIN is often viewed as a pioneer in the field of expert systems, even being referred to as the "grandaddy of them all-the one that launched the field" by Dr. Allen Newell.
MYCIN led to the EMYCIN expert system shell ("essential MYCIN") for acquiring knowledge, reasoning with it, and explaining the results, without the specific medical knowledge. It can be described as "EMYCIN = Prolog + uncertainty + caching + questions + explanations + contexts - variables". An introduction is in Chapter 16 of Paradigms of Artificial Intelligence Programming (PAIP).

## Method
MYCIN operated using a fairly simple inference engine and a knowledge base of ~600 rules by obtaining individual inferential facts identified by experts and encoding such facts as individual production rules. No other AI program at the time contained as much domain-specific knowledge clearly separated from its inference procedures as MYCIN. It would query the physician running the program via a long series of simple yes/no or textual questions. At the end, it provided a list of possible culprit bacteria ranked from high to low based on the probability of each diagnosis, its confidence in each diagnosis' probability, the reasoning behind each diagnosis (that is, MYCIN would also list the questions and rules which led it to rank a diagnosis a particular way), and its recommended course of drug treatment. MYCIN could additionally respond to queries by physicians related to why it asked the user a certain question, how it arrived at a conclusion, and why it did not consider certain factors.
The developers performed studies showing that MYCIN's performance was minimally affected by perturbations in the uncertainty metrics associated with individual rules, suggesting that the power in the system was related more to its knowledge representation and reasoning scheme than to the details of its numerical uncertainty model. Some observers felt that it should have been possible to use classical Bayesian statistics. MYCIN's developers argued that this would require either unrealistic assumptions of probabilistic independence, or require the experts to provide estimates for an unfeasibly large number of conditional probabilities.
Subsequent studies later showed that the certainty factor model could indeed be interpreted in a probabilistic sense, and highlighted problems with the implied assumptions of such a model. However the modular structure of the system would prove very successful, leading to the development of graphical models such as Bayesian networks.

## Context
A context in MYCIN determines what types of objects can be reasoned about. They are similar to variables in Prolog, or environment variables in operating systems.

## Evidence combination
In MYCIN it was possible that two or more rules might draw conclusions about a parameter with different weights of evidence. For example, one rule may conclude that the organism in question is E. Coli with a certainty of 0.8 whilst another concludes that it is E. Coli with a certainty of 0.5 or even −0.8. In the event the certainty is less than zero the evidence is actually against the hypothesis. In order to calculate the certainty factor MYCIN combined these weights using the formula below to yield a single certainty factor:
Where X and Y are the certainty factors. This formula can be applied more than once if more than two rules draw conclusions about the same parameter. It is commutative, so it does not matter in which order the weights were combined.
The combination formula was designed to have the following desirable properties:
- −1 can be interpreted as "false", +1 as "true", and 0 as "uncertain".
- Combining unknown with anything leaves it unchanged.
- Combining true with anything (except false) gives true. Similarly for false.
- Combining true and false is a division-by-zero error.
- Combining +x and -x gives unknown.
- Combining two positives (except true) gives a larger positive. Similarly for negatives.
- Combining a positive and a negative gives something in between.

## Examples
The following examples come from Chapter 16 of PAIP, which contains an implementation in Common Lisp of a modified and simplified version of MYCIN for pedagogical purposes.
A rule, and an English paraphrase generated by the system:

## Results
An evaluation of MYCIN was conducted at the Stanford Medical School. The first phase of the evaluation consisted of 10 test cases of diverse origin, chosen by a physician who was not acquainted with MYCIN's methods or knowledge base. These cases were presented to 7 physicians and 1 senior medical student. 10 prescriptions were compiled for each of the cases, 1 recommended by MYCIN, 1 prescribed by the treating physician at the county hospital, and 8 by the aforementioned individuals. The second phase of the evaluation consisted of eight infectious disease specialists being provided the clinical summary and set of 10 prescriptions for each of the 10 cases and tasked to provide their own recommendations for each case and assess the 10 prescriptions. MYCIN received an acceptability rating of 65%, which was comparable to the 42.5% to 62.5% rating of five faculty members. This study is often cited as showing the potential for disagreement about therapeutic decisions, even among experts, when there is no "gold standard" for correct treatment.

## Practical use
MYCIN was never actually used in practice. This wasn't because of any weakness in its performance. Some observers raised ethical and legal issues related to the use of computers in medicine, regarding the responsibility of the physicians in case the system gave wrong diagnosis. However, the greatest problem, and the reason that MYCIN was not used in routine practice, was the state of technologies for system integration, especially at the time it was developed. MYCIN was a stand-alone system that required a user to enter all relevant information about a patient by typing in responses to questions MYCIN posed. MYCIN ran on the DEC KI10 PDP-10, supporting a large time-shared system available over the early Internet (ARPANet), before personal computers were developed.
MYCIN's greatest influence was accordingly its demonstration of the power of its representation and reasoning approach. Rule-based systems in many non-medical domains were developed in the years that followed MYCIN's introduction of the approach. In the 1980s, expert system "shells" were introduced (including one based on MYCIN, known as E-MYCIN (followed by Knowledge Engineering Environment - KEE)) and supported the development of expert systems in a wide variety of application areas. A difficulty that rose to prominence during the development of MYCIN and subsequent complex expert systems has been the extraction of the necessary knowledge for the inference engine to use from the human expert in the relevant fields into the rule base (the so-called "knowledge acquisition bottleneck").
- CADUCEUS (expert system)
- Internist-I
- Clinical decision support system
- XCON
- Winston, Patrick Henry, ed. (1986). The AI business: the commercial uses of artificial intelligence (4. print ed.). Cambridge, Mass.: MIT Pr. ISBN 978-0-262-23117-6.
- Paradigms of Artificial Intelligence Programming, Chapter 16.
- Rule-Based Expert Systems: The MYCIN Experiments of the Stanford Heuristic Programming Project -(edited by Bruce G. Buchanan and Edward H. Shortlife; ebook version)
- TMYCIN, system based on MYCIN
- "Mycin Expert System: A Ruby Implementation" (at the Web Archive).
- "MYCIN: A Quick Case Study"
- "Some Expert System Need Common Sense" -(by John McCarthy)
- "Expert Systems"