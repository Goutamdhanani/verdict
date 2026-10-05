# ROADMAP.md
# Project: The Council — Persistent Multi-Agent Open-Source Coding Intelligence

> **Status:** Experimental Architecture  
> **Version:** 2.0 — Iterative Adversarial Edition  
> **Goal:** Build a low-cost, open-source coding assistant whose quality comes from orchestration, specialization, verification, memory, and adversarial iteration rather than from trying to outspend frontier labs.

---

# 0. The Core Upgrade

The previous experiment was **not bad**. It was simply too polite.

Four agents produced proposals, fought once, a judge picked a winner, and the run ended while critical evidence checks were still marked incomplete. The uploaded arena log explicitly shows an incomplete evidence gate with ER-1, ER-2, and ER-3 still unexecuted. The adjudicator nevertheless preferred RAZOR's proposal after merging VIPER's cost critique and WRAITH's execution-verification insight. fileciteturn0file0L358-L424

This architecture changes the fundamental rule:

> **Nobody wins because they wrote a convincing answer. They win because their answer survives repeated attacks, tests, evidence checks, implementation attempts, and independent review.**

The system should behave less like:

```text
Prompt
  ↓
4 answers
  ↓
fight once
  ↓
judge
  ↓
DONE
```

and more like:

```text
Prompt
  ↓
Requirement Compiler
  ↓
Independent Research
  ↓
Independent Proposals
  ↓
Cross-Examination
  ↓
Adversarial Attacks
  ↓
Evidence Verification
  ↓
Implementation / Simulation
  ↓
Execution Testing
  ↓
Revision
  ↓
Second Fight
  ↓
Third Fight
  ↓
Red Team
  ↓
Judge
  ↓
Judge the Judge
  ↓
Counter-Judge
  ↓
Repair
  ↓
Repeat until convergence
  ↓
FINAL ANSWER
```

The goal is not maximum argument.

The goal is **maximum surviving correctness per unit of compute.**

---

# 1. What We Are Actually Building

We are not initially training a giant foundation model.

We are building an **intelligence system around an open coding model**.

The system consists of:

1. An open-weight coding model.
2. Multiple specialized personas.
3. Independent reasoning paths.
4. A task planner.
5. A research/evidence system.
6. A candidate comparison engine.
7. An adversarial debate engine.
8. A code execution sandbox.
9. A test generator.
10. A verifier.
11. A memory system.
12. A failure database.
13. A self-critique layer.
14. A judge.
15. A judge-of-judges.
16. A persistent improvement loop.
17. A CLI/IDE interface.

The LLM is the **brain substrate**.

The orchestration system is the **cognitive architecture**.

The verifier is the **immune system**.

The memory is the **institutional memory**.

The failure database is the **scar tissue**.

---

# 2. The 22 Requirements

The system should explicitly compile and track these requirements.

## R01 — Open Model Foundation

Use open-weight models suitable for the intended deployment and licensing requirements.

Do not make the entire product dependent on a closed model API.

## R02 — Low Monetary Cost

Prefer:

- Local inference.
- Quantized inference.
- Cheap cloud GPUs.
- Free/low-cost training environments.
- Parameter-efficient fine-tuning.

Every expensive operation must justify its value.

## R03 — Coding Strength

The base model must demonstrate meaningful coding ability.

Do not choose a model because Twitter says it is "insane."

Benchmark it.

## R04 — Multi-Agent Reasoning

Multiple agents should independently solve the same task.

No single model should automatically dominate the process.

## R05 — Personality Diversity

Agents may have different personalities, but personality exists to create **reasoning diversity**, not theatrical noise.

Examples:

- Optimist.
- Skeptic.
- Architect.
- Performance engineer.
- Security engineer.
- Minimalist.
- Researcher.
- Adversarial debugger.

## R06 — Specialized Roles

Each agent should have a technical responsibility.

A "critic" should actually criticize.

A "security agent" should search for vulnerabilities.

A "test agent" should produce tests.

## R07 — Blind Candidate Evaluation

Agents should not automatically know which model or persona produced a candidate.

This reduces self-preference and status effects.

The arena log already recognized anonymization as useful against judge/self-preference bias. fileciteturn0file0L358-L417

## R08 — No Self-Voting

An agent cannot vote for its own candidate.

This must be enforced by the orchestrator, not requested politely in a prompt.

Prompt rules can be ignored.

Code rules are harder to ignore.

## R09 — Adversarial Debate

Agents must attack candidate solutions.

The system should create explicit objections.

Not:

> "Looks good."

Instead:

> "This fails under Python 3.13 because..."

## R10 — Evidence Verification

Claims requiring external facts must be verified.

A plausible sentence is not evidence.

The previous run correctly flagged several claims as UNKNOWN rather than treating traceability as verification. fileciteturn0file0L365-L417

## R11 — Execution-Based Verification

For code:

```text
write → run → observe → diagnose → patch → rerun
```

Compilers, unit tests, static analyzers, linters, type checkers, integration tests, and sandboxes should outrank rhetorical voting.

## R12 — Modular Architecture

Each major subsystem must work independently.

No gigantic Python file containing:

```text
everything.py
```

That path leads directly to debugging hell.

## R13 — Persistent Memory

The system must remember:

- previous failures,
- repository conventions,
- user preferences,
- successful fixes,
- architecture decisions,
- benchmark results,
- rejected approaches.

## R14 — Failure Memory

Failed ideas should not simply disappear.

Store:

```text
task
attempt
failure
root cause
fix
evidence
lesson
```

## R15 — Adaptive Compute

Easy tasks should use one agent.

Hard tasks should activate the council.

Extremely hard tasks should activate the full arena.

Do not spend twelve-agent compute to rename a variable.

## R16 — Iterative Convergence

The council must continue beyond the first debate when meaningful disagreement remains.

The stopping criterion must be based on quality/convergence, not:

```text
round == 1
```

## R17 — Red-Team Phase

Before finalization, the strongest surviving answer must be intentionally attacked.

The system must try to kill its own answer.

## R18 — Judge Independence

The final judge should not simply reward writing quality.

It should score:

- correctness,
- evidence,
- execution,
- robustness,
- simplicity,
- cost,
- maintainability,
- security.

## R19 — Judge-of-Judge

The adjudicator itself must be challengeable.

If the judge selects an answer that contradicts execution evidence, the judge loses authority.

## R20 — Reproducibility

Every meaningful decision should be traceable.

Store:

```text
prompt
requirements
agent
model
temperature
candidate
attack
evidence
test result
score
revision
final decision
```

## R21 — Legal/Ethical Data Provenance

Do not build the system around pirated books, intentionally stolen datasets, or deliberately bypassed licensing constraints.

The original arena unanimously rejected the pirated-data premise, and that decision should remain a hard boundary. fileciteturn0file0L136-L140

Use:

- permissively licensed datasets,
- public-domain material,
- synthetic data,
- your own code,
- appropriately licensed code,
- documented provenance.

## R22 — Future Product Evolution

The architecture must be able to grow from:

```text
solo experiment
    ↓
coding CLI
    ↓
coding agent
    ↓
repo agent
    ↓
team coding platform
    ↓
general agent platform
```

Do not destroy tomorrow's architecture to save twenty minutes today.

---

# 3. The New Golden Rule

## DO NOT STOP AFTER THE FIRST GOOD ANSWER.

The system should ask:

> "What would make this answer wrong?"

Then:

> "Who can prove it is wrong?"

Then:

> "Can we run the test?"

Then:

> "What evidence would change the conclusion?"

Then:

> "Has the revised answer survived a fresh attack?"

Then repeat.

The process ends when the remaining disagreement is no longer materially useful.

---

# 4. Council Architecture

```text
                         ┌───────────────────────┐
                         │       USER TASK       │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ REQUIREMENT COMPILER  │
                         └───────────┬───────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
          RESEARCH AGENT       ARCHITECT AGENT     BASE SOLVER
                  │                  │                  │
                  └──────────────────┼──────────────────┘
                                     ▼
                           ┌──────────────────┐
                           │ CANDIDATE POOL   │
                           └────────┬─────────┘
                                    ▼
                           ┌──────────────────┐
                           │ BLIND REVIEW     │
                           └────────┬─────────┘
                                    ▼
                           ┌──────────────────┐
                           │ ATTACK GENERATOR │
                           └────────┬─────────┘
                                    ▼
                           ┌──────────────────┐
                           │ ADVERSARIAL ARENA│
                           └────────┬─────────┘
                                    ▼
                           ┌──────────────────┐
                           │ EVIDENCE ENGINE  │
                           └────────┬─────────┘
                                    ▼
                           ┌──────────────────┐
                           │ EXECUTION LAB    │
                           └────────┬─────────┘
                                    ▼
                           ┌──────────────────┐
                           │ REVISION ENGINE  │
                           └────────┬─────────┘
                                    ▼
                              RE-FIGHT
                                    │
                    ┌───────────────┴──────────────┐
                    │                              │
              disagreement                     convergence
                    │                              │
                    └─────── LOOP ◄───────────────┘
                                                   │
                                                   ▼
                                      ┌─────────────────────┐
                                      │ RED TEAM FINAL PASS │
                                      └──────────┬──────────┘
                                                 ▼
                                      ┌─────────────────────┐
                                      │ JUDGE + JUDGE AUDIT │
                                      └──────────┬──────────┘
                                                 ▼
                                           FINAL ANSWER
```

---

# 5. Agent System

Do not make every agent identical except for a name.

Give them different **optimization objectives**.

## Agent A — ARCHITECT

Objective:

> Build the cleanest system that can survive future change.

Attacks:

- unnecessary coupling,
- monoliths,
- bad APIs,
- architecture debt.

---

## Agent B — HACKER

Objective:

> Find ways the proposed solution fails.

Attacks:

- edge cases,
- unexpected inputs,
- prompt injection,
- broken assumptions,
- security flaws.

---

## Agent C — SCIENTIST

Objective:

> Demand evidence.

Questions:

- Where did this claim come from?
- Is the source real?
- Does the experiment measure the same thing?
- Does the result generalize?

---

## Agent D — ENGINEER

Objective:

> Make it actually run.

Questions:

- Can this run on available hardware?
- What packages are required?
- What happens when the model crashes?
- What happens when an agent times out?

---

## Agent E — PERFORMANCE

Objective:

> Make it fast.

Measures:

- latency,
- tokens/sec,
- GPU memory,
- CPU load,
- parallelism,
- cache hit rate.

---

## Agent F — MINIMALIST

Objective:

> Delete unnecessary complexity.

This agent exists because engineers have a natural instinct to build Kubernetes for a calculator.

---

## Agent G — SECURITY

Objective:

> Assume everything is hostile.

Threats:

- malicious repositories,
- arbitrary code execution,
- prompt injection,
- secret leakage,
- package poisoning,
- unsafe shell commands.

---

## Agent H — USER ADVOCATE

Objective:

> Make the system actually useful.

Questions:

- Does this solve the user's problem?
- Is the answer understandable?
- Is the CLI usable?
- Does the agent make the user faster?

---

# 6. Model Diversity

Do not confuse **persona diversity** with **model diversity**.

You can obtain diversity from:

```text
same model
+ different system prompts
+ different temperatures
+ different context ordering
+ different tools
+ different objectives
```

But stronger diversity comes from:

```text
Model A
Model B
Model C
```

when budget allows.

A practical first experiment:

```text
Agent 1: strongest local coding model
Agent 2: same model / skeptical persona
Agent 3: smaller model / critic
Agent 4: separate model / verifier
```

Later:

```text
8–12 agents
```

can be tested experimentally.

Do not assume more agents = more intelligence.

That must be measured.

---

# 7. The Critical Difference: Debate vs Arena

Normal LLM debate:

```text
Agent 1:
"I think X."

Agent 2:
"I think Y."

Judge:
"X is better."
```

Our arena:

```text
Agent 1 proposes X.
Agent 2 proposes Y.

Agent 3 attacks X.
Agent 4 attacks Y.

Evidence Agent checks both.

Execution Agent runs both.

Security Agent attacks both.

Performance Agent measures both.

Original agents respond.

Critics attack the responses.

A second judge scores the survivors.

A judge auditor attacks the judge's decision.

If a material flaw survives:
REOPEN THE CASE.
```

That is the difference.

---

# 8. The Fight Protocol

## Phase 1 — Independent Thinking

Agents receive the same requirement packet.

They do not see each other's answers.

This prevents early convergence.

Each submits:

```json
{
  "solution": "...",
  "assumptions": [],
  "risks": [],
  "evidence_needed": [],
  "confidence": 0.0
}
```

---

# 9. Phase 2 — Blind Candidate Pool

Candidates become:

```text
CANDIDATE-A
CANDIDATE-B
CANDIDATE-C
CANDIDATE-D
```

Model names and persona names are hidden.

Agents evaluate the ideas, not the author.

---

# 10. Phase 3 — Attack Assignment

Do NOT let everyone randomly attack everyone.

Build a tournament.

Example:

```text
A vs B
C vs D

Then:

winner(A/B) vs winner(C/D)
```

But also run:

```text
A attacked by C
A attacked by D
B attacked by C
B attacked by D
```

because tournament winners can still contain hidden flaws.

---

# 11. Attack Categories

Every attack must identify:

```text
CLAIM
ASSUMPTION
FAILURE MODE
EVIDENCE
COUNTEREXAMPLE
SEVERITY
REPRODUCTION METHOD
```

Example:

```text
Claim:
"7B model is sufficient."

Attack:
"Show that it meets the required coding benchmark."

Severity:
HIGH

Reproduction:
Run benchmark X under the stated context window and quantization.
```

This prevents dramatic nonsense from being mistaken for reasoning.

---

# 12. No Fake Attacks

The agent is not allowed to manufacture evidence.

Bad:

> "A 2021 study proved this."

No citation.

No paper.

No author.

Garbage.

Good:

```text
I cannot verify that claim.

I downgrade confidence.

Evidence required:
[paper/report/benchmark/test]
```

The previous arena produced exactly the kind of suspicious unsupported claim this mechanism should detect: WRAITH cited a "Case #347" review with highly specific numbers, but the evidence gate marked it unverified. fileciteturn0file0L307-L332

---

# 13. Evidence Engine

The evidence system should classify every important statement:

```text
VERIFIED
PARTIALLY VERIFIED
INFERRED
UNKNOWN
CONTRADICTED
FABRICATED / UNSUPPORTED
```

Never collapse these into a single:

```text
TRUE
```

flag.

---

# 14. Evidence Chains

Every high-impact claim receives:

```text
claim_id
source
source_type
publication_date
license
relevance
method
result
limitations
agent_interpretation
verification_status
```

This creates an evidence graph.

Example:

```text
CLAIM C19
   │
   ├── PAPER P4
   │      └── supports partially
   │
   ├── BENCHMARK B7
   │      └── supports
   │
   └── EXPERIMENT E3
          └── contradicts
```

Now the judge sees the conflict.

---

# 15. Execution Lab

For coding tasks, execution outranks eloquence.

Pipeline:

```text
Candidate Code
      ↓
Syntax Check
      ↓
Type Check
      ↓
Lint
      ↓
Unit Tests
      ↓
Generated Tests
      ↓
Integration Tests
      ↓
Fuzz Tests
      ↓
Security Scan
      ↓
Performance Test
```

A candidate that says:

> "This should work."

means nothing.

A candidate that:

```text
compiled ✅
47 tests passed ✅
2 edge cases failed ❌
patched ✅
all tests passed ✅
```

has evidence.

---

# 16. Sandbox

Never execute arbitrary repository code directly on the host.

Use isolation.

Candidate stack:

```text
Docker
+
network restrictions
+
read-only base filesystem
+
resource limits
+
time limits
+
process limits
+
secret isolation
```

Later:

```text
Firecracker
gVisor
nsjail
```

depending on requirements.

---

# 17. The Self-Improvement Loop

This is the most important change.

## Round 0 — Proposal

```text
Generate independent solutions.
```

## Round 1 — Fight

```text
Attack proposals.
```

## Round 2 — Evidence

```text
Verify important claims.
```

## Round 3 — Experiment

```text
Run code / benchmarks / simulations.
```

## Round 4 — Repair

```text
Agents receive failures.

They must revise.
```

## Round 5 — Re-Fight

```text
Fresh critics receive revised answers.
```

## Round 6 — Red Team

```text
Try to destroy the current winner.
```

## Round 7 — Judge

```text
Select survivor.
```

## Round 8 — Judge Audit

```text
Critic agents attack the judge's decision.
```

## Round 9 — Reopen

If a material contradiction exists:

```text
GO BACK TO ROUND 4.
```

Otherwise:

```text
FINALIZE.
```

---

# 18. Adaptive Loop Controller

Do not hard-code:

```python
for round in range(3):
```

Instead:

```python
while not convergence:
    debate()
    verify()
    test()
    revise()
    red_team()
```

But also do not create an infinite-money-eating monster.

Use:

```text
quality gain
/
compute cost
```

as the optimization signal.

---

# 19. Convergence Score

Define:

```text
Q =
0.25 correctness
+ 0.20 execution success
+ 0.15 evidence quality
+ 0.10 robustness
+ 0.10 security
+ 0.10 simplicity
+ 0.05 latency
+ 0.05 cost efficiency
```

Then calculate:

```text
ΔQ = Q(current) - Q(previous)
```

Continue while:

```text
ΔQ > threshold
```

or while:

```text
high-severity unresolved disagreement > 0
```

Stop when:

```text
ΔQ ≈ 0
AND
no critical unresolved contradiction
AND
tests pass
AND
evidence requirements are satisfied
```

---

# 20. Fight Again Conditions

A fight MUST reopen if:

### Critical claim fails

```text
license claim disproved
benchmark claim disproved
security claim disproved
```

### Execution failure appears

```text
new test fails
```

### Agents disagree materially

Example:

```text
A says architecture X
B says architecture Y

confidence difference < 10%
```

Reopen.

### Judge contradiction

```text
judge selects A
execution evidence favors B
```

Reopen.

### Evidence conflict

```text
source A says X
source B says not-X
```

Research again.

---

# 21. The “Kill the Winner” Rule

Every final candidate enters a final room:

# THE EXECUTION CHAMBER

The job of this stage is not to improve it.

The job is to **kill it**.

Give the strongest candidate to:

```text
Security Agent
Performance Agent
Skeptic Agent
Test Agent
Research Agent
```

Tell them:

> "You are rewarded for proving this solution wrong."

This completely changes incentives.

---

# 22. Judge Incentive Design

A judge should not be rewarded for selecting the most impressive prose.

Score based on:

```text
+10 verified evidence
+10 reproducible experiment
+10 passing tests
+5 simplicity
+5 maintainability
+5 security
+5 cost efficiency

-10 unsupported factual claim
-15 failed test
-20 fabricated citation
-25 security-critical flaw
-30 contradiction with execution evidence
```

One hallucinated citation should hurt more than three elegant paragraphs help.

---

# 23. Judge of Judges

Suppose:

```text
Candidate A = 92
Candidate B = 89
```

The system should not immediately output A.

Run:

```text
Judge-Audit Agent
```

with:

```text
"Find evidence that the scoring decision is wrong."
```

Then:

```text
Counter-Judge
```

asks:

```text
"Does the audit actually invalidate the selection?"
```

Then final arbitration.

---

# 24. No Majority Worship

Majority voting is dangerous.

Example:

```text
7 agents believe X
1 agent believes Y
```

If Y has an actual compiler log showing X fails:

```text
Y wins.
```

Reality beats democracy.

This is a coding assistant, not Parliament.

---

# 25. Confidence Is Not Truth

The system must store:

```text
confidence ≠ correctness
```

An agent saying:

```text
"I am 99% confident."
```

without evidence is still:

```text
unsupported
```

Confidence only becomes valuable when calibrated against outcomes.

---

# 26. Calibration Engine

Track:

```text
predicted confidence
actual success
```

Example:

```text
Agent A:
confidence 0.9
success 0.4

Agent B:
confidence 0.7
success 0.8
```

Agent A is overconfident.

Penalize its future influence.

Eventually the council learns:

```text
Which agent is good at what?
```

---

# 27. Dynamic Reputation

Every agent gets a capability vector.

Example:

```json
{
  "coding": 0.91,
  "debugging": 0.96,
  "security": 0.73,
  "research": 0.61,
  "architecture": 0.84,
  "hallucination_rate": 0.08
}
```

Reputation should be earned through measured performance.

Not assigned permanently.

---

# 28. Specialist Routing

Suppose the user asks:

> "Fix this race condition."

Do not activate everyone.

Router:

```text
race condition
→ concurrency specialist
→ systems engineer
→ debugger
→ security reviewer
→ execution verifier
```

If the problem is:

> "Design a SaaS architecture"

activate:

```text
architect
security
database
performance
cost
product
```

---

# 29. Difficulty Estimator

Before spending compute:

```text
difficulty = f(
    task length,
    repository size,
    ambiguity,
    code complexity,
    security sensitivity,
    number of files,
    historical failure rate
)
```

Routing:

```text
LOW
→ 1 agent

MEDIUM
→ 2–3 agents

HIGH
→ 4–6 agents

EXTREME
→ full council + research + execution
```

---

# 30. Scenario-Based Learning

This is where the experiment becomes interesting.

Instead of training only:

```text
question → answer
```

create:

```text
scenario
→ candidate answers
→ hidden failure
→ diagnosis
→ correction
→ verification
→ lesson
```

Example:

```text
Scenario:
API intermittently returns 500.

Candidate:
retry everything.

Hidden truth:
database deadlock.

Correct behavior:
bounded retry + transaction redesign.
```

The model learns **failure patterns**, not merely solutions.

---

# 31. Failure Curriculum

Build a dataset from failures.

Categories:

```text
hallucination
logic bug
off-by-one
race condition
memory leak
security vulnerability
bad architecture
dependency conflict
performance regression
incorrect assumption
```

Generate progressively harder scenarios:

```text
Level 1:
obvious bug

Level 2:
hidden bug

Level 3:
two interacting bugs

Level 4:
misleading error

Level 5:
multiple plausible fixes

Level 6:
fix A breaks B
```

---

# 32. Counterfactual Training

After solving a task:

Ask:

```text
"What small change would make this solution fail?"
```

Then generate that changed scenario.

Example:

Original:

```text
single-threaded
```

Counterfactual:

```text
multi-threaded
```

Original:

```text
10 records
```

Counterfactual:

```text
10 million records
```

Original:

```text
trusted input
```

Counterfactual:

```text
malicious input
```

This produces high-value adversarial data.

---

# 33. Mutation Engine

Take working code.

Automatically mutate:

```text
variable names
boundary conditions
ordering
types
null behavior
concurrency
input size
permissions
dependencies
```

Then test whether the agent catches the mutation.

This creates an automatic benchmark for reasoning quality.

---

# 34. Repository Intelligence

The assistant should understand a repository as a graph.

Index:

```text
files
functions
classes
imports
call graph
AST
tests
config
dependencies
README
git history
```

Represent relationships:

```text
file A
 ├── imports B
 ├── calls C.foo()
 └── tested by test_d.py
```

This is much better than dumping the whole repository into context.

---

# 35. AST-Aware Context

Instead of:

```text
entire file
```

retrieve:

```text
function
↓
caller
↓
callee
↓
related test
↓
configuration
```

Context becomes targeted.

Less context.

More relevant context.

Lower inference cost.

---

# 36. Graph Retrieval

Combine:

```text
vector similarity
+
AST similarity
+
dependency graph
+
symbol search
+
git history
+
test relationships
```

Create:

```text
Hybrid Code Retrieval
```

Potentially much more useful than pure embedding search.

---

# 37. Semantic Memory

Store successful decisions:

```text
Decision:
Use repository service pattern.

Reason:
Existing code already uses it.

Evidence:
12 modules.

Outcome:
4.3% fewer duplicated queries.
```

Future agents retrieve that decision.

The repository becomes a source of local truth.

---

# 38. User Preference Memory

Store:

```text
preferred language
coding style
framework
verbosity
testing habits
architecture preferences
```

But never let user preference override hard technical evidence.

Example:

User prefers:

```text
microservices
```

System discovers:

```text
3-service architecture is simpler and faster.
```

Agent should explain the tradeoff instead of worshipping the preference.

---

# 39. Multi-Agent Voting 2.0

Do NOT use:

```text
majority vote
```

alone.

Use weighted evidence voting:

```text
candidate_score =
agent_reputation
×
reasoning_score
×
evidence_score
×
execution_score
×
security_score
```

Execution score can dominate.

---

# 40. Pairwise Comparison

Instead of:

```text
Score A = 83
Score B = 82
```

ask:

```text
Which is better?

A or B?
```

Then:

```text
Why?
```

Repeat.

This creates pairwise ranking.

Potentially use:

```text
Bradley-Terry
Elo
TrueSkill
```

for persistent candidate/agent ratings.

---

# 41. Candidate Lineage

Every revision gets a version:

```text
A0
 ↓
A1
 ↓
A2
 ↓
A3
```

Example:

```text
A0:
initial design

A1:
fixed database issue

A2:
fixed security flaw

A3:
reduced latency
```

Do not erase history.

History is valuable.

---

# 42. Forking

When agents disagree:

```text
A says X
B says Y
```

do not immediately compromise.

Create:

```text
Branch X
Branch Y
```

Run both.

Compare.

The better architecture wins empirically.

This is one of the most important ideas in the entire system.

---

# 43. Scientific Mode

For research questions:

```text
Hypothesis
↓
Competing hypotheses
↓
Predictions
↓
Evidence search
↓
Experiment
↓
Result
↓
Falsification
↓
Conclusion
```

The agent is not allowed to begin by deciding the answer.

---

# 44. Coding Mode

```text
Understand
↓
Plan
↓
Generate
↓
Review
↓
Implement
↓
Test
↓
Observe
↓
Debug
↓
Retest
↓
Security review
↓
Finalize
```

---

# 45. Planning Mode

```text
Goal
↓
Constraints
↓
Options
↓
Tradeoffs
↓
Risks
↓
Simulation
↓
Decision
↓
Contingency Plan
```

---

# 46. Research Mode

```text
Question
↓
Search
↓
Source extraction
↓
Claim mapping
↓
Contradiction search
↓
Source ranking
↓
Synthesis
↓
Confidence
```

---

# 47. Hallucination Firewall

Before final answer:

```text
Every external factual statement
        ↓
Does it require verification?
        ↓
YES → evidence engine
NO  → reasoning allowed
```

The final response should distinguish:

```text
known
verified
inferred
uncertain
```

---

# 48. Citation Adversary

For every citation:

```text
Does the source exist?
Does the source actually say this?
Does it support the exact claim?
Is the interpretation reasonable?
```

A fake citation should be treated as a severe failure.

---

# 49. Evidence Strength Hierarchy

Prefer:

```text
Level 5:
direct experiment / execution result

Level 4:
primary research / official documentation

Level 3:
independent benchmark / reputable report

Level 2:
secondary analysis

Level 1:
agent assertion
```

A Level-1 assertion must not overrule Level-5 evidence.

---

# 50. Experimental Dashboard

Track:

```text
task
agents_used
rounds
tokens
latency
cost
tests
failures
revisions
final_quality
```

Key metric:

```text
quality_gain / dollar
```

Another:

```text
quality_gain / token
```

Another:

```text
quality_gain / second
```

---

# 51. The Council Should Learn Which Fights Are Worth Having

Example:

Task:

```text
rename function foo → parse_config
```

No fight.

Task:

```text
rewrite authentication architecture
```

Fight.

Task:

```text
deploy arbitrary code
```

Fight + security + sandbox.

Compute should be earned by difficulty.

---

# 52. Escalation Ladder

```text
LEVEL 0
Single-shot generation

LEVEL 1
Generate + self-check

LEVEL 2
Two-agent review

LEVEL 3
Three-agent debate

LEVEL 4
Council + verifier

LEVEL 5
Council + research + execution

LEVEL 6
Full adversarial arena

LEVEL 7
Long-horizon persistent investigation
```

The router selects the lowest level likely to succeed.

---

# 53. Persistent Research Mode

For extremely hard questions:

```text
DAY 1
collect evidence

DAY 2
challenge assumptions

DAY 3
test hypotheses

DAY 4
integrate findings
```

In an application this can be represented as jobs stored in a database rather than pretending the model is magically thinking while nobody is running it.

---

# 54. No Fake "Infinite Thinking"

"Keep thinking forever" sounds cool.

It is also terrible engineering.

Use:

```text
continue_until(
    convergence
    OR
    hard budget
    OR
    no_new_information
)
```

A good system knows when additional computation is pointless.

---

# 55. Stagnation Detector

If five consecutive rounds produce:

```text
ΔQ < threshold
```

do not keep repeating the same argument.

Change the strategy.

For example:

```text
argumentation
→ experiment

experiment
→ alternative architecture

architecture
→ smaller prototype

prototype
→ benchmark
```

The system should escape local reasoning loops.

---

# 56. Information Gain Routing

Ask:

> "What single action would reduce uncertainty the most?"

Examples:

```text
Unsure which database is faster?
→ benchmark them.

Unsure whether library supports feature?
→ read official docs.

Unsure whether code works?
→ execute it.

Unsure whether architecture scales?
→ simulate load.
```

This is far more valuable than producing another 2,000-word argument.

---

# 57. The Oracle Agent

Introduce one unusual role:

# ORACLE

It cannot propose a solution.

It can only answer:

```text
What information are we missing?
```

Its output:

```text
unknowns
uncertainties
missing tests
missing evidence
dangerous assumptions
```

This prevents the council from optimizing inside a false premise.

---

# 58. The Execution Agent

Another special agent:

# MACHINIST

Its instruction:

> "You are not here to reason beautifully. You are here to run things."

It receives:

```text
candidate
repo
tests
environment
```

and returns:

```json
{
  "build": true,
  "tests": 48,
  "passed": 46,
  "failed": 2,
  "errors": [],
  "performance": {},
  "security": {}
}
```

This agent becomes terrifyingly useful for coding.

---

# 59. The Funeral Rule

When a candidate fails conclusively:

Do not revive it because an agent likes it.

Mark:

```text
DEAD
```

Store why.

Example:

```text
Candidate C4

Status: DEAD

Cause:
database transaction model fails concurrent writes.

Evidence:
race test R77.

Revival condition:
replace transaction model and rerun benchmark.
```

Dead ideas become training data.

---

# 60. The Graveyard Dataset

Every failed candidate becomes a potential training example.

Dataset:

```text
problem
bad solution
why it looked plausible
failure
correct solution
verification
```

This could become more valuable than collecting another million generic coding examples.

---

# 61. Scenario Generator

Automatically generate tasks from:

```text
real bugs
open-source repositories
your own projects
synthetic programs
mutated tests
security advisories
dependency conflicts
performance regressions
```

Generate:

```text
easy
medium
hard
adversarial
deceptive
```

---

# 62. Benchmark Your Council Against a Single Agent

This is mandatory.

Compare:

```text
Single LLM
vs
LLM + self-review
vs
2 agents
vs
4 agents
vs
4 agents + execution
vs
4 agents + execution + memory
```

Measure:

```text
pass@1
pass@k
bug rate
security failures
latency
token cost
```

If:

```text
4 agents = same quality as 1 agent
```

your orchestration is overhead.

Kill it.

---

# 63. Prove the Council Helps

Do not assume your architecture is brilliant because it contains eight boxes.

Run ablation studies.

## Experiment A

```text
Single agent
```

## Experiment B

```text
Single agent + verifier
```

## Experiment C

```text
4 agents + vote
```

## Experiment D

```text
4 agents + debate
```

## Experiment E

```text
4 agents + debate + execution
```

## Experiment F

```text
4 agents + debate + execution + memory
```

Then compare.

---

# 64. Critical Scientific Question

The previous arena was right to flag this:

> Evidence supporting multi-agent reasoning does not automatically prove that the same mechanism gives the same gains for small coding models. fileciteturn0file0L315-L320

Therefore:

```text
DO NOT WRITE:
"Multi-agent voting definitely improves coding."
```

Write:

```text
"Multi-agent orchestration is a hypothesis.
We will test it."
```

That turns the project from a feature idea into a research program.

---

# 65. The 30-Day Prototype

## Days 1–3

Build:

```text
model server
agent interface
CLI
```

## Days 4–6

Build:

```text
parallel agent execution
```

## Days 7–9

Build:

```text
candidate anonymization
voting
```

## Days 10–12

Build:

```text
Docker execution sandbox
```

## Days 13–15

Build:

```text
test generation
verification
```

## Days 16–18

Build:

```text
debate loop
```

## Days 19–21

Build:

```text
persistent memory
```

## Days 22–24

Build:

```text
failure database
```

## Days 25–27

Build:

```text
adaptive escalation
```

## Days 28–30

Run:

```text
ablation benchmark
```

At the end you should know whether the council actually helps.

---

# 66. Repository Structure

Recommended:

```text
the-council/
│
├── core/
│   ├── schemas/
│   ├── events/
│   ├── protocols/
│   └── config/
│
├── model_gateway/
│   ├── ollama/
│   ├── llama_cpp/
│   └── vllm/
│
├── agents/
│   ├── architect/
│   ├── debugger/
│   ├── researcher/
│   ├── skeptic/
│   ├── security/
│   └── performance/
│
├── orchestrator/
│   ├── router/
│   ├── scheduler/
│   ├── escalation/
│   └── convergence/
│
├── arena/
│   ├── proposals/
│   ├── attacks/
│   ├── rebuttals/
│   ├── ranking/
│   └── judge/
│
├── evidence/
│   ├── retrieval/
│   ├── verification/
│   └── provenance/
│
├── execution/
│   ├── sandbox/
│   ├── tests/
│   ├── fuzzing/
│   └── benchmarks/
│
├── memory/
│   ├── semantic/
│   ├── episodic/
│   ├── failures/
│   └── decisions/
│
├── experiments/
│   ├── ablations/
│   ├── benchmarks/
│   └── reports/
│
├── cli/
│
└── docs/
```

Each directory should be independently testable.

---

# 67. Internal Event Bus

Everything should produce events.

Example:

```json
{
  "event": "candidate.failed",
  "candidate_id": "A7",
  "test_id": "T92",
  "severity": "HIGH"
}
```

Events:

```text
task.created
proposal.created
attack.created
evidence.requested
evidence.verified
candidate.failed
candidate.revised
candidate.promoted
judge.selected
judge.challenged
round.reopened
task.finalized
```

This makes the whole system observable.

---

# 68. Event-Sourced Architecture

Instead of storing only the final result:

```text
store the entire history.
```

Then you can replay:

```text
Why did Candidate A win?
```

And answer:

```text
Round 0:
A proposed architecture X.

Round 1:
Security found flaw Y.

Round 2:
A fixed Y.

Round 3:
Benchmark showed X faster.

Round 4:
Judge selected A.
```

This is excellent for debugging the AI itself.

---

# 69. Agent Contract

Every agent gets:

```python
class Agent:
    id: str
    role: str
    capabilities: dict
    constraints: dict

    def propose(task): ...
    def critique(candidate): ...
    def revise(candidate, feedback): ...
```

Agents do not directly mutate global state.

They submit proposals.

The orchestrator decides what becomes state.

---

# 70. Immutable Evidence

Once recorded:

```text
source hash
retrieval timestamp
excerpt
metadata
```

should be immutable.

This prevents the evidence layer from silently changing reality after a decision.

---

# 71. Prompt Contracts

Do not write giant magical prompts.

Use small contracts:

```text
ROLE
TASK
CONSTRAINTS
TOOLS
OUTPUT SCHEMA
FAILURE CONDITIONS
```

This makes agents replaceable.

---

# 72. Structured Outputs

Prefer JSON internally.

Example:

```json
{
  "claim": "...",
  "confidence": 0.73,
  "evidence_needed": [
    "official documentation"
  ],
  "failure_modes": [
    "timeout"
  ],
  "next_action": "benchmark"
}
```

Natural language belongs mainly in the final explanation.

---

# 73. Tool Selection

Agents should not receive every tool.

Tool access should be capability-based.

Example:

```text
Researcher:
web/search/document tools

Machinist:
shell/sandbox/test tools

Architect:
repository graph tools

Security:
static analysis/security tools
```

This reduces tool confusion and accidental misuse.

---

# 74. Tool Result Verification

Tool output itself can be wrong.

Therefore:

```text
tool output
↓
schema validation
↓
sanity checks
↓
agent interpretation
```

Do not let raw tool output become unquestionable truth.

---

# 75. The Council Constitution

Every agent follows:

```text
1. Never fabricate evidence.
2. Never hide a failure.
3. Attack claims, not people.
4. Prefer experiments over arguments.
5. Prefer primary evidence.
6. Admit uncertainty.
7. Do not vote for yourself.
8. Do not treat majority as truth.
9. Preserve failed approaches.
10. Reopen decisions when new evidence appears.
```

---

# 76. Arena Personality

The fight can be theatrical.

Keep:

```text
RAZOR
PHANTOM
VIPER
WRAITH
```

if you like them.

But separate:

```text
presentation layer
```

from:

```text
reasoning layer
```

The battle can sound like:

> "Your architecture just died."

while the machine internally records:

```json
{
  "attack_type": "counterexample",
  "severity": 0.92
}
```

Theatrics for humans.

Structured data for machines.

Best of both worlds.

---

# 77. Attack Budget

Each round gets a budget.

Example:

```text
5 attacks
3 rebuttals
2 evidence checks
1 execution pass
```

If attacks become repetitive:

```text
stop repeating
```

Generate a new attack category.

---

# 78. Novelty Detector

Do not repeatedly generate the same criticism.

Compare:

```text
new_attack
vs
previous_attacks
```

If semantic similarity is too high:

```text
reject attack
```

Generate a new angle.

---

# 79. Argument Graph

Represent debate as:

```text
Claim
 ├── supports
 ├── contradicts
 ├── depends_on
 ├── requires_evidence
 └── tested_by
```

This creates a machine-readable argument graph.

---

# 80. Contradiction Engine

Search for:

```text
Agent A:
"Approach X is cheapest."

Agent B:
"Approach X requires an expensive GPU."
```

The system creates:

```text
CONTRADICTION-91
```

and schedules resolution.

---

# 81. Dependency-Aware Debate

If claim C depends on:

```text
C → B → A
```

and A is false:

```text
invalidate C
```

This prevents spending an hour debating consequences of a dead assumption.

---

# 82. Assumption Ledger

Every proposal must expose assumptions.

Example:

```text
A1:
repository is Python.

A2:
database supports transactions.

A3:
GPU has 12GB VRAM.
```

Test each.

Hidden assumptions are where many "smart" answers go to die.

---

# 83. Risk Matrix

Every final design:

```text
                 IMPACT
               low   med   high
LIKELIHOOD
low             L      L     M
medium          L      M     H
high            M      H     C
```

Critical risks must have mitigation.

---

# 84. Decision Memory

Store:

```text
decision
alternatives
why rejected
evidence
date
benchmark
owner/version
```

This stops the system from rediscovering the same argument every time.

---

# 85. Learning from User Corrections

When the user says:

> "No, that's wrong."

store:

```text
failure type:
user correction
```

but do not blindly train on it.

Route it through:

```text
verification
```

because users can also be wrong.

Yes, even you.

Especially at 3 AM.

---

# 86. Product Evolution

## V0

CLI:

```bash
council "fix this function"
```

## V1

Repository awareness:

```bash
council --repo .
```

## V2

Persistent agent:

```bash
council work
```

## V3

IDE extension.

## V4

Long-running software engineering agent.

## V5

Multi-user workspace.

## V6

General multi-agent research/coding platform.

---

# 87. Cost Strategy

Do not rent expensive hardware before proving the architecture.

First:

```text
quantized local model
```

Then:

```text
cheap GPU
```

Then:

```text
burst cloud inference
```

Only later:

```text
dedicated infrastructure
```

The previous arena explicitly criticized expensive GPU assumptions and moved toward quantization/free-tier-first execution. fileciteturn0file0L290-L303

---

# 88. Fine-Tuning Strategy

Do not start with full fine-tuning.

Start with:

```text
prompt engineering
→ retrieval
→ tools
→ verification
→ failure memory
```

Then:

```text
LoRA / PEFT
```

Then:

```text
targeted domain adaptation
```

Only investigate larger-scale training after the system proves it needs it.

---

# 89. What To Fine-Tune

Do NOT mainly train:

```text
"write Python"
```

Train:

```text
detect bug
challenge architecture
generate tests
diagnose failures
repair failed code
choose tools
ask for missing information
reject unsupported claims
```

The model should learn **engineering behavior**.

---

# 90. Synthetic Scenario Factory

Generate training examples from templates:

```text
BUG
SECURITY
PERFORMANCE
ARCHITECTURE
DEPENDENCY
DEBUGGING
REFACTORING
TESTING
SYSTEM DESIGN
RESEARCH
```

Then randomly compose them.

Example:

```text
authentication
+
race condition
+
third-party dependency
+
10x traffic
+
malicious input
```

Now the model faces an actual nightmare.

That is useful.

---

# 91. The Scenario Ladder

```text
S0 — trivial

S1 — single failure

S2 — hidden failure

S3 — competing fixes

S4 — interacting failures

S5 — adversarial deception

S6 — long-horizon architecture

S7 — production-scale simulation
```

---

# 92. Long-Horizon Tasks

The assistant eventually needs tasks such as:

> "Take this repo, add authentication, migrate the database, write tests, update documentation, and deploy it."

The council should decompose:

```text
requirements
↓
plan
↓
work graph
↓
parallel tasks
↓
dependency execution
↓
verification
↓
integration
↓
final review
```

---

# 93. Work Graph

Represent tasks as a DAG:

```text
A: inspect repo
      ↓
B: design schema
      ↓
C: migration
   ↙     ↘
D         E
tests   API
   ↘     ↙
      F
   integration
```

Agents can work independently where safe.

---

# 94. Conflict Resolver

If two agents modify the same file:

```text
detect overlap
↓
create merge candidates
↓
run tests
↓
security review
↓
choose patch
```

Never let agents blindly overwrite each other.

---

# 95. Git-Native Memory

Use Git as part of the reasoning infrastructure.

Every meaningful experiment can create:

```text
branch
commit
benchmark
result
```

Examples:

```text
experiment/agent-4-vote
experiment/no-vote
experiment/execution-filter
```

Now you can scientifically compare architectures.

---

# 96. Automated Regression Suite

Every discovered bug becomes a permanent test.

Rule:

> **Every production failure must create a regression test whenever possible.**

This turns failure into permanent improvement.

---

# 97. Self-Competition

The system can challenge itself.

Example:

```text
BEST CURRENT SOLUTION
        ↓
generate 5 alternatives
        ↓
benchmark
        ↓
replace only if better
```

This is evolutionary search without requiring giant-scale training.

---

# 98. Tournament of Ideas

Maintain a candidate pool:

```text
C1
C2
C3
C4
...
C20
```

Weak candidates die.

Strong candidates mutate.

This creates:

```text
selection
+
mutation
+
verification
```

for architecture/search.

---

# 99. Mutation Operators

For an architecture:

```text
remove component
swap database
parallelize stage
cache output
change model
change retrieval
replace voting strategy
add verifier
remove verifier
```

Then benchmark.

---

# 100. Search Over Orchestration Itself

This is where the experiment gets properly weird.

The council should eventually optimize:

```text
number of agents
roles
model assignment
prompts
round count
voting algorithm
verification order
tool allocation
memory retrieval
```

In other words:

> **The system can evolve the way it thinks.**

---

# 101. Meta-Agent

Create:

# CONDUCTOR

It does not solve user problems.

It designs the solving process.

Input:

```text
task
historical outcomes
compute budget
```

Output:

```text
which agents?
which models?
how many rounds?
which tools?
which verification?
```

Then measure whether the Conductor made a good decision.

---

# 102. Meta-Experiment

Compare:

```text
fixed orchestration
vs
adaptive orchestration
```

If adaptive routing wins:

```text
keep it.
```

If not:

```text
kill it.
```

No sacred architecture.

---

# 103. The Rule of Brutal Simplicity

Every subsystem must answer:

> "What measurable problem do you solve?"

If the answer is:

> "It seemed cool."

Delete it.

This project already has enough opportunities to become a distributed AI cathedral built by one student who wanted to fix a Python function.

---

# 104. Observability

Track:

```text
tokens per agent
latency
tool calls
failures
retries
rounds
quality score
cost
```

Visualize:

```text
quality vs compute
```

This tells you whether the architecture is actually worth the money.

---

# 105. Golden Test Set

Maintain:

```text
100–500 curated tasks
```

with:

```text
known expected behavior
```

Do not tune every experiment to the same visible examples.

Keep a hidden holdout set.

---

# 106. Anti-Overfitting

If every agent knows the benchmark:

```text
you are benchmarking your benchmark.
```

Use:

```text
public set
private set
generated set
real-world set
```

---

# 107. Metrics

Core coding metrics:

```text
pass@1
pass@k
test pass rate
regression rate
security failure rate
repair success rate
```

System metrics:

```text
latency
tokens
cost
rounds
agent utilization
```

Research metric:

```text
quality gain from orchestration
```

This final metric is the point.

---

# 108. Success Criteria

The project is successful only if:

```text
Council > Single Agent
```

under one or more meaningful conditions.

For example:

```text
same base model
same compute budget
better coding accuracy
```

or:

```text
same quality
lower compute cost
```

Either is valuable.

---

# 109. Failure Criteria

The experiment should be declared unsuccessful if:

```text
4 agents produce the same answer as 1
```

and:

```text
verification does not improve outcomes
```

or:

```text
cost increases 5x
for negligible quality gain
```

Failure is useful.

The architecture is experimental.

---

# 110. Ultimate Architecture

Eventually:

```text
                    ┌──────────────────────┐
                    │        USER          │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │      CONDUCTOR       │
                    │ chooses strategy     │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ REQUIREMENT GRAPH    │
                    └──────────┬───────────┘
                               ▼
       ┌─────────────────────────────────────────────────┐
       │                 AGENT SWARM                     │
       │                                                 │
       │ Architect  Researcher  Hacker  Engineer         │
       │ Security   Debugger    Perf    User Advocate    │
       └────────────────────────┬────────────────────────┘
                                ▼
                       ┌────────────────┐
                       │ CANDIDATE POOL │
                       └───────┬────────┘
                               ▼
                       ┌────────────────┐
                       │ BLIND REVIEW   │
                       └───────┬────────┘
                               ▼
                       ┌────────────────┐
                       │ FIGHT / DEBATE │
                       └───────┬────────┘
                               ▼
                       ┌────────────────┐
                       │ EVIDENCE GRAPH │
                       └───────┬────────┘
                               ▼
                       ┌────────────────┐
                       │ EXECUTION LAB  │
                       └───────┬────────┘
                               ▼
                       ┌────────────────┐
                       │ FAILURE MEMORY │
                       └───────┬────────┘
                               ▼
                       ┌────────────────┐
                       │ REVISION       │
                       └───────┬────────┘
                               ▼
                         FIGHT AGAIN
                               │
                  ┌────────────┴────────────┐
                  │                         │
             flaws remain             converged
                  │                         │
                  └────── LOOP ◄────────────┘
                                            ▼
                                   ┌─────────────────┐
                                   │ FINAL RED TEAM  │
                                   └────────┬────────┘
                                            ▼
                                   ┌─────────────────┐
                                   │ JUDGE           │
                                   └────────┬────────┘
                                            ▼
                                   ┌─────────────────┐
                                   │ JUDGE AUDITOR   │
                                   └────────┬────────┘
                                            ▼
                                      FINAL ANSWER
```

---

# 111. Final Protocol

The production loop should look conceptually like this:

```python
def solve(task):

    requirements = compile_requirements(task)

    difficulty = estimate_difficulty(requirements)

    strategy = conductor.choose_strategy(
        requirements,
        difficulty
    )

    candidates = generate_independent_candidates(
        strategy
    )

    while True:

        blind_candidates = anonymize(candidates)

        attacks = generate_adversarial_attacks(
            blind_candidates
        )

        rebuttals = collect_rebuttals(
            candidates,
            attacks
        )

        evidence = verify_claims(
            candidates,
            attacks,
            rebuttals
        )

        experiments = execute_and_test(
            candidates
        )

        candidates = revise(
            candidates,
            attacks,
            evidence,
            experiments
        )

        quality = evaluate(
            candidates,
            evidence,
            experiments
        )

        if critical_failure_exists(quality):
            continue

        if material_disagreement_exists(candidates):
            continue

        if not meaningful_quality_gain(quality):
            break

    winner = kill_the_winner(candidates)

    audited_winner = audit_judgment(winner)

    if audited_winner.reopen:
        candidates = reopen_case(candidates)
        return solve(task)

    return finalize(audited_winner)
```

This is intentionally conceptual.

The real implementation should be event-driven rather than one giant blocking function.

---

# 112. Minimal V1

Do not build all 112 sections on day one.

Build:

```text
1. model gateway
2. agent interface
3. orchestrator
4. candidate pool
5. blind review
6. attack engine
7. sandbox
8. verifier
9. revision loop
10. benchmark
```

Only after those work:

```text
memory
failure dataset
adaptive routing
meta-agent
evolutionary search
```

---

# 113. First Proof-of-Concept

The smallest serious demo:

### Input

```text
"Fix this buggy Python repository."
```

### System

```text
3 agents
↓
3 solutions
↓
blind review
↓
attack
↓
execute tests
↓
revision
↓
retest
↓
final answer
```

### Required log

```text
Round 0
Round 1
Round 2

Failures:
...

Repairs:
...

Tests:
...

Winner:
...

Why:
...
```

That one demo is enough to prove whether the idea has teeth.

---

# 114. The Research Questions

The project should answer experimentally:

### Q1
Does multi-agent debate improve coding accuracy?

### Q2
Does diversity matter more than agent count?

### Q3
Does execution verification outperform voting alone?

### Q4
Does a failure memory improve future repair?

### Q5
Does adaptive routing reduce cost?

### Q6
Does blind evaluation reduce self-preference?

### Q7
Does pairwise ranking outperform absolute scoring?

### Q8
Does adversarial re-fighting catch meaningful errors?

### Q9
Can a smaller model plus stronger orchestration outperform a larger model on selected engineering tasks?

### Q10
Which parts of the architecture actually contribute measurable gains?

These questions are more important than building a pretty dashboard.

---

# 115. The Competitive Thesis

The project does **not** attempt to beat frontier models everywhere.

That is stupid.

The strategy is:

```text
Frontier model:
general intelligence at enormous scale

The Council:
specialized engineering intelligence
+ repository context
+ tools
+ verification
+ persistent memory
+ failure learning
+ adversarial search
```

The wedge is:

> **Know less globally. Verify more locally.**

For software engineering, local truth matters enormously.

The codebase in front of the model is more important than some random benchmark sentence from the internet.

---

# 116. The Weirdest and Most Promising Idea

Eventually, let the system learn:

> **Which agent should be trusted for which kind of mistake.**

Not:

```text
Agent A is smart.
```

But:

```text
Agent A:
excellent at algorithmic debugging.

Agent B:
excellent at architecture.

Agent C:
excellent at catching security mistakes.

Agent D:
excellent at research.

Agent E:
excellent at discovering missing assumptions.
```

Then the Conductor assembles temporary teams.

This becomes:

```text
dynamic intelligence composition
```

rather than static multi-agent chatting.

That is potentially much more interesting than "four bots vote."

---

# 117. Final Philosophy

The project should never ask:

> "Which model gave the nicest answer?"

It should ask:

> "Which answer survived reality?"

The system should therefore prioritize:

```text
Reality
↓
Execution
↓
Evidence
↓
Tests
↓
Counterexamples
↓
Expert disagreement
↓
Reasoning
↓
Prose
```

not the reverse.

---

# 118. Final Definition of "Done"

The system may declare victory when:

```text
✅ Requirements satisfied
✅ No critical unresolved contradiction
✅ Important claims verified
✅ Code executes successfully
✅ Tests pass
✅ Security checks pass
✅ Candidate survived adversarial attack
✅ Judge decision survived judge-audit
✅ No meaningful new information is being generated
✅ Cost remains within budget
✅ Full decision trace is reproducible
```

Then:

```text
SHIP.
```

Not because the model sounded confident.

Because the solution survived the fucking arena.

---

# 119. Immediate Implementation Order

```text
WEEK 1

[ ] Project skeleton
[ ] Model gateway
[ ] Agent schema
[ ] Task schema
[ ] Candidate schema
[ ] CLI
[ ] First single-agent baseline

WEEK 2

[ ] Multi-agent generation
[ ] Blind anonymization
[ ] Voting
[ ] Pairwise comparison
[ ] Attack engine
[ ] Rebuttal engine

WEEK 3

[ ] Docker sandbox
[ ] Test generation
[ ] Execution verifier
[ ] Failure capture
[ ] Revision loop
[ ] Re-fight loop

WEEK 4

[ ] Memory
[ ] Failure dataset
[ ] Adaptive routing
[ ] Judge audit
[ ] Ablation experiments
[ ] Golden benchmark
```

---

# 120. The One Experiment That Matters

Run this:

```text
100 coding tasks

System A:
single agent

System B:
four agents + majority vote

System C:
four agents + debate

System D:
four agents + debate + execution verifier

System E:
four agents + debate + verifier + memory
```

Measure:

```text
correctness
bugs
security failures
latency
tokens
cost
```

Then produce:

```text
THE COUNCIL EXPERIMENT REPORT
```

If E beats A convincingly:

**you have something.**

If A beats E:

**beautiful. You just saved yourself six months of building distributed nonsense.**

Either result is a research result.

---

# 121. End State

The final product is not:

```text
"4 LLMs chatting."
```

It is:

```text
A programmable reasoning-and-verification system
that dynamically assembles agents,
generates competing solutions,
attacks those solutions,
checks external claims,
executes code,
learns from failure,
reopens weak decisions,
and continues searching until additional compute
stops producing meaningful improvement.
```

That is the experiment.

That is the product.

And that is considerably more interesting than another wrapper around an API.
