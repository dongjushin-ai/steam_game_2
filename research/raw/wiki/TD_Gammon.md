Source: https://en.wikipedia.org/wiki/TD-Gammon
TD-Gammon - Wikipedia
TD-Gammon is a computer backgammon program developed in the 1990s by Gerald Tesauro at IBM's Thomas J. Watson Research Center. Its name comes from the fact that it is an artificial neural net trained by a form of temporal-difference learning, specifically TD-Lambda. It explored strategies that humans had not pursued and led to advances in the theory of correct backgammon play.
In 1993, TD-Gammon (version 2.1) was trained with 1.5 million games of self-play, and achieved a level of play just slightly below that of the top human backgammon players of the time. In 1998, during a 100-game series, it was defeated by the world champion by a mere margin of 8 points. Its unconventional assessment of some opening strategies had been accepted and adopted by expert players.
TD-gammon is commonly cited as an early success of reinforcement learning and neural networks, and was cited in, for example, papers for deep Q-learning and AlphaGo.

## Algorithm for play and learning
During play, TD-Gammon examines on each turn all possible legal moves and all their possible responses (lookahead search), feeds each resulting board position into its evaluation function, and chooses the move that leads to the board position that got the highest score. In this respect, TD-Gammon is no different than almost any other computer board-game program. TD-Gammon's innovation was in how it learned its evaluation function.
TD-Gammon's learning algorithm consists of updating the weights in its neural net after each turn to reduce the difference between its evaluation of previous turns' board positions and its evaluation of the present turn's board position—hence "temporal-difference learning". The score of any board position is a set of four numbers reflecting the program's estimate of the likelihood of each possible game result: White wins normally, Black wins normally, White wins a gammon, Black wins a gammon. For the final board position of the game, the algorithm compares with the actual result of the game rather than its own evaluation of the board position.
The core of TD-gammon is a neural network with 3 layers.
- The input layer has two types of neurons. One type codes for the board position. They are non-negative integers ranging from 0 to 15, indicating the number of White or Black checkers at each board location. There are 99 input neurons for each, totaling 198 neurons. Another type codes for hand-crafted features previously used in Neurogammon. These features encoded standard concepts used by human experts, such as "advanced anchor," "blockade strength," "home board strength" and the probability of a "blot" (single checker) being hit.
- One type codes for the board position. They are non-negative integers ranging from 0 to 15, indicating the number of White or Black checkers at each board location. There are 99 input neurons for each, totaling 198 neurons.
- Another type codes for hand-crafted features previously used in Neurogammon. These features encoded standard concepts used by human experts, such as "advanced anchor," "blockade strength," "home board strength" and the probability of a "blot" (single checker) being hit.
- The hidden layer contains hidden neurons. Later versions had more of these.
- The output layer contains 4 neurons, representing the network's estimate of the probability ("equity") that the current board would lead to. The 4 neurons code for: White normal win, White gammon win, Black normal win, Black gammon win. Backgammon win is so rare that Tesauro opted to not represent it.
After each turn, the learning algorithm updates each weight in the neural net according to the following rule:
where:
| w t + 1 − w t {\displaystyle w_{t+1}-w_{t}}
| is the amount to change the weight from its value on the previous turn.
| Y t + 1 − Y t {\displaystyle Y_{t+1}-Y_{t}}
| is the difference between the current and previous turn's board evaluations.
| α {\displaystyle \alpha }
| is a "learning rate" parameter.
| λ {\displaystyle \lambda }
| is a parameter that affects how much the present difference in board evaluations should feed back to previous estimates. λ = 0 {\displaystyle \lambda =0} makes the program correct only the previous turn's estimate; λ = 1 {\displaystyle \lambda =1} makes the program attempt to correct the estimates on all previous turns; and values of λ {\displaystyle \lambda } between 0 and 1 specify different rates at which the importance of older estimates should "decay" with time.
| ∇ w Y k {\displaystyle \nabla _{w}Y_{k}}
| is the gradient of neural-network output with respect to weights: that is, how much changing the weight affects the output.
It was found that picking small λ {\displaystyle \lambda } offered performance roughly equally good, and large λ {\displaystyle \lambda } degraded performance. Because of this, after 1992, TD-Gammon was trained with λ = 0 {\displaystyle \lambda =0} , degenerating into standard TD-learning. This saved compute by a factor of 2.

## Development history
| Version
| Year
| Hidden Units
| Training Games (in millions)
| Search Ply
| Notes
| 0.0
| 1991
| 40
| 0.2
| 1
| All features learned ("knowledge-free").
| 1.0
| 1991
| 80
| 0.3
| 1
| Played 51 games vs grandmasters at -13 points (~ -0.25 ppg). Began using hand-crafted features.
| 2.0
| 1992
| 80
| 0.8
| 2
| Played 38 exhibition games at -7 points (~ -0.18 ppg).
| 2.1
| 1993
| 80
| 1.5
| 2
| Played 40 games vs Bill Robertie at -1 point. Rollout analysis showed stronger moves (-0.163 ppg vs -0.188 ppg) and doubling (-0.013 ppg vs -0.081 ppg) than Robertie.
| 3.0
| 1995
| 80
| 1.5
| 3
| Estimated +0.07 to +0.08 ppg vs v2.1. Won 25-point match vs Neil Kazaross.
| 3.1
| 1998
| 160
| > 6
| 3
| Played 100 games vs Malcolm Davis at -8 points. Rollout analysis showed stronger moves (-0.050 ppg vs -0.183 ppg).
Version 1.0 used simple 1-ply search: every next move is scored by the neural net, and the highest-scoring move is selected.
Versions 2.0 and 2.1 used 2-ply search:
- Make a 1-ply analysis to remove unlikely moves ("forward pruning").
- Make a 2-play minimax analysis for only the likely moves. Pick the best move, probability-weighted by each of the opponent's 21 possible dice rolls (weighting non-doubles twice as much as doubles).
Versions 3.0 and 3.1 used 3-ply search, using 21 2 = 441 {\displaystyle 21^{2}=441} possible dice rolls instead of 21.
The last version, 3.1, was trained specifically for an exhibition match against Malcolm Davis at the 1998 AAAI Hall of Champions. It lost at -8 points, mainly due to one blunder, where TD-Gammon opted to double and got gammoned at -32 points.

## Experiments and stages of training
Unlike previous neural-net backgammon programs such as Neurogammon (also written by Tesauro), where an expert trained the program by supplying the "correct" evaluation of each position, TD-Gammon was at first programmed "knowledge-free". In early experimentation, using only a raw board encoding with no human-designed features, TD-Gammon reached a level of play comparable to Neurogammon: that of an intermediate-level human backgammon player.
Even though TD-Gammon discovered insightful features on its own, Tesauro wondered if its play could be improved by using hand-designed features like Neurogammon's. Indeed, the self-training TD-Gammon with expert-designed features soon surpassed all previous computer backgammon programs. It stopped improving after about 1,500,000 games (self-play) using a three-layered neural network, with 198 input units encoding expert-designed features, 80 hidden units, and one output unit representing predicted probability of winning.

## Advances in backgammon theory
TD-Gammon's exclusive training through self-play (rather than imitation learning) enabled it to explore strategies that humans previously had not considered or had ruled out erroneously. Its success with unorthodox strategies had a significant impact on the backgammon community.
Late 1991, Bill Robertie, Paul Magriel, and Malcolm Davis, were invited to play against TD-Gammon (version 1.0). A total of 51 games were played, with TD-Gammon losing at -0.25 ppg. Robertie found TD-Gammon to be at the level of a competent advanced player, and better than any previous backgammon program. Robertie subsequently wrote about the use of TD-Gammon for backgammon study.
For example, on the opening play, the conventional wisdom was that given a roll of 2-1, 4-1, or 5-1, White should move a single checker from point 6 to point 5. Known as "slotting", this technique trades the risk of a hit for the opportunity to develop an aggressive position. TD-Gammon found that the more conservative play of splitting 24-23 was superior. Tournament players began experimenting with TD-Gammon's move, and found success. Within a few years, slotting had disappeared from tournament play, replaced by splitting, though in 2006 it made a reappearance for 2-1.
Backgammon expert Kit Woolsey found that TD-Gammon's positional judgement, especially its weighing of risk against safety, was superior to his own or any human's.
TD-Gammon's excellent positional play was undercut by occasional poor endgame play. The endgame requires a more analytical approach, sometimes with extensive lookahead. TD-Gammon's limitation to two-ply lookahead put a ceiling on what it could achieve in this part of the game. TD-Gammon's strengths and weaknesses were the opposite of symbolic artificial intelligence programs and most computer software in general: it was good at matters that require an intuitive "feel" but bad at systematic analysis.
It is also poor at doubling strategies. This is likely due to the fact that the neural network is trained without the doubling cube, with the doubling added by feeding the neural network's cubeless equity estimates into theoretically-based heuristic formulae. This was particularly the case in the 1998 exhibition match, where it played 100 games against Malcolm Davis. A single doubling blunder lost the match.
TD-gammon was never commercialized or released to the public in some other form, but it inspired commercial backgammon programs based on neural networks, such as JellyFish (1994) and Snowie (1998).
- Games portal
- World Backgammon Federation
- Sutton, Richard S.; Barto, Andrew G. (2018). "11.1 TD-Gammon". Reinforcement Learning: An Introduction (2nd ed.). Cambridge, MA: MIT Press.

## Works by Tesauro
- Tesauro, Gerald (1989). "Neurogammon Wins Computer Olympiad". Neural Computation. 1 (3): 321–323. doi:10.1162/neco.1989.1.3.321. ISSN 0899-7667.
- G. Tesauro, Optimal doubling in multi-outcome probabilistic games. IBM Research, unpublished manuscript (1990).
- Tesauro, Gerald (1991). "Practical Issues in Temporal Difference Learning". Advances in Neural Information Processing Systems. 4. Morgan-Kaufmann.
- Tesauro, Gerald (1995). "Temporal difference learning and TD-Gammon". Communications of the ACM. 38 (3): 58–68. doi:10.1145/203330.203343. ISSN 0001-0782.
- Tesauro, Gerald; Galperin, Gregory (1996). "On-line Policy Improvement using Monte-Carlo Search". Advances in Neural Information Processing Systems. 9. MIT Press.
- TD-Gammon at IBM
- TD-Gammon on GitHub
- TD-Gammon, a draft by Gerald Tesauro on Scholarpedia.