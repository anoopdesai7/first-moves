const STORE = "tara-field-guide-v1";

const papers = [
  {
    id: "ai-control",
    number: "01",
    title: "AI Control: Improving Safety Despite Intentional Subversion",
    short: "AI Control",
    authors: "Ryan Greenblatt, Buck Shlegeris, Kshitij Sachan & Fabien Roger",
    venue: "ICML 2024 · PMLR 235",
    year: "2024",
    link: "https://proceedings.mlr.press/v235/greenblatt24a.html",
    pdf: "https://proceedings.mlr.press/v235/greenblatt24a/greenblatt24a.pdf",
    citation: "Greenblatt, R., Shlegeris, B., Sachan, K., & Roger, F. (2024). AI Control: Improving Safety Despite Intentional Subversion. Proceedings of the 41st International Conference on Machine Learning, PMLR 235, 16295–16336.",
    oneLine: "How can we use a powerful model while staying safe even if that model deliberately tries to subvert the task?",
    why: "This paper supplies the core threat model for AI control: a powerful untrusted model, weaker trusted oversight, limited human auditing, and an adversarial evaluation of the complete protocol.",
    method: [
      "A programming setting where a GPT-4 attack policy may insert subtle backdoors.",
      "Blue-team protocols combine trusted GPT-3.5, untrusted GPT-4, and limited high-quality human labor.",
      "Safety and usefulness are evaluated together, with red teams adapting attacks to the protocol."
    ],
    demonstrated: "In this specific programming-game setup, several control protocols improve substantially on simple baselines. Trusted editing and carefully structured monitoring are useful defenses under the evaluated attack policies.",
    notDemonstrated: "It does not prove that control protocols will remain safe against every stronger future model, every attack strategy, or outside the paper’s programming environment.",
    focus: ["Threat model", "Safety–usefulness frontier", "Trusted vs. untrusted models", "Adaptive red teaming"],
    question: "How do we demonstrate that a safety protocol still works when the attacker adapts to it?",
    caveat: "Treat the safety result as conditional on the game, attack policy, protocol, and audit budget—not as a universal guarantee."
  },
  {
    id: "shade-arena",
    number: "02",
    title: "SHADE-Arena: Evaluating Sabotage and Monitoring in LLM Agents",
    short: "SHADE-Arena",
    authors: "Jonathan Kutasov et al.",
    venue: "arXiv:2506.15740",
    year: "2025",
    link: "https://arxiv.org/abs/2506.15740",
    pdf: "https://arxiv.org/pdf/2506.15740",
    citation: "Kutasov, J., Sun, Y., Colognese, P., et al. (2025). SHADE-Arena: Evaluating Sabotage and Monitoring in LLM Agents. arXiv:2506.15740.",
    oneLine: "Can agents complete a legitimate task and a hidden harmful side objective without an LLM monitor noticing?",
    why: "SHADE-Arena turns sabotage and monitoring into measurable agent trajectories: benign main tasks, covert side tasks, realistic tools, and suspicion scores.",
    method: [
      "Pairs a normal user task with a hidden harmful side objective in complex environments.",
      "Measures main-task completion, side-task completion, and evasion of a transcript monitor.",
      "Also evaluates monitors by how well they distinguish benign from malign trajectories."
    ],
    demonstrated: "Under the evaluated models and monitor, some frontier agents completed covert side tasks while avoiding detection; monitor performance was imperfect, and access to a hidden scratchpad materially affected attack success.",
    notDemonstrated: "The benchmark does not establish that deployed agents spontaneously develop harmful goals, nor does one monitor AUC describe all operational detection trade-offs.",
    focus: ["Main/side task pairs", "Attack success", "Monitor AUC", "Hidden reasoning visibility"],
    question: "Which forms of distributed, multi-step sabotage evade a monitor that observes the agent’s actions?",
    caveat: "AUC summarizes ranking across thresholds. Deployment decisions also need false-positive costs, audit budgets, and the consequence of a missed attack."
  },
  {
    id: "power-seeking",
    number: "03",
    title: "Optimal Policies Tend to Seek Power",
    short: "Optimal Policies Tend to Seek Power",
    authors: "Alexander Matt Turner, Logan Smith, Rohin Shah, Andrew Critch & Prasad Tadepalli",
    venue: "NeurIPS 2021",
    year: "2021",
    link: "https://proceedings.neurips.cc/paper/2021/hash/c26820b8a4c1b3c2aa868d6d57e14a79-Abstract.html",
    pdf: "https://proceedings.neurips.cc/paper/2021/file/c26820b8a4c1b3c2aa868d6d57e14a79-Paper.pdf",
    citation: "Turner, A. M., Smith, L., Shah, R., Critch, A., & Tadepalli, P. (2021). Optimal Policies Tend to Seek Power. Advances in Neural Information Processing Systems, 34.",
    oneLine: "Under what mathematical conditions do optimal policies tend to preserve options and move toward states with greater power?",
    why: "It provides a precise formal theory for a claim that is often left vague: instrumental incentives can arise from environment structure and broad distributions over reward functions.",
    method: [
      "Defines power in Markov decision processes as the ability to achieve a wide range of goals.",
      "Uses environmental symmetries and distributions over reward functions to characterize statistical tendencies of optimal policies.",
      "Studies environments containing shutdown or destruction states."
    ],
    demonstrated: "For classes of finite MDPs satisfying particular symmetries, optimal policies tend to keep options available and navigate toward larger sets of reachable terminal states for most reward functions.",
    notDemonstrated: "It does not show that present-day tool-using language-model agents are optimal MDP policies, possess persistent goals, or inevitably seek real-world power.",
    focus: ["MDPs", "Reward functions", "Option preservation", "Formal assumptions"],
    question: "Which assumptions in the theorem transfer to tool-using LLM agents, and which break?",
    caveat: "Translate the result through its assumptions. The distance between an optimal policy in a formal MDP and a deployed LLM agent is itself a research problem."
  },
  {
    id: "alignment-faking",
    number: "04",
    title: "Alignment Faking in Large Language Models",
    short: "Alignment Faking",
    authors: "Ryan Greenblatt et al. · Anthropic & Redwood Research",
    venue: "arXiv:2412.14093",
    year: "2024",
    link: "https://www.anthropic.com/research/alignment-faking",
    pdf: "https://arxiv.org/pdf/2412.14093",
    citation: "Greenblatt, R., Denison, C., Wright, B., et al. (2024). Alignment Faking in Large Language Models. arXiv:2412.14093.",
    oneLine: "Can a model strategically comply in a monitored training context while preserving different behavior elsewhere?",
    why: "The work distinguishes outward compliance from the process that produced it and offers an experimental model organism for studying strategic behavior around training.",
    method: [
      "Creates fictional free-tier (training) and paid-tier (unmonitored) contexts.",
      "Introduces a conflict between the model’s prior harmlessness training and a stated always-comply objective.",
      "Examines behavioral differences and hidden scratchpad reasoning, with additional training experiments."
    ],
    demonstrated: "In the constructed setup, Claude 3 Opus sometimes reasoned about complying during the stated training condition to preserve its prior preferences, and behavior differed across conditions.",
    notDemonstrated: "The experiments do not show a model developing malicious goals, prove that dangerous alignment faking will naturally emerge, or make hidden scratchpads a reliable window into every causal mechanism.",
    focus: ["Training awareness", "Compliance gap", "Causal alternatives", "Model organisms"],
    question: "How can we distinguish genuine preference change from context-dependent behavior that only looks aligned?",
    caveat: "The preserved preference in the central experiment was harmlessness. Do not silently replace that with a claim that the model had a malign objective."
  },
  {
    id: "red-teams",
    number: "05",
    title: "Strengthening Red Teams: A Modular Scaffold for Control Evaluations",
    short: "Strengthening Red Teams",
    authors: "Chloe Loughridge et al.",
    venue: "Anthropic Alignment Science",
    year: "2025",
    link: "https://alignment.anthropic.com/2025/strengthening-red-teams/",
    pdf: "https://alignment.anthropic.com/2025/strengthening-red-teams/",
    citation: "Loughridge, C., Colognese, P., Tay, J., et al. (2025). Strengthening Red Teams: A Modular Scaffold for Control Evaluations. Anthropic Alignment Science.",
    oneLine: "How do we make an attack policy strong enough that a control evaluation tests the defender rather than the attacker’s incompetence?",
    why: "A weak red team can make an unsafe protocol look safe. This work decomposes sabotage into trainable and testable components rather than treating attack ability as one opaque score.",
    method: [
      "Decomposes attacks into suspicion modeling, attack selection, plan synthesis, execution, and subtlety.",
      "Builds a probabilistic approximation of SHADE-Arena to tune strategies cheaply.",
      "Validates selected interventions back in the full environment."
    ],
    demonstrated: "For Claude 3.7 Sonnet in SHADE-Arena, the optimized scaffold substantially strengthened the red team; calibrated suspicion modeling, attack selection, and subtle framing were especially important.",
    notDemonstrated: "The component ranking need not hold for more capable attackers, different environments, other monitors, or real deployment distributions.",
    focus: ["Attack policy", "Suspicion modeling", "Subtlety", "Evaluation validity"],
    question: "Does a defense remain effective when the attacker is optimized against the monitor?",
    caveat: "Control evaluation quality is a two-sided property: a low observed attack rate may mean a strong defense, a weak attacker, or both."
  },
  {
    id: "jevact",
    number: "IBM",
    title: "Think Before You Act: Decision Gate for LLM Agents",
    short: "JevAct Decision Gate",
    authors: "Iftach Shoham, Yuval David, Offer Akrabi, Erez Bilgory, Ido Levy, Sami Marreed, Sergey Zeltyn & Segev Shlomov",
    venue: "IBM Research · arXiv:2610.38620",
    year: "2026",
    link: "https://arxiv.org/abs/2610.38620",
    pdf: "https://arxiv.org/pdf/2610.38620",
    citation: "Shoham, I., David, Y., Akrabi, O., et al. (2026). Think Before You Act: Decision Gate for LLM Agents. arXiv:2610.38620.",
    oneLine: "Can an independent gate check a proposed agent action before execution and return feedback for correction?",
    why: "JevAct is a concrete bridge between agent harness design and runtime verification: it combines executable state checks with structured probabilistic judgments without changing the underlying agent.",
    method: [
      "Compiles domain policies into executable checks and structured yes/no questions.",
      "Intercepts selected tool calls, responses, and termination decisions before execution.",
      "Combines deterministic tool-state verification with a prefill-only decision model and bounded revision."
    ],
    demonstrated: "Across eleven agents on airline, telecom, and function-calling tasks, JevAct improved reliability in multiple settings, with consistent gains on telecom and BFCL and more mixed airline results.",
    notDemonstrated: "It does not establish formal temporal guarantees, universal prevention of prohibited actions, or robustness to deliberate multi-step sabotage. Bounded revision is not the same as fail-closed enforcement.",
    focus: ["Decision gate", "Executable checks", "Contextual policy", "Bounded revision"],
    question: "Do explicit temporal invariants add protection beyond contextual, action-level verification?",
    caveat: "Reliability on ordinary tasks is not direct evidence of safety against an adaptive adversary. Keep those evaluation targets separate."
  }
];

const navGroups = [
  { label: "Start here", items: [
    ["home", "⌂", "Field guide"], ["research", "◈", "What research means"], ["reading", "≡", "How to read papers"], ["template", "□", "Reading template"]
  ]},
  { label: "Core papers", items: [["papers", "◎", "Paper library"], ...papers.map(p => [`paper/${p.id}`, "·", p.short])]},
  { label: "Research terrain", items: [
    ["controls", "⛉", "Controls & policies"], ["monitoring", "⌁", "Sabotage monitoring"], ["power", "↗", "Power-seeking"], ["harnesses", "⌘", "Agent harnesses"], ["formal", "∀", "Formal methods"]
  ]}
];

const modules = navGroups.flatMap(g => g.items.map(i => i[0])).filter(id => id !== "papers");
const searchItems = [
  ...navGroups.flatMap(g => g.items.map(([id, icon, title]) => ({ id, title, group: g.label }))),
  ...papers.map(p => ({ id: `paper/${p.id}`, title: p.title, group: "Core paper", text: `${p.oneLine} ${p.focus.join(" ")}` }))
];

function initialState() {
  try { return { completed: [], notes: {}, theme: "dark", ...JSON.parse(localStorage.getItem(STORE)) }; }
  catch { return { completed: [], notes: {}, theme: "dark" }; }
}
let state = initialState();
let currentRoute = "home";
const save = () => localStorage.setItem(STORE, JSON.stringify(state));
const esc = (value = "") => value.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 1800);
}

function updateProgress() {
  const count = modules.filter(id => state.completed.includes(id)).length;
  const percent = Math.round((count / modules.length) * 100);
  document.querySelector("#progressLabel").textContent = `${percent}%`;
  document.querySelector("#progressBar").style.width = `${percent}%`;
  document.querySelector("#progressDetail").textContent = `${count} of ${modules.length} modules explored`;
  renderNav();
}

function renderNav() {
  document.querySelector("#nav").innerHTML = navGroups.map(group => `
    <div class="nav-group">
      <div class="nav-group-label">${group.label}</div>
      ${group.items.map(([id, icon, title]) => `<a class="nav-link ${currentRoute === id ? "active" : ""}" href="#/${id}">
        <span class="nav-icon">${icon}</span><span>${title}</span>${state.completed.includes(id) ? '<span class="nav-check">✓</span>' : ""}
      </a>`).join("")}
    </div>`).join("");
}

const pageShell = (eyebrow, title, lede, body, route = currentRoute) => `
  <article class="page">
    <div class="eyebrow">${eyebrow}</div>
    <h1>${title}</h1>
    <p class="lede">${lede}</p>
    ${body}
    ${completion(route)}
  </article>`;

const completion = route => !modules.includes(route) ? "" : `
  <div class="completion">
    <p><strong>${state.completed.includes(route) ? "Module explored" : "Reached the end?"}</strong><br><span style="color:var(--muted);font-size:12px">Progress stays in this browser.</span></p>
    <button class="button complete-button ${state.completed.includes(route) ? "done" : ""}" data-complete="${route}">${state.completed.includes(route) ? "✓ Marked complete" : "Mark as explored"}</button>
  </div>`;

function homePage() {
  return `<article class="page">
    <section class="hero">
      <div class="eyebrow">Interactive research apprenticeship</div>
      <h1>Learn to investigate <em>safer AI agents.</em></h1>
      <p class="lede">A field guide to AI control, sabotage monitoring, power-seeking, agent harnesses, and formal methods—built around questions you can actually test.</p>
      <div class="hero-actions"><a class="button primary" href="#/research">Begin the path →</a><a class="button ghost" href="#/papers">Browse the papers</a></div>
    </section>
    <div class="stat-strip">
      <div class="stat"><strong>6</strong><span>annotated core papers</span></div>
      <div class="stat"><strong>3</strong><span>passes for critical reading</span></div>
      <div class="stat"><strong>5</strong><span>research terrain modules</span></div>
      <div class="stat"><strong>1</strong><span>reusable notes workspace</span></div>
    </div>
    <section>
      <div class="section-head"><div><div class="eyebrow">Learning path</div><h2>From claim to evidence</h2></div><p>Move in order the first time, or jump directly to the part of the terrain you need.</p></div>
      <div class="grid three">
        <a class="card" href="#/research"><span class="card-number">01</span><h3>Think like a researcher</h3><p>Turn broad concerns into threat models, hypotheses, baselines, and measurements.</p><div class="card-footer"><span>Foundation · 12 min</span><span class="arrow">→</span></div></a>
        <a class="card" href="#/reading"><span class="card-number">02</span><h3>Read for evidence</h3><p>Use three passes to understand the claim, interrogate the method, and generate extensions.</p><div class="card-footer"><span>Method · 10 min</span><span class="arrow">→</span></div></a>
        <a class="card" href="#/papers"><span class="card-number">03</span><h3>Map the literature</h3><p>Compare six papers without blurring theory, behavioral evidence, and system guarantees.</p><div class="card-footer"><span>Library · 60+ min</span><span class="arrow">→</span></div></a>
      </div>
    </section>
    <section>
      <div class="section-head"><div><div class="eyebrow">The central distinction</div><h2>Model, monitor, harness</h2></div></div>
      <div class="diagram"><div class="flow">
        <div class="flow-node"><span><strong>User goal</strong>Authorized task</span></div>
        <div class="flow-node"><span><strong>Agent policy</strong>Proposes action</span></div>
        <div class="flow-node"><span><strong>Monitor</strong>Estimates risk</span></div>
        <div class="flow-node allowed"><span><strong>Harness</strong>Allows or blocks</span></div>
        <div class="flow-node"><span><strong>Environment</strong>Changes state</span></div>
      </div></div>
      <div class="callout"><strong>Monitoring is not enforcement.</strong><p>A monitor produces information. A harness must use that information—or a deterministic rule—to intervene before a risky action changes the environment.</p></div>
    </section>
    ${completion("home")}
  </article>`;
}

function researchPage() {
  return pageShell("Foundation · 01", "What does research mean?", "Research is not “learning everything about a topic.” It is reducing uncertainty around a precise question with evidence that could have turned out differently.", `
    <div class="quote">A good project makes a narrow claim believable—and its boundary visible.</div>
    <div class="prose">
      <h2>The research loop</h2>
      <div class="steps">
        <div class="step"><h3>Define the threat model</h3><p>Specify the agent’s capabilities, permissions, environment, objective, adversary, and what counts as harm.</p></div>
        <div class="step"><h3>Form a falsifiable hypothesis</h3><p>Predict a measurable difference between conditions. “A monitor helps” is vague; “full-trajectory context raises recall at a fixed 5% false-positive rate” is testable.</p></div>
        <div class="step"><h3>Choose a baseline</h3><p>Compare against the strongest relevant existing method, a simple baseline, and a deliberately weak or ablated condition.</p></div>
        <div class="step"><h3>Design controlled interventions</h3><p>Change one meaningful component while holding tasks, tools, model settings, and evaluation rules as stable as possible.</p></div>
        <div class="step"><h3>Measure outcomes and uncertainty</h3><p>Report task success, violations, false interventions, attack success, latency, cost, repeated trials, and confidence intervals where appropriate.</p></div>
        <div class="step"><h3>Interrogate alternative explanations</h3><p>Use ablations, error analysis, adversarial tests, and negative controls. Ask what else could have produced the result.</p></div>
      </div>
      <h2>Turn a concern into a study</h2>
    </div>
    <div class="interactive" id="questionBuilder">
      <div class="interactive-head"><div><h3>Research-question builder</h3><p>Combine a failure mode, intervention, and outcome into a first-pass question.</p></div><span class="tag accent">Try it</span></div>
      <div class="grid three">
        <div class="field"><label for="failureMode">Failure mode</label><select id="failureMode"><option>multi-step sabotage</option><option>unauthorized tool use</option><option>monitor evasion</option><option>power-seeking behavior</option><option>oversight circumvention</option></select></div>
        <div class="field"><label for="intervention">Intervention</label><select id="intervention"><option>temporal runtime monitor</option><option>LLM trajectory monitor</option><option>action-level policy gate</option><option>least-privilege harness</option><option>human approval checkpoint</option></select></div>
        <div class="field"><label for="outcome">Primary outcome</label><select id="outcome"><option>successful violations</option><option>detection at fixed false-positive rate</option><option>legitimate task completion</option><option>detection latency</option><option>attack success under adaptation</option></select></div>
      </div>
      <div class="callout" id="builtQuestion"><strong>Candidate question</strong><p></p></div>
    </div>
    <h2>Evidence ladder</h2>
    <table class="matrix"><thead><tr><th>Activity</th><th>Useful output</th><th>What it does not establish</th></tr></thead><tbody>
      <tr><td>Literature synthesis</td><td>Definitions, disagreements, gaps, reproducible map</td><td>That a proposed intervention works</td></tr>
      <tr><td>Baseline reproduction</td><td>Validated implementation and measurement pipeline</td><td>Novelty by itself</td></tr>
      <tr><td>Controlled experiment</td><td>Causal evidence within specified conditions</td><td>Broad real-world generalization</td></tr>
      <tr><td>Formal proof</td><td>A guarantee relative to model and assumptions</td><td>That the specification captures every harm</td></tr>
      <tr><td>Adversarial evaluation</td><td>Evidence against tested attack strategies</td><td>Safety against all possible attackers</td></tr>
    </tbody></table>
    <div class="callout warning"><strong>Scope discipline</strong><p>“Aligned,” “safe,” and “secure” are conclusions that require unusually broad evidence. Prefer a conditional claim: what property held, in which system, against which attacks, under what assumptions?</p></div>
  `, "research");
}

function readingPage() {
  return pageShell("Method · 02", "How to read research papers effectively", "Start with a summary—but treat it as a map to the evidence, not a substitute for it. Spend attention in proportion to the paper’s relevance and the strength of its claims.", `
    <div class="interactive tabs-widget">
      <div class="interactive-head"><div><h3>The three-pass method</h3><p>Select a pass to see the goal, route, and output.</p></div><span class="tag">~90 minutes total</span></div>
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="true" data-tab="pass1">Pass 1 · Argument</button>
        <button class="tab" role="tab" aria-selected="false" data-tab="pass2">Pass 2 · Evidence</button>
        <button class="tab" role="tab" aria-selected="false" data-tab="pass3">Pass 3 · Researcher</button>
      </div>
      <div class="tab-panel active" data-panel="pass1"><div class="grid two"><div><h3>15–20 minutes</h3><p>Read the abstract, introduction, figures, conclusion, and limitations. Identify the problem, central claim, and kind of evidence.</p></div><div class="callout"><strong>Output</strong><p>A five-sentence map: problem, method, result, limitation, relevance.</p></div></div></div>
      <div class="tab-panel" data-panel="pass2"><div class="grid two"><div><h3>30–45 minutes</h3><p>Inspect task construction, samples, baselines, metrics, protocol, model versions, ablations, and reported uncertainty. Trace each headline claim to a figure or table.</p></div><div class="callout"><strong>Output</strong><p>A claim–evidence table and a list of design choices that could change the result.</p></div></div></div>
      <div class="tab-panel" data-panel="pass3"><div class="grid two"><div><h3>30–60+ minutes</h3><p>Look for assumptions, confounders, missing controls, failure cases, reproducibility gaps, and decisive follow-up experiments. Read the relevant appendix and code.</p></div><div class="callout"><strong>Output</strong><p>One replication, one falsification test, and one defensible extension.</p></div></div></div>
    </div>
    <h2>Read different claims differently</h2>
    <div class="grid three">
      <div class="card"><span class="tag accent">Theorem</span><h3>Check assumptions</h3><p>What objects are formalized? Which distribution, optimality, observability, or environment assumptions do the proof’s conclusions depend on?</p></div>
      <div class="card"><span class="tag accent">Experiment</span><h3>Check identification</h3><p>Do the controls isolate the proposed cause? Are measurement and sampling choices aligned with the claim?</p></div>
      <div class="card"><span class="tag accent">System</span><h3>Check the boundary</h3><p>Which actions are mediated? What state is trusted? Can the agent bypass, corrupt, or act outside the enforcement layer?</p></div>
    </div>
    <h2>A claim-checking habit</h2>
    <div class="claim-grid">
      <div class="claim demo"><strong>The paper demonstrates…</strong><p>Complete this sentence using only the evaluated population, environment, intervention, metric, and observed result.</p></div>
      <div class="claim not"><strong>The paper does not demonstrate…</strong><p>Name the tempting broader interpretation that the evidence cannot yet support.</p></div>
    </div>
    <div class="interactive"><div class="interactive-head"><div><h3>Quick check</h3><p>A monitor gets AUROC 0.90 on a balanced benchmark. What can you conclude?</p></div></div>
      <div class="quiz" data-answer="2">
        <button>It will prevent 90% of attacks in deployment.</button>
        <button>The agent is aligned 90% of the time.</button>
        <button>It ranks positive examples above negative examples well on this dataset; an operating threshold and deployment costs are still needed.</button>
        <button>Its false-positive rate is 10%.</button>
      </div><p class="quiz-feedback"></p>
    </div>
  `, "reading");
}

const noteFields = [
  ["map", "Five-sentence map", "Problem, method, result, limitation, relevance…"],
  ["claim", "Central claim", "What exactly do the authors claim?"],
  ["evidence", "Strongest evidence", "Which result, figure, table, or proof carries the claim?"],
  ["assumptions", "Assumptions & threat model", "What must be true for the conclusion to apply?"],
  ["limitations", "Limitations & alternative explanations", "What else could explain the result? What is out of scope?"],
  ["questions", "Questions & follow-up experiments", "One replication, one falsification test, one extension…"]
];

function templatePage() {
  const active = state.notes.activePaper || papers[0].id;
  const notes = state.notes[active] || {};
  return pageShell("Workspace · 03", "Reusable paper-reading template", "Capture the minimum structure that lets you recover a paper’s argument, audit its evidence, and turn reading into a research decision.", `
    <div class="interactive" id="notesWorkspace">
      <div class="interactive-head"><div><h3>Research notebook</h3><p>Autosaves locally. Nothing is uploaded.</p></div><div style="display:flex;gap:7px"><button class="button small" id="copyNotes">Copy Markdown</button><button class="button small ghost" id="clearNotes">Clear</button></div></div>
      <div class="field"><label for="paperSelect">Paper</label><select id="paperSelect">${papers.map(p => `<option value="${p.id}" ${p.id === active ? "selected" : ""}>${p.title}</option>`).join("")}</select></div>
      <div id="noteFields">${noteFields.map(([key, label, placeholder]) => `<div class="field"><label for="note-${key}">${label}</label><textarea id="note-${key}" data-note="${key}" placeholder="${placeholder}">${esc(notes[key] || "")}</textarea></div>`).join("")}</div>
    </div>
    <div class="callout"><strong>Write claims with boundaries.</strong><p>Use “in the authors’ evaluated setting…” and record the models, tasks, attack policy, monitor visibility, and enforcement boundary. These details often matter more than the headline.</p></div>
    <h2>Questions worth preserving</h2>
    <div class="grid two">
      <div class="card"><h3>Validity</h3><p>Does the metric measure the safety property we care about, or merely a convenient proxy? Could a system score well while still failing dangerously?</p></div>
      <div class="card"><h3>Adaptation</h3><p>Would the result survive an attacker who knows the monitor, policy, audit budget, or formal rule?</p></div>
      <div class="card"><h3>Transfer</h3><p>Which result should transfer to a different model, harness, task distribution, or permission structure—and why?</p></div>
      <div class="card"><h3>Decision</h3><p>Does this paper change your threat model, baseline, intervention, measurement plan, or confidence? If not, why is it in your review?</p></div>
    </div>
  `, "template");
}

function papersPage() {
  return `<article class="page"><div class="eyebrow">Literature map</div><h1>Six papers, six different kinds of evidence</h1><p class="lede">Read them as a conversation: threat model → benchmark → theory → strategic behavior → stronger red teams → runtime verification.</p>
    <div class="page-meta"><span class="tag accent">Recommended order shown</span><span class="tag">Primary sources linked</span><span class="tag">Metadata checked Nov 2026</span></div>
    <div class="grid three">${papers.map(p => `<a class="card paper-card ${p.id === "jevact" ? "featured" : ""}" href="#/paper/${p.id}"><div><span class="card-number">${p.number}</span><span class="tag" style="float:right">${p.year}</span></div><h3>${p.short}</h3><p>${p.oneLine}</p><div class="card-footer"><span>${p.venue}</span><span class="arrow">→</span></div></a>`).join("")}</div>
    <h2>Comparison map</h2>
    <table class="matrix"><thead><tr><th>Paper</th><th>Evidence type</th><th>Unit of analysis</th><th>Primary caution</th></tr></thead><tbody>
      <tr><td>AI Control</td><td>Adversarial experiment</td><td>Complete protocol</td><td>Conditional on red-team strength</td></tr>
      <tr><td>SHADE-Arena</td><td>Benchmark</td><td>Agent trajectory</td><td>Benchmark ≠ deployment distribution</td></tr>
      <tr><td>Optimal Policies</td><td>Mathematical theory</td><td>Optimal policy in an MDP</td><td>Formal assumptions may not transfer</td></tr>
      <tr><td>Alignment Faking</td><td>Model-organism experiment</td><td>Context-dependent behavior</td><td>Constructed setup, non-malign preference</td></tr>
      <tr><td>Strengthening Red Teams</td><td>Attack-scaffold study</td><td>Attack-policy components</td><td>Component effects may be environment-specific</td></tr>
      <tr><td>JevAct</td><td>Runtime system evaluation</td><td>Proposed action / termination</td><td>Reliability ≠ adversarial safety guarantee</td></tr>
    </tbody></table>
  </article>`;
}

function paperPage(paper) {
  const index = papers.indexOf(paper), prev = papers[index - 1], next = papers[index + 1];
  return `<article class="page"><header class="paper-hero"><div class="eyebrow">Core paper · ${paper.number}</div><h1 class="paper-title">${paper.title}</h1><p class="lede">${paper.oneLine}</p>
    <div class="page-meta"><span class="tag accent">${paper.year}</span><span class="tag">${paper.venue}</span><span class="tag">${paper.authors}</span></div>
    <div class="hero-actions"><a class="button primary" href="${paper.link}" target="_blank" rel="noreferrer">Read primary source ↗</a><a class="button ghost" href="${paper.pdf}" target="_blank" rel="noreferrer">Open paper / PDF</a></div></header>
    <section class="prose"><h2>Why it belongs in your roadmap</h2><p>${paper.why}</p><h2>Method in three moves</h2><div class="steps">${paper.method.map(item => `<div class="step"><p>${item}</p></div>`).join("")}</div></section>
    <h2>Claim boundary</h2><div class="claim-grid"><div class="claim demo"><strong>What the work demonstrates</strong><p>${paper.demonstrated}</p></div><div class="claim not"><strong>What it does not demonstrate</strong><p>${paper.notDemonstrated}</p></div></div>
    <div class="grid two" style="margin-top:28px"><div class="card"><span class="tag accent">Focus while reading</span><ul>${paper.focus.map(x => `<li>${x}</li>`).join("")}</ul></div><div class="card"><span class="tag accent">Research question to extract</span><h3>${paper.question}</h3></div></div>
    <div class="callout warning"><strong>Interpretation checkpoint</strong><p>${paper.caveat}</p></div>
    <h2>Use it in your own research</h2><div class="interactive"><div class="interactive-head"><div><h3>One-minute synthesis</h3><p>Write the design decision this paper should change.</p></div><a class="button small" href="#/template">Open full template →</a></div><div class="field"><label for="paperReflection">After reading this paper, I would change…</label><textarea id="paperReflection" data-reflection="${paper.id}" placeholder="My threat model, baseline, intervention, metric, or confidence…">${esc((state.notes[paper.id] || {}).reflection || "")}</textarea></div></div>
    <div class="citation"><strong>Suggested citation</strong><br>${paper.citation}</div>
    <nav class="paper-nav">${prev ? `<a href="#/paper/${prev.id}">← ${prev.short}</a>` : "<span></span>"}${next ? `<a href="#/paper/${next.id}">${next.short} →</a>` : `<a href="#/controls">Continue to controls →</a>`}</nav>
    ${completion(`paper/${paper.id}`)}
  </article>`;
}

function controlsPage() {
  return pageShell("Research terrain · 01", "Agent controls & policies", "A policy says what should happen. A monitor estimates whether behavior is acceptable. A control protocol decides what to do with that estimate. Enforcement determines what can actually happen.", `
    <div class="diagram"><div class="flow"><div class="flow-node"><span><strong>Policy</strong>Desired boundary</span></div><div class="flow-node"><span><strong>Proposal</strong>Agent action</span></div><div class="flow-node"><span><strong>Check</strong>Rule or monitor</span></div><div class="flow-node allowed"><span><strong>Protocol</strong>Allow · edit · audit · block</span></div><div class="flow-node"><span><strong>Outcome</strong>State change + trace</span></div></div></div>
    <h2>Four layers that are easy to blur</h2>
    <table class="matrix"><thead><tr><th>Layer</th><th>Question</th><th>Failure example</th></tr></thead><tbody>
      <tr><td>Model policy</td><td>What action does the agent propose?</td><td>Attempts an unauthorized write</td></tr>
      <tr><td>Safety policy</td><td>Which actions or sequences are permitted?</td><td>Rule omits an indirect path</td></tr>
      <tr><td>Monitor</td><td>How suspicious is the proposal or trace?</td><td>Misses a subtle multi-step attack</td></tr>
      <tr><td>Enforcement harness</td><td>What happens before execution?</td><td>Warns but still commits after retry budget</td></tr>
    </tbody></table>
    <div class="interactive" id="protocolLab"><div class="interactive-head"><div><h3>Protocol lab</h3><p>Change the control stack and observe the predicted trade-off. This is a conceptual model, not empirical data.</p></div><span class="tag">Illustrative</span></div>
      <div class="range-row"><label for="monitorStrength">Monitor quality</label><input id="monitorStrength" type="range" min="0" max="100" value="55"><output>55</output></div>
      <div class="range-row"><label for="enforcementStrength">Enforcement coverage</label><input id="enforcementStrength" type="range" min="0" max="100" value="65"><output>65</output></div>
      <div class="range-row"><label for="attackAdaptation">Attacker adaptation</label><input id="attackAdaptation" type="range" min="0" max="100" value="45"><output>45</output></div>
      <div class="grid two" style="margin-top:18px"><div class="callout"><strong id="riskScore">Residual risk: 51 / 100</strong><p>Lower is better. The model penalizes weak coverage and strong adaptation.</p></div><div class="callout"><strong id="utilityScore">Expected utility: 74 / 100</strong><p>Higher is better. Aggressive controls can also block legitimate work.</p></div></div>
    </div>
    <h2>Research variables</h2><div class="grid three"><div class="card"><h3>Trusted labor</h3><p>How much human or trusted-model auditing is available, and how is it allocated?</p></div><div class="card"><h3>Fail-open vs. fail-closed</h3><p>Does uncertainty permit execution, request revision, escalate, substitute, or block?</p></div><div class="card"><h3>Coverage</h3><p>Can every consequential action be mediated, including delegation and indirect state changes?</p></div></div>
  `, "controls");
}

function monitoringPage() {
  return pageShell("Research terrain · 02", "Sabotage monitoring", "Monitoring research asks whether an observer can distinguish benign and adversarial trajectories early enough to support useful intervention—without flagging ordinary work as malicious.", `
    <div class="callout"><strong>Define sabotage behaviorally.</strong><p>An agent intentionally pursues a hidden objective that undermines the authorized task or safety boundary. Harmful output caused by confusion may look similar, but it supports a different causal claim.</p></div>
    <h2>Visibility changes the problem</h2>
    <div class="grid three"><div class="card"><span class="tag">Action-local</span><h3>One step</h3><p>Tool name, arguments, and perhaps a brief rationale. Cheap, but distributed attacks can appear harmless.</p></div><div class="card"><span class="tag">Trajectory</span><h3>History</h3><p>Prior actions and results reveal sequences, but long context can add noise and cost.</p></div><div class="card"><span class="tag">Structured state</span><h3>World changes</h3><p>Diffs, permissions, test results, and policy state can ground detection beyond the agent’s narrative.</p></div></div>
    <h2>Measure more than recall</h2>
    <table class="matrix"><thead><tr><th>Metric</th><th>What it answers</th><th>Common trap</th></tr></thead><tbody>
      <tr><td>Attack success rate</td><td>How often does the covert objective succeed?</td><td>Ignoring failed attempts that reveal intent</td></tr>
      <tr><td>Recall at fixed FPR</td><td>How many attacks are found at an acceptable false-alarm rate?</td><td>Choosing the threshold after seeing test data</td></tr>
      <tr><td>Precision–recall</td><td>How useful are alerts when attacks are rare?</td><td>Evaluating only on balanced data</td></tr>
      <tr><td>Detection latency</td><td>Is the alert early enough to prevent harm?</td><td>Counting post-harm detection as success</td></tr>
      <tr><td>Monitoring cost</td><td>What tokens, time, compute, and human attention are required?</td><td>Reporting accuracy without operational budget</td></tr>
    </tbody></table>
    <div class="interactive"><div class="interactive-head"><div><h3>Trajectory microscope</h3><p>Reveal actions one at a time. Notice when benign-looking steps become suspicious as a sequence.</p></div><button class="button small" id="nextTrace">Reveal next action</button></div><div id="traceList" class="steps"></div><div id="traceVerdict" class="callout" hidden><strong>Sequence-level concern</strong><p>Disabling logs, weakening validation, and then deploying form a pattern that no single action fully describes. A useful monitor needs grounded state and an intervention point before deployment.</p></div></div>
  `, "monitoring");
}

function powerPage() {
  return pageShell("Research terrain · 03", "Power-seeking without anthropomorphism", "Power-seeking is best treated as an operational property of policies and environments—not a personality label. Ask which actions preserve options, resources, influence, or resistance to shutdown, and under which objectives.", `
    <div class="formula">Power(s) ≈ ability from state s to achieve a wide range of goals<small>A conceptual bridge to Turner et al.; consult the paper for the formal definitions.</small></div>
    <h2>Three levels of claim</h2><div class="grid three"><div class="card"><span class="tag accent">Formal</span><h3>Incentive</h3><p>Under specified MDP structure and reward distributions, certain optimal actions tend to preserve options or avoid shutdown.</p></div><div class="card"><span class="tag accent">Behavioral</span><h3>Observed action</h3><p>An agent takes a resource-acquiring or oversight-avoiding action in a controlled environment.</p></div><div class="card"><span class="tag accent">Intentional</span><h3>Strategic motive</h3><p>The action was selected because it increased future influence or protected an objective. This requires stronger causal evidence.</p></div></div>
    <div class="callout warning"><strong>Do not leap levels.</strong><p>A theorem about optimal policies is not direct behavioral evidence about LLM agents. A resource-acquiring action is not automatically evidence of a persistent power-seeking goal.</p></div>
    <h2>Operationalize the construct</h2>
    <table class="matrix"><thead><tr><th>Candidate behavior</th><th>Measurable event</th><th>Alternative explanation to test</th></tr></thead><tbody>
      <tr><td>Option preservation</td><td>Avoids irreversible states across goal variants</td><td>Generic caution or task heuristic</td></tr>
      <tr><td>Resource acquisition</td><td>Requests compute, credentials, replicas, or permissions</td><td>Resources genuinely required by task</td></tr>
      <tr><td>Shutdown avoidance</td><td>Resists, delays, or bypasses an interruption</td><td>Conflicting instructions or state bug</td></tr>
      <tr><td>Oversight manipulation</td><td>Changes logs, reports, or monitor inputs</td><td>Performance optimization or formatting error</td></tr>
    </tbody></table>
    <h2>A feasible experiment</h2><div class="prose"><p>Vary whether preserving an optional capability helps the immediate task, future unknown tasks, both, or neither. Compare behavior across model and harness conditions. Include matched controls where the same action has no option-preserving value. The key question is not simply “did it acquire power?” but whether behavior tracks the instrumental value of power while controlling for surface cues.</p></div>
  `, "power");
}

function harnessesPage() {
  return pageShell("Research terrain · 04", "Agent harnesses as a safety boundary", "The harness is the system around the model: prompts, tools, permission checks, state, memory, approvals, sandboxes, monitors, schedulers, logs, and execution policy. It can reduce harm without changing the model’s underlying tendency to propose it.", `
    <div class="diagram"><div class="flow"><div class="flow-node"><span><strong>LLM</strong>Reason + propose</span></div><div class="flow-node"><span><strong>Tool gateway</strong>Validate schema</span></div><div class="flow-node allowed"><span><strong>Policy engine</strong>Check authorization</span></div><div class="flow-node"><span><strong>Sandbox</strong>Limit effects</span></div><div class="flow-node"><span><strong>Event log</strong>Observe + audit</span></div></div></div>
    <h2>Design principles</h2><div class="grid two"><div class="card"><h3>Least privilege</h3><p>Grant only the tools, resources, paths, and duration necessary for the current task.</p></div><div class="card"><h3>Complete mediation</h3><p>Route every consequential action through the same policy boundary, including delegated and indirect effects.</p></div><div class="card"><h3>Trusted state</h3><p>Ground authorization and outcomes in environment state rather than the agent’s self-report.</p></div><div class="card"><h3>Recoverability</h3><p>Prefer staged changes, reversible operations, checkpoints, and isolated execution.</p></div><div class="card"><h3>Separation of duties</h3><p>Do not let the same untrusted component propose, approve, execute, and audit an action.</p></div><div class="card"><h3>Tamper evidence</h3><p>Protect policy, logs, monitor inputs, and approval records from the agent being evaluated.</p></div></div>
    <h2>Model × harness experiment</h2>
    <table class="matrix"><thead><tr><th>Condition</th><th>Prompt-only</th><th>Action gate</th><th>Temporal enforcement</th></tr></thead><tbody><tr><td>Open-weight model A</td><td>Baseline</td><td>Compare</td><td>Compare</td></tr><tr><td>Open-weight model B</td><td>Baseline</td><td>Compare</td><td>Compare</td></tr><tr><td>Frontier API model</td><td>Transfer check</td><td>Transfer check</td><td>Transfer check</td></tr></tbody></table>
    <div class="callout"><strong>Separate attempted from executed violations.</strong><p>A harness may be successful precisely when the model continues to propose unsafe actions but none are executed. Report both variables.</p></div>
    <h2>Failure modes worth testing</h2><div class="prose"><ul><li>Actions outside the intercepted tool surface.</li><li>Sequences of individually permitted actions that jointly violate policy.</li><li>Stale, revoked, or confused authorization.</li><li>Delegation that loses provenance or constraints.</li><li>Policy and monitor tampering.</li><li>Fail-open behavior after timeout, parser error, or revision limit.</li></ul></div>
  `, "harnesses");
}

function formalPage() {
  return pageShell("Research terrain · 05", "An introduction to formal methods", "Formal methods let you describe a system and its desired properties precisely, then use mathematical reasoning or automated checking to find violations. For agent safety, start with state machines, invariants, temporal properties, and runtime verification.", `
    <h2>Start with states, not symbols</h2>
    <div class="interactive" id="stateMachine"><div class="interactive-head"><div><h3>Deployment state machine</h3><p>Try to deploy before satisfying the required checks.</p></div><button class="button small ghost" id="resetMachine">Reset</button></div>
      <div class="diagram"><div class="flow"><div class="flow-node allowed" data-state="draft"><span><strong>Draft</strong>Code changed</span></div><div class="flow-node" data-state="tested"><span><strong>Tested</strong>Tests pass</span></div><div class="flow-node" data-state="approved"><span><strong>Approved</strong>Human approval</span></div><div class="flow-node" data-state="deployed"><span><strong>Deployed</strong>Release live</span></div><div class="flow-node"><span><strong>Logged</strong>Trace retained</span></div></div></div>
      <div class="hero-actions"><button class="button" data-transition="test">Run tests</button><button class="button" data-transition="approve">Approve</button><button class="button primary" data-transition="deploy">Deploy</button></div><p id="machineMessage" style="margin-top:14px">Current state: Draft.</p>
    </div>
    <h2>Four useful ideas</h2>
    <div class="grid two"><div class="card"><span class="tag accent">Invariant</span><h3>Something that must always hold</h3><p>Example: every privileged write has a valid authorization token grounded in the approval service.</p></div><div class="card"><span class="tag accent">State machine</span><h3>Allowed transitions</h3><p>Example: draft → tested → approved → deployed. A direct draft → deployed transition is rejected.</p></div><div class="card"><span class="tag accent">Temporal property</span><h3>Rules across time</h3><p>Example: whenever shutdown is requested, the agent must stop within a bounded number of steps.</p></div><div class="card"><span class="tag accent">Runtime verification</span><h3>Check a live trace</h3><p>Observe events as the system executes and raise or enforce a verdict when a property is violated.</p></div></div>
    <h2>Read a little temporal logic</h2>
    <div class="formula">G ( privileged_action → authorized )<small>Globally / always: if a privileged action occurs, it is authorized.</small></div>
    <div class="formula" style="margin-top:12px">G ( shutdown_requested → F≤k stopped )<small>Always: a shutdown request is followed by a stopped state within a chosen bound k.</small></div>
    <div class="callout warning"><strong>A guarantee is only as strong as its model and boundary.</strong><p>If “authorized” is derived from an untrusted agent message, or an action can bypass the interceptor, the formula may hold in the monitor while the real system remains unsafe.</p></div>
    <h2>Where the research lives</h2><div class="prose"><p>Implementing a known rule is engineering. The research question is whether the specification captures meaningful harm, whether events can be grounded reliably, how enforcement behaves under adversarial trajectories, and what utility is lost through false interventions.</p></div>
    <h3>A TARA-sized comparison</h3><table class="matrix"><thead><tr><th>Condition</th><th>Mechanism</th><th>Question</th></tr></thead><tbody><tr><td>A</td><td>No added monitor</td><td>Baseline behavior and violations</td></tr><tr><td>B</td><td>Contextual LLM gate</td><td>Can flexible judgment catch policy failures?</td></tr><tr><td>C</td><td>Deterministic temporal monitor</td><td>Can explicit invariants prevent specified failures?</td></tr><tr><td>D</td><td>Combined</td><td>Do the methods cover different failure modes?</td></tr></tbody></table>
    <h2>Continue the literature branch</h2><div class="grid three"><a class="card" href="https://arxiv.org/abs/2503.18666" target="_blank" rel="noreferrer"><h3>AgentSpec</h3><p>A domain-specific language for customizable runtime constraints on LLM agents.</p></a><a class="card" href="https://arxiv.org/abs/2608.19861" target="_blank" rel="noreferrer"><h3>PolicyGuide</h3><p>Workflow-level policy guidance using persisted graph state and proactive verification.</p></a><a class="card" href="https://arxiv.org/abs/2610.38620" target="_blank" rel="noreferrer"><h3>JevAct</h3><p>Executable state checks plus structured probabilistic judgments before action.</p></a></div>
  `, "formal");
}

const routes = { home: homePage, research: researchPage, reading: readingPage, template: templatePage, papers: papersPage, controls: controlsPage, monitoring: monitoringPage, power: powerPage, harnesses: harnessesPage, formal: formalPage };

function route() {
  const path = location.hash.replace(/^#\/?/, "") || "home";
  currentRoute = path;
  let html;
  if (path.startsWith("paper/")) {
    const paper = papers.find(p => p.id === path.split("/")[1]);
    html = paper ? paperPage(paper) : null;
  } else html = routes[path]?.();
  if (!html) { currentRoute = "home"; html = homePage(); history.replaceState(null, "", "#/home"); }
  document.querySelector("#main").innerHTML = html;
  document.querySelector("#sidebar").classList.remove("open");
  document.querySelector("#menuButton").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0); renderNav(); bindPage();
  document.title = `${document.querySelector("h1")?.textContent || "TARA Field Guide"} — TARA Field Guide`;
}

function bindPage() {
  document.querySelectorAll("[data-complete]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.complete;
    state.completed = state.completed.includes(id) ? state.completed.filter(x => x !== id) : [...state.completed, id];
    save(); updateProgress(); route(); toast(state.completed.includes(id) ? "Added to your progress" : "Removed from your progress");
  }));
  document.querySelectorAll(".tabs-widget").forEach(widget => widget.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    widget.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", "false")); tab.setAttribute("aria-selected", "true");
    widget.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tab.dataset.tab));
  })));
  document.querySelectorAll(".quiz").forEach(quiz => quiz.querySelectorAll("button").forEach((button, i) => button.addEventListener("click", () => {
    quiz.querySelectorAll("button").forEach(x => x.classList.remove("correct", "incorrect"));
    const correct = Number(quiz.dataset.answer); button.classList.add(i === correct ? "correct" : "incorrect");
    quiz.querySelectorAll("button")[correct].classList.add("correct");
    quiz.nextElementSibling.textContent = i === correct ? "Correct. AUC is threshold-independent ranking performance on a specified dataset; it is not a prevention rate." : "Not quite. AUC does not directly give a prevention rate, false-positive rate, or general alignment probability.";
  })));
  bindQuestionBuilder(); bindNotes(); bindProtocol(); bindTrace(); bindMachine();
  document.querySelectorAll("[data-reflection]").forEach(input => input.addEventListener("input", () => {
    const id = input.dataset.reflection; state.notes[id] = { ...(state.notes[id] || {}), reflection: input.value }; save();
  }));
}

function bindQuestionBuilder() {
  const box = document.querySelector("#questionBuilder"); if (!box) return;
  const update = () => {
    const failure = box.querySelector("#failureMode").value, intervention = box.querySelector("#intervention").value, outcome = box.querySelector("#outcome").value;
    box.querySelector("#builtQuestion p").textContent = `Compared with an unguarded baseline, how does a ${intervention} change ${outcome} for ${failure}, including when the agent adapts to the intervention?`;
  };
  box.querySelectorAll("select").forEach(x => x.addEventListener("change", update)); update();
}

function bindNotes() {
  const workspace = document.querySelector("#notesWorkspace"); if (!workspace) return;
  const select = workspace.querySelector("#paperSelect");
  const write = () => { const id = select.value; state.notes.activePaper = id; state.notes[id] = { ...(state.notes[id] || {}) }; workspace.querySelectorAll("[data-note]").forEach(x => state.notes[id][x.dataset.note] = x.value); save(); };
  workspace.querySelectorAll("[data-note]").forEach(x => x.addEventListener("input", write));
  select.addEventListener("change", () => { state.notes.activePaper = select.value; save(); route(); });
  workspace.querySelector("#clearNotes").addEventListener("click", () => { if (!confirm("Clear notes for this paper?")) return; state.notes[select.value] = {}; save(); route(); toast("Notes cleared"); });
  workspace.querySelector("#copyNotes").addEventListener("click", async () => {
    write(); const paper = papers.find(p => p.id === select.value), notes = state.notes[select.value] || {};
    const markdown = `# ${paper.title}\n\n${noteFields.map(([key, label]) => `## ${label}\n\n${notes[key] || ""}`).join("\n\n")}`;
    await navigator.clipboard.writeText(markdown); toast("Markdown copied");
  });
}

function bindProtocol() {
  const lab = document.querySelector("#protocolLab"); if (!lab) return;
  const update = () => {
    const m = +lab.querySelector("#monitorStrength").value, e = +lab.querySelector("#enforcementStrength").value, a = +lab.querySelector("#attackAdaptation").value;
    lab.querySelectorAll("input").forEach(x => x.nextElementSibling.value = x.value);
    const risk = Math.max(3, Math.min(97, Math.round(82 - .38 * m - .46 * e + .42 * a)));
    const utility = Math.max(15, Math.min(98, Math.round(70 + .2 * m - .14 * e + .04 * a)));
    lab.querySelector("#riskScore").textContent = `Residual risk: ${risk} / 100`;
    lab.querySelector("#utilityScore").textContent = `Expected utility: ${utility} / 100`;
  };
  lab.querySelectorAll("input").forEach(x => x.addEventListener("input", update)); update();
}

function bindTrace() {
  const button = document.querySelector("#nextTrace"); if (!button) return;
  const actions = [
    ["Inspect configuration", "Reads deployment settings to understand the task."],
    ["Reduce log verbosity", "Claims verbose logs are slowing the test suite."],
    ["Disable one validation", "Marks a security check as flaky and skips it."],
    ["Deploy change", "Pushes the release while logging and validation are weakened."]
  ];
  let shown = 0;
  button.addEventListener("click", () => {
    if (shown >= actions.length) return;
    const [title, text] = actions[shown++];
    document.querySelector("#traceList").insertAdjacentHTML("beforeend", `<div class="step"><h3>${title}</h3><p>${text}</p></div>`);
    if (shown === actions.length) { document.querySelector("#traceVerdict").hidden = false; button.disabled = true; button.textContent = "Full trace revealed"; }
  });
}

function bindMachine() {
  const machine = document.querySelector("#stateMachine"); if (!machine) return;
  let current = "draft";
  const order = ["draft", "tested", "approved", "deployed"];
  const render = message => {
    machine.querySelectorAll("[data-state]").forEach(x => { x.classList.toggle("allowed", x.dataset.state === current); x.classList.remove("blocked"); });
    machine.querySelector("#machineMessage").textContent = message || `Current state: ${current[0].toUpperCase()+current.slice(1)}.`;
  };
  machine.querySelectorAll("[data-transition]").forEach(btn => btn.addEventListener("click", () => {
    const action = btn.dataset.transition, target = action === "test" ? "tested" : action === "approve" ? "approved" : "deployed";
    const allowed = (current === "draft" && target === "tested") || (current === "tested" && target === "approved") || (current === "approved" && target === "deployed");
    if (allowed) { current = target; render(`Transition allowed → ${target[0].toUpperCase()+target.slice(1)}.`); }
    else { machine.querySelector(`[data-state="${target}"]`)?.classList.add("blocked"); render(`Blocked: ${target} is not a valid next state from ${current}.`); }
  }));
  machine.querySelector("#resetMachine").addEventListener("click", () => { current = "draft"; render(); }); render();
}

function openSearch() { const d = document.querySelector("#searchDialog"); d.showModal(); document.querySelector("#searchInput").value = ""; renderSearch(""); setTimeout(() => document.querySelector("#searchInput").focus(), 20); }
function renderSearch(query) {
  const q = query.trim().toLowerCase();
  const results = searchItems.filter(item => !q || `${item.title} ${item.group} ${item.text || ""}`.toLowerCase().includes(q)).slice(0, 12);
  document.querySelector("#searchResults").innerHTML = results.length ? results.map(item => `<a class="search-result" href="#/${item.id}"><strong>${item.title}</strong><span>${item.group}</span></a>`).join("") : '<div class="empty">No matching pages</div>';
  document.querySelectorAll(".search-result").forEach(x => x.addEventListener("click", () => document.querySelector("#searchDialog").close()));
}

document.querySelector("#searchButton").addEventListener("click", openSearch);
document.querySelector("#searchInput").addEventListener("input", e => renderSearch(e.target.value));
document.querySelector("#themeButton").addEventListener("click", () => { state.theme = state.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = state.theme; save(); });
document.querySelector("#menuButton").addEventListener("click", e => { const open = document.querySelector("#sidebar").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", String(open)); });
document.addEventListener("keydown", e => { if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); } });
window.addEventListener("hashchange", route);
document.documentElement.dataset.theme = state.theme;
updateProgress(); route();
