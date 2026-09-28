# ♻️ WasteOpt — Industrial Waste Valorization & Symbiosis Decision Platform

> **Tagline:** *Turn industrial waste into a resource — match, allocate, verify.*

---

## 🧭 What Is WasteOpt?

WasteOpt is an interactive, browser-based decision platform built for industrial operators, environmental engineers, and circular economy analysts. It takes raw characterization data about a waste stream — fly ash from a power plant, slag from a steel mill, or tailings from a mine — and automatically:

1. **Checks** whether the material qualifies for each candidate reuse pathway under engineering standards (ASTM, AASHTO, EPA).
2. **Optimizes** how much material should go to each buyer/destination to maximize financial return, minimize emissions, or balance both.
3. **Compares** the optimized scenario against the conventional baseline (pure disposal) — showing diverted tonnage, net cost change, and CO₂e savings.
4. **Audits** every emission credit and debit with full methodology transparency, so no benefit is double-counted.

---

## 🏭 The Problem It Solves

Heavy industries generate hundreds of millions of tonnes of inorganic byproducts every year:

| Waste Type | Source | Annual Global Volume |
|---|---|---|
| **Fly Ash** (Class F / Class C) | Coal-fired power plants | ~1.1 billion t/yr |
| **GGBS / Steel Slag** | Integrated steel mills | ~600 million t/yr |
| **Mine Tailings** | Open-cut and underground mines | ~14 billion t/yr |
| **Red Mud (Bauxite Residue)** | Alumina refineries | ~200 million t/yr |

Despite most of these materials having documented reuse potential (in concrete, roads, backfill), **over 60% still end up in slurry ponds or dry landfills** because:

- Chemical composition varies batch-to-batch, making qualification uncertain.
- Transport costs kill economic viability beyond ~80–150 km by road.
- No single buyer can absorb the full volume — producers must split across multiple destinations.
- Environmental compliance teams lack tools to verify and report emissions benefits without double-counting.

**WasteFlow closes this gap** with a single, explainable decision workflow.

---

## 🔬 How It Works — The 4-Step Workflow

### Step 1 — Waste Characterization

The user defines their waste stream by selecting a **material preset** and adjusting parameters via live sliders. All inputs map directly to laboratory test methods:

| Parameter | Test Standard | Why It Matters |
|---|---|---|
| Loss on Ignition (LOI) | ASTM C311 | Measures unburnt carbon — too high disqualifies SCM pathway |
| SiO₂ + Al₂O₃ + Fe₂O₃ | ASTM C618 | Sum of pozzolanic oxides — minimum 70% for cement replacement |
| CaO | ASTM C618 | High calcium = self-cementing (Class C); low = pure pozzolan (Class F) |
| Fineness (45µm sieve) | ASTM C311 | Particle coarseness — finer means more reactive in concrete |
| Moisture Content | ASTM D2216 | Governs drying cost and pathway eligibility |
| California Bearing Ratio (CBR) | AASHTO T 193 | Load-bearing strength — minimum 8% for road sub-base |
| Plasticity Index (PI) | AASHTO T 90 | Clayey behaviour — must be less than 6 for road use |
| Swelling | ASTM D5239 | Volume instability — less than 1.5% for road base |
| UCS 28-day | ASTM D2166 | Compressive strength for mine backfill (min 0.5 MPa) |
| TCLP Lead (Pb) | EPA Method 1311 | Leachable heavy metal — must be less than 5 mg/L for non-hazardous classification |

**Available Presets:**
- 🏭 Class F Fly Ash (Bituminous Coal Plant)
- 🔥 Class C Fly Ash (Sub-bituminous Coal Plant)
- ⚙️ GGBS / Blast Furnace Slag (Integrated Steel Mill)
- ⛏️ Copper Flotation Tailings (Open-cut Mine)
- 🧱 Red Mud / Bauxite Residue (Alumina Refinery)

---

### Step 2 — Standards Compliance Engine

Every waste stream is evaluated against **4 reuse pathways** using a rule-based engine:

#### Pathway 1 — SCM / Clinker Replacement
- **Standard:** ASTM C618-22 (Fly Ash), ASTM C989-22 (Slag)
- **Criteria:** LOI less than 6%, pozzolanic oxides at least 70%, Moisture less than 1.5%, Fineness less than 34% retained on 45um, TCLP Pb less than 5 mg/L
- **Revenue:** ~₹2,940–₹3,530/tonne (~$35–42) to cement plants
- **CO₂ displaced:** ~0.82 tCO₂e per tonne of OPC clinker avoided

#### Pathway 2 — Geopolymer Concrete / Precast Blocks
- **Standard:** ACI 232.2R, EN 197-1
- **Criteria:** LOI less than 5%, pozzolanic oxides at least 65%, CaO less than 18%, Moisture less than 2%, TCLP Pb less than 5 mg/L
- **Revenue:** ~₹2,100–₹2,350/tonne (~$25–28) to precast manufacturers
- **CO₂ displaced:** ~0.65 tCO₂e per tonne of OPC + aggregate mix avoided

#### Pathway 3 — Road Sub-base and Structural Fill
- **Standard:** AASHTO M 145-91, IRC:SP:58
- **Criteria:** CBR at least 8%, PI less than 6, Swelling less than 1.5%, TCLP Pb less than 5 mg/L
- **Revenue:** ~₹590–₹760/tonne (~$7–9) to infrastructure contractors
- **CO₂ displaced:** ~0.008 tCO₂e per tonne of quarried crushed stone avoided

#### Pathway 4 — Mine Backfill and Soil Stabilization
- **Standard:** ASTM D4609-08, MSHA Guidelines
- **Criteria:** UCS 28-day at least 0.5 MPa, TCLP Pb less than 5 mg/L
- **Revenue:** ~₹420–₹505/tonne (~$5–6) to underground mine operators
- **CO₂ displaced:** ~0.003 tCO₂e per tonne of natural fill aggregate avoided

Each pathway returns a **pass**, **conditional** (marginally out-of-spec, fixable with pre-treatment), or **fail** status with the exact criterion and its standard reference cited.

---

### Step 3 — Allocation Optimizer

A **constrained greedy LP solver** allocates tonnes across eligible destinations.

#### Objective Function
```
maximize SUM [ (Purchase Price - Prep Cost - Freight Cost) x Allocated Tonnes ]
         minus (Disposal Cost x Landfill Tonnes)
```

- **Freight Cost** = Distance (km) x Freight Rate ($/t-km). Default: $0.065/t-km road HGV
- **Prep Cost** = Quality testing + loading + pre-treatment ($/t)
- **Purchase Price** = Offtake rate offered by buyer ($/t)
- **Disposal Cost** = Gate fee at tailings pond/landfill (₹1,850/t default, ~$22)

#### Constraints:
- Mass balance: all tonnes must be accounted for (reuse + disposal = total supply)
- Buyer capacity limits (t/month per destination)
- Quality compliance gate: routes open only if pathway check passed or is conditional

#### Priority Modes:
| Mode | Scoring |
|---|---|
| Economic | Maximise net revenue per tonne |
| Emissions | Maximise net CO₂e saved per tonne |
| Balanced | Weighted 50/50 combination |

Sensitivity controls for freight rate (₹2.50–₹12.60/t-km, ~$0.03–$0.15) and carbon credit price (₹0–₹6,720/tCO₂e, ~$0–$80) update the allocation in real time.

---

### Step 4 — Emissions Audit and Comparison Dashboard

#### Net Emissions Formula

```
delta_E_net = E_displaced_virgin + E_avoided_disposal - E_transport - E_processing
```

| Component | Direction | Emission Factor |
|---|---|---|
| Displaced virgin OPC clinker | Credit (+) | 820 kg CO₂e/t — IEA 2023 |
| Displaced quarried aggregate | Credit (+) | 8 kg CO₂e/t — ECOINVENT 3.9 |
| Avoided disposal operations | Credit (+) | 3.8 kg CO₂e/t — DEFRA 2023 |
| Road freight to destination | Debit (−) | 0.096 kg CO₂e/t-km — DEFRA 2023, HGV laden |
| Pre-treatment processing | Debit (−) | 0.716 kg CO₂e/kWh — CEA India 2024 |

#### No Double-Counting — ISO 14044 Cut-Off Method

Under the Recycled Content (Cut-Off) approach (ISO 14044:2006):

- Fly ash and slag enter the system boundary at **zero upstream burden**. The coal plant's combustion emissions remain with the primary producer.
- The waste producer **cannot** claim to have avoided coal plant emissions by recycling fly ash.
- **Scope attribution is separated:** If the cement plant (buyer) claims the OPC displacement credit in their Scope 3 Category 1 reporting, the producer reports only Scope 3 Category 5 (landfill avoidance). Never both simultaneously.

#### Outputs:
- Tonnes diverted vs. disposed with % diversion rate
- Net monthly cost: optimized vs. baseline disposal
- Net CO₂e saved per month, annualized, converted to passenger cars off road
- Stacked bar chart of credits vs. debits per destination
- Full itemized audit table with per-destination emission line items
- System boundary diagram with explicit exclusion/inclusion breakdown
- Standards and emission factor reference list for judge verification

---

## 🧱 Technical Architecture

```
WasteFlow/
├── index.html                     Entry point — Inter + JetBrains Mono fonts, SEO meta
├── src/
│   ├── main.jsx                   React root render
│   ├── App.jsx                    4-step wizard, global state management
│   ├── index.css                  Full design system (CSS custom properties, no Tailwind)
│   ├── data/
│   │   └── domain.js              Waste presets, pathway specs, destinations, EFs
│   ├── engine/
│   │   └── solver.js              Standards checker + LP allocation solver
│   ├── hooks/
│   │   └── useAnimations.js       React Bits interaction hooks
│   └── components/
│       ├── ui/
│       │   └── Primitives.jsx     MagneticButton, SpotlightCard, TiltCard, StatusBadge
│       └── steps/
│           ├── InputStep.jsx      Step 1: preset selector + accordion slider editor
│           ├── ComplianceStep.jsx Step 2: pathway eligibility report cards
│           ├── AllocationStep.jsx Step 3: optimizer + SVG flow diagram
│           └── AuditStep.jsx      Step 4: 3-tab audit dashboard + charts
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Vanilla CSS with CSS custom property design tokens |
| Charts | Recharts — stacked bar for emission breakdown |
| Icons | Lucide React |
| Animations | Custom React Bits hooks — magnetic, spotlight, tilt, stagger |
| Solver | Pure client-side JavaScript greedy LP (no backend required) |
| Fonts | Inter for UI, JetBrains Mono for all numeric/data values |

### React Bits Patterns Used

| Pattern | Implementation |
|---|---|
| MagneticButton | Cursor-pull transform on CTA buttons |
| SpotlightCard | Radial glow that follows mouse inside card boundary |
| TiltCard | 3D perspective rotateX/Y on hover |
| Staggered mount | Sequential fade-up with per-item delay offset |
| Animated counters | Ease-out cubic interpolation to target number |

---

## 🎨 Design Language

| Token | Value | Usage |
|---|---|---|
| --bg-void | #060a12 | Page background |
| --bg-surface | #111827 | Card surfaces |
| --emerald | #10b981 | Positive outcomes, savings, pass status |
| --cyan | #06b6d4 | Logistics, transport, data readouts |
| --violet | #8b5cf6 | Geopolymer pathway, balanced mode |
| --amber | #f59e0b | Warnings, conditional status, freight |
| --red | #ef4444 | Failures, disposal baseline |
| --indigo | #6366f1 | SCM pathway accent, methodology |

---

## 📚 Emission Standards and References

| Standard | Purpose |
|---|---|
| ASTM C618-22 | Fly ash classification and chemical limits for concrete |
| ASTM C989-22 | Slag cement specification |
| AASHTO M 145-91 | Soil classification for highway construction |
| ASTM D4609-08 | Soil stabilization admixture evaluation |
| EPA Method 1311 (TCLP) | Toxicity characteristic leaching for Pb, As, Cr |
| ISO 14040 / 14044:2006 | Life cycle assessment methodology |
| GHG Protocol Corporate Standard 2015 | Scope 1/2/3 boundary definitions |
| DEFRA UK GHG Conversion Factors 2023 | Road freight and landfill emission factors |
| CEA India National Grid 2024 | Electricity grid emission factor (0.716 kg CO₂e/kWh) |
| IEA Cement Decarbonisation Roadmap 2023 | OPC clinker carbon intensity (820 kg CO₂e/t) |
| IPCC AR6 WG3 2022 | Industrial sector CO₂ reduction pathways |

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# App opens at http://localhost:5173
```

**No backend, no API keys, no database required.** The entire decision engine runs in-browser.

---

## 👤 Intended Users

| User | How They Use WasteFlow |
|---|---|
| Power Plant / Steel Mill Manager | Pre-qualify ash/slag batches for sale; model revenue vs. disposal cost monthly |
| Environmental Compliance Officer | Generate audit-ready emissions reports; prove Scope 3 Category 5 reductions |
| Infrastructure Project Manager | Identify nearby low-cost fly ash sources for road base fill |
| Sustainability Consultant | Run what-if scenarios for carbon price and diesel rate sensitivities |
| Hackathon / Research Evaluator | Verify emissions methodology is standard-compliant and free of double-counting |

---

*Built with React 19 + Vite · ISO 14044 Cut-Off · GHG Protocol Scope 3 · DEFRA 2023 · CEA India 2024*
