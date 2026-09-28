// ═══════════════════════════════════════════════════════════════════════════════
// WasteOpt — Core Domain Data
// All values calibrated to Indian market conditions and Indian engineering standards
//
// KEY REFERENCES:
//   IS 3812:2003 (Part 1)   — Fly Ash for Concrete (BIS, India)
//   IS 16714:2018            — Ground Granulated Blast Furnace Slag (BIS, India)
//   IRC:SP:58-2001           — Guidelines for use of fly ash in road embankments
//   IRC:121-2017             — Guidelines for fly ash in road construction (MoRTH)
//   CPCB Guidelines          — Hazardous waste characterisation (India)
//   DGMS Circular 2008       — Mine backfill strength requirements
//   MoEF&CC Notification     — Fly Ash Utilisation (2021 Amendment)
//   CEA India 2023-24        — CO₂ baseline database, national grid factor
//   IPCC AR6 WG3 (2022)      — Industrial sector emission intensities
//   ECOINVENT 3.9            — Quarried aggregate LCA background data
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Waste Stream Presets ────────────────────────────────────────────────────
// Default compositions are representative of Indian thermal power plants,
// steel mills, and mines. Sources: NTPC EIA reports, CPCB fly ash inventory,
// published peer-reviewed compositions for Indian coal fly ash (Pandey & Singh 2010,
// Yao et al. 2015 India samples).

export const WASTE_PRESETS = {
  fly_ash_class_f: {
    id: 'fly_ash_class_f',
    name: 'Class F Fly Ash',
    source: 'Bituminous Coal Thermal Plant (e.g. NTPC Vindhyachal)',
    icon: '🏭',
    color: '#6366f1',
    defaults: {
      quantity: 5000,        // t/month — typical 500 MW unit at 75% PLF
      loi: 2.8,              // % — Indian bituminous coal ash: 1–5% (IS 3812 limit: ≤5%)
      sio2_al2o3_fe2o3: 79.2, // % — SiO₂+Al₂O₃+Fe₂O₃; Indian Class F: 72–88% (IS 3812 §5 Cl. 4.1)
      cao: 3.6,              // % — CaO; Indian bituminous coal ash: 1–5%
      moisture: 0.6,         // % — Dry collection (ESP); IS 3812 recommends dry ash
      fineness45: 20.0,      // % retained on 45µm IS sieve; IS 3812 max: 34%
      tclp_pb: 0.7,          // mg/L — CPCB TCLP threshold: <5 mg/L (non-hazardous)
      cbr: 14,               // % — Indian fly ash CBR: 10–25% (IRC:SP:58 min: 8%)
      pi: 2,                 // — Non-plastic to PI<3 typical for dry fly ash
      swelling: 0.3,         // % — Fly ash: near-zero swell; IRC:SP:58 max: 1.5%
      ucs_28d: 2.1,          // MPa — Stabilised fly ash; DGMS min: 0.5 MPa
    },
    description: 'Low-CaO, high-pozzolanic activity. Top-tier IS 3812 Grade I candidate. Most common Indian TPP output.'
  },
  fly_ash_class_c: {
    id: 'fly_ash_class_c',
    name: 'High-Calcium Fly Ash',
    source: 'Sub-bituminous / Lignite Coal Plant',
    icon: '🔥',
    color: '#f59e0b',
    defaults: {
      quantity: 3200,
      loi: 1.6,              // Lignite ash: typically 0.5–3% LOI
      sio2_al2o3_fe2o3: 62.4, // Lower silica+alumina; self-cementing due to high CaO
      cao: 22.8,             // % — CaO: 15–30% for self-cementing ash (IS 3812 Part 2)
      moisture: 1.0,         // IS 3812 limit for Grade I: as agreed; typically <1%
      fineness45: 16.0,
      tclp_pb: 0.4,
      cbr: 16,
      pi: 1,
      swelling: 0.5,
      ucs_28d: 2.8,
    },
    description: 'Self-cementing properties due to free lime. Road embankment & geopolymer feedstock.'
  },
  ggbs_slag: {
    id: 'ggbs_slag',
    name: 'GGBS / Blast Furnace Slag',
    source: 'Integrated Steel Plant (SAIL / RINL / Tata Steel)',
    icon: '⚙️',
    color: '#10b981',
    defaults: {
      quantity: 8000,        // t/month — a 4 MT/yr steel plant generates ~1.8 MT/yr slag
      loi: 0.3,              // IS 16714:2018 — near-zero LOI for granulated slag
      sio2_al2o3_fe2o3: 51.8, // IS 16714: SiO₂+Al₂O₃+Fe₂O₃ typically 48–58% for Indian BF slag
      cao: 42.5,             // % — CaO: 38–46% (Indian BF slag, higher than fly ash)
      moisture: 0.3,         // Near-dry after grinding; IS 16714 allows max 1%
      fineness45: 10.0,      // IS 16714:2018 Grade S400: specific surface ≥400 m²/kg → very fine
      tclp_pb: 0.1,          // Near-zero heavy metal leaching; no sulphide oxidation
      cbr: 22,
      pi: 1,
      swelling: 0.1,
      ucs_28d: 4.2,          // Slag with 3% OPC activator: 3–6 MPa (Tata Steel reported)
    },
    description: 'Premium SCM. IS 16714:2018 certified. Near-zero TCLP. Highest clinker displacement factor.'
  },
  copper_tailings: {
    id: 'copper_tailings',
    name: 'Copper Flotation Tailings',
    source: 'Copper Mine (Hindustan Copper / Sterlite)',
    icon: '⛏️',
    color: '#06b6d4',
    defaults: {
      quantity: 11000,       // t/month — typical Indian copper concentrator
      loi: 7.2,              // % — Residual sulfide and organic content
      sio2_al2o3_fe2o3: 66.5, // Quartz + feldspar-rich: SiO₂+Al₂O₃+Fe₂O₃ ~60–72%
      cao: 3.2,              // Low CaO typical of silica-rich copper tailings
      moisture: 24.0,        // % — Wet tailings from thickener: 20–30% moisture
      fineness45: 70.0,      // Very fine; flotation produces -75µm particles
      tclp_pb: 3.8,          // mg/L — Borderline; below CPCB 5 mg/L but needs monitoring
      cbr: 5,                // Low due to high fines and moisture
      pi: 9,                 // Plastic fines — fails road base threshold
      swelling: 1.9,         // Exceeds IRC limit without treatment
      ucs_28d: 0.25,         // Requires binder addition to meet DGMS 0.5 MPa
    },
    description: 'High moisture & plastic fines. Pre-treatment (drying + stabilisation) essential for any reuse.'
  },
  red_mud: {
    id: 'red_mud',
    name: 'Red Mud (Bauxite Residue)',
    source: 'Alumina Refinery (NALCO / Hindalco)',
    icon: '🧱',
    color: '#ef4444',
    defaults: {
      quantity: 5800,        // t/month — NALCO Damanjodi generates ~2.8 MT/yr
      loi: 9.8,              // % — High gibbsite + goethite; LOI 8–12% typical
      sio2_al2o3_fe2o3: 57.6, // Desilication-reduced silica; Fe₂O₃ 35–45% dominates
      cao: 4.8,              // % — Lime addition in Bayer process
      moisture: 30.0,        // % — Filter cake from red mud pond: 28–35% moisture
      fineness45: 82.0,      // Extremely fine; red mud D50 ≈ 5–30µm
      tclp_pb: 1.0,          // mg/L — pH >12 keeps metals immobile initially
      cbr: 3,                // Very low; requires stabilisation
      pi: 13,                // Highly plastic; fails all road-base criteria
      swelling: 2.4,         // Significant swelling due to cancrinite/sodalite phases
      ucs_28d: 0.15,         // Very low; activation required
    },
    description: 'Highly alkaline (pH>12), high moisture, high plasticity. Mine void backfill is primary viable route after neutralisation.'
  }
};

// ─── Reuse Pathways ───────────────────────────────────────────────────────────
// Standards: Indian (IS/IRC/DGMS) as primary; ASTM/AASHTO cited where IS is
// equivalent or non-existent.
// Purchase prices: Revenue received by waste PRODUCER per tonne disposed.
// Prep costs: At-source handling, quality certification, loading (₹/t).
//   Sources: NABL-accredited lab rates (IS 3812 full testing: ₹8,000–25,000/batch),
//   amortised over monthly volumes; loading/supervision at ₹30–80/t.

export const PATHWAYS = {
  scm: {
    id: 'scm',
    name: 'SCM / Clinker Replacement',
    shortName: 'SCM',
    standard: 'IS 3812:2003 (Part 1) / IS 16714:2018',
    icon: '🏗️',
    color: '#6366f1',
    virginDisplacedPerTonne: 0.82, // tCO₂e/t — OPC clinker (calcination + kiln fuel);
                                   // IEA Cement Roadmap 2023: 820 kg CO₂e/t clinker
    virginType: 'OPC Clinker',
    criteria: {
      // IS 3812:2003 (Part 1) — Table 1 chemical requirements for Grade I fly ash
      loi:              { max: 5.0,  label: 'LOI',                      unit: '%',    astmRef: 'IS 3812:2003 Cl. 5.1 (Table 1)' },
      sio2_al2o3_fe2o3: { min: 70.0, label: 'SiO₂+Al₂O₃+Fe₂O₃',      unit: '%',    astmRef: 'IS 3812:2003 Cl. 5.1 (Table 1)' },
      moisture:         { max: 1.0,  label: 'Moisture',                  unit: '%',    astmRef: 'IS 3812:2003 Cl. 5.3 (supplier agreement)' },
      fineness45:       { max: 34.0, label: 'Fineness (% ret. 45µm IS sieve)', unit: '%', astmRef: 'IS 3812:2003 Cl. 5.2 (Table 2)' },
      tclp_pb:          { max: 5.0,  label: 'TCLP Lead (Pb)',            unit: 'mg/L', astmRef: 'CPCB Hazardous Waste Rules 2016 Schedule III' },
    },
    // Under MoEF&CC 2021 Fly Ash Notification: ash must be provided free at pit-head.
    // Producer earns ₹100–200/t as loading/handling recovery from the cement plant.
    // Source: NTPC commercial ash supply agreements (public tenders 2022-24).
    prepCost: 80,        // ₹/t — NABL IS 3812 batch testing (₹12,000 ÷ 150t avg batch) + loading supervision
    purchasePrice: 150,  // ₹/t — Loading/handling recovery from cement plant (MoEF&CC mandated free supply at pithead; buyer pays transport + loading only)
    description: 'Partial replacement of OPC in concrete. Reduces clinker demand and calcination CO₂. Governed by IS 3812:2003.',
    prepNote: 'Carbon burnout furnace required if LOI > 4% (adds ₹120–200/t processing cost)'
  },
  geopolymer: {
    id: 'geopolymer',
    name: 'Geopolymer Concrete / Precast',
    shortName: 'Geopolymer',
    standard: 'IS 3812:2003 / BIS Draft Geopolymer Code (2023)',
    icon: '🧱',
    color: '#8b5cf6',
    virginDisplacedPerTonne: 0.65, // tCO₂e/t — Replaces OPC+aggregate blend in precast
                                   // (partial system; ECOINVENT 3.9 precast concrete)
    virginType: 'OPC + Natural Aggregate Blend',
    criteria: {
      // Geopolymer requires reactive aluminosilicate + controlled CaO for ambient curing
      loi:              { max: 5.0,  label: 'LOI',                unit: '%',    astmRef: 'IS 3812:2003 Cl. 5.1 (Table 1)' },
      sio2_al2o3_fe2o3: { min: 65.0, label: 'SiO₂+Al₂O₃+Fe₂O₃', unit: '%',    astmRef: 'BIS Draft Geopolymer Std 2023, Cl. 4.2' },
      cao:              { max: 15.0, label: 'CaO',                 unit: '%',    astmRef: 'BIS Draft Geopolymer Std 2023 Cl. 4.3 (ambient cure limit)' },
      moisture:         { max: 1.5,  label: 'Moisture',             unit: '%',    astmRef: 'IS 3812:2003 Cl. 5.3' },
      tclp_pb:          { max: 5.0,  label: 'TCLP Lead (Pb)',       unit: 'mg/L', astmRef: 'CPCB Hazardous Waste Rules 2016' },
    },
    // Premium market: geopolymer precast blocks sell ₹4,500–8,000/t; raw ash sourced at ₹600–1,200/t
    // Source: GeoShree (Pune), Conmix (Gujarat) market rates 2023
    prepCost: 140,       // ₹/t — Stricter QC: fineness verification (Blaine test) + moisture testing + loading
    purchasePrice: 900,  // ₹/t — Geopolymer precast producer pays ₹700–1,200/t for quality-certified ash (IndiaMART, 2024)
    description: 'Alkali-activated binder for precast blocks, pavers and structural masonry. Growing Indian market.',
    prepNote: 'Alkaline activator (NaOH/waterglass) costs ₹25,000–40,000/t at buyer — not included in this calculation'
  },
  road_base: {
    id: 'road_base',
    name: 'Road Embankment & Sub-base Fill',
    shortName: 'Road Base',
    standard: 'IRC:SP:58-2001 / IRC:121-2017 (MoRTH)',
    icon: '🛣️',
    color: '#f59e0b',
    virginDisplacedPerTonne: 0.008, // tCO₂e/t — Replaces quarried crushed stone/moorum
                                    // (ECOINVENT 3.9: quarried aggregate 8 kg CO₂e/t)
    virginType: 'Quarried Stone / Moorum',
    criteria: {
      // IRC:SP:58-2001 Table 2 and IRC:121-2017 Cl. 5.3 — Physical requirements for road embankment fill
      cbr:      { min: 8,   label: 'CBR',              unit: '%',    astmRef: 'IRC:SP:58-2001 Table 2 (min CBR 8%)' },
      pi:       { max: 6,   label: 'Plasticity Index',  unit: '',     astmRef: 'IRC:121-2017 Cl. 5.3 (PI ≤ 6 or NP)' },
      swelling: { max: 1.5, label: 'Swelling',          unit: '%',    astmRef: 'IRC:SP:58-2001 Cl. 5.2.4 (max 1.5%)' },
      tclp_pb:  { max: 5.0, label: 'TCLP Lead (Pb)',    unit: 'mg/L', astmRef: 'CPCB / MoEF&CC Fly Ash Notification 2021' },
    },
    // MoRTH mandates fly ash use in road projects within 100 km of TPPs (IRC:121-2017)
    // Payment is near-zero to the producer; contractor benefits from avoiding quarried material cost
    prepCost: 45,        // ₹/t — Basic compaction/CBR certification + loading at source (IS 2720 Part 16 testing)
    purchasePrice: 120,  // ₹/t — Handling/loading recovery (MoRTH mandated near-zero cost; ₹80–200/t range per contractor agreements)
    description: 'Fly ash embankment fill for NH/SH projects under MoRTH mandate. Replaces costly quarried moorum.',
    prepNote: 'Dry fly ash only; pond ash requires drying + compaction trials before IRC:SP:58 acceptance'
  },
  mine_backfill: {
    id: 'mine_backfill',
    name: 'Mine Backfill & Stope Fill',
    shortName: 'Mine Backfill',
    standard: 'DGMS Circular 2008 / IS 2720 Part 39 / CPCB 2016',
    icon: '⛏️',
    color: '#10b981',
    virginDisplacedPerTonne: 0.003, // tCO₂e/t — Replaces crushed stone/mine waste aggregate
                                    // (ECOINVENT 3.9 aggregate + compaction)
    virginType: 'Natural Fill Aggregate / Mine Waste',
    criteria: {
      // DGMS Circular 2008 — Mine backfill strength specification for underground workings
      ucs_28d:  { min: 0.5, label: 'UCS 28-day',     unit: 'MPa',  astmRef: 'DGMS Circular 2008, IS 2720 Part 39' },
      tclp_pb:  { max: 5.0, label: 'TCLP Lead (Pb)', unit: 'mg/L', astmRef: 'CPCB Hazardous Waste Rules 2016 / EP Notification 1989' },
    },
    // Mines pay for backfill material supply; prevents surface subsidence liability
    prepCost: 35,        // ₹/t — Slurry preparation check + loading (minimal QC at source)
    purchasePrice: 450,  // ₹/t — Mine operator pays ₹300–600/t for conditioned paste/slurry backfill (Coal India, Hindustan Copper tender rates 2023)
    description: 'Paste or hydraulic backfill for underground stopes. Prevents surface subsidence. DGMS-compliant.',
    prepNote: 'OPC addition (1–3%) at mine typically required to reach UCS target — ₹100–200/t binder cost at mine'
  }
};

// ─── Destination Network ─────────────────────────────────────────────────────
// purchasePrice = what the BUYER pays the waste producer (₹/t)
// Distances represent typical intra-state India corridor distances.
// Buyer capacities from Indian cement/infrastructure project typical monthly offtake.

export const DESTINATIONS = [
  {
    id: 'cement_factory_a',
    name: 'Prism Cement Plant',
    type: 'scm',
    location: 'East Industrial Corridor',
    distance: 72,          // km — typical plant-to-plant corridor
    capacity: 3500,        // t/month — medium cement plant, 30% fly ash substitution
    purchasePrice: 160,    // ₹/t — loading recovery; IS 3812 Grade I certified ash
    x: 820, y: 160,
  },
  {
    id: 'cement_factory_b',
    name: 'JK Cement Works',
    type: 'scm',
    location: 'Port-Side Cluster',
    distance: 115,
    capacity: 2200,
    purchasePrice: 200,    // ₹/t — slightly higher: export-grade ash with IS 3812 certificate
    x: 880, y: 340,
  },
  {
    id: 'geopolymer_plant',
    name: 'GeoPrecast Blocks Pvt Ltd',
    type: 'geopolymer',
    location: 'North Industrial Park',
    distance: 48,
    capacity: 1200,
    purchasePrice: 950,    // ₹/t — premium certified ash; IndiaMART verified 2024
    x: 680, y: 100,
  },
  {
    id: 'highway_project',
    name: 'NH-48 NHAI Package 3',
    type: 'road_base',
    location: 'Western NH Corridor',
    distance: 32,          // km — within MoRTH 100 km mandatory zone
    capacity: 5000,        // t/month — large highway project
    purchasePrice: 130,    // ₹/t — handling recovery per contractor BoQ
    x: 280, y: 200,
  },
  {
    id: 'road_project_b',
    name: 'State PWD Ring Road Phase 2',
    type: 'road_base',
    location: 'Southern Bypass',
    distance: 58,
    capacity: 2500,
    purchasePrice: 100,    // ₹/t — State project; lower budget than NHAI
    x: 340, y: 420,
  },
  {
    id: 'mine_site',
    name: 'CIL Subsidiary Underground Mine',
    type: 'mine_backfill',
    location: 'Coalfields District',
    distance: 135,
    capacity: 4000,
    purchasePrice: 470,    // ₹/t — Coal India subsidiary tender rate 2023 (GoM approved)
    x: 160, y: 320,
  },
  {
    id: 'landfill',
    name: 'Ash Pond / Tailings Storage Facility',
    type: 'disposal',
    location: 'On-site TSF',
    distance: 5,           // km — typically on-plant premises
    capacity: 999999,
    // Disposal COST to producer: ash pond OPEX = ₹96–500/t
    // Source: NTPC ash pond O&M tender rates (GeM 2022-24); CEA ash utilisation report
    // Using ₹320/t as representative weighted average (dry: ₹200–400/t, wet pond: ₹96–250/t)
    purchasePrice: -320,
    x: 500, y: 500,
  }
];

// ─── Emission Factors ─────────────────────────────────────────────────────────
// All factors are India-specific where available.

export const EMISSION_FACTORS = {
  // Road freight — Indian HGV (multi-axle, diesel, laden)
  // Derived: MoRTH vehicle energy audit + ICCT India freight report 2023
  // Indian trucks ≈ 10–15% less efficient than EU due to older fleet & road quality
  // Value: 0.105 kg CO₂e/t-km (vs DEFRA EU 0.096; India +10% for fleet age)
  freight_road_per_tkm: 0.105,

  // Rail freight — Indian Railways (diesel traction; electrification ~55%)
  // Source: Indian Railways Annual Report 2022-23, GHG inventory
  freight_rail_per_tkm: 0.032,

  // India national grid emission factor
  // Source: CEA CO₂ Baseline Database Version 18.0 (2023-24): 0.716 kg CO₂e/kWh
  grid_electricity_kg_per_kwh: 0.716,

  // Drying energy proxy (rotary dryer fuel: coal/diesel mix)
  drying_fuel_per_tonne_moisture_pct: 0.14, // kg CO₂e per % moisture removed per tonne

  // Avoided ash pond/TSF operations per tonne disposed
  // Source: NTPC O&M tender averages; CEA fly ash utilisation data
  // Includes: pumping slurry, pond dyke maintenance, water treatment, dust suppression
  landfill_avoided_per_tonne: 2.8, // kg CO₂e/t (India: lower than DEFRA EU value)

  // Ash pond / TSF disposal gate fee (operational cost to producer)
  // Source: NTPC ash pond O&M contracts (GeM portal 2022-24)
  // Weighted average: dry disposal ₹200-400/t; wet pond ₹96-250/t → weighted ₹320/t
  disposal_gate_fee: 320,  // ₹/tonne

  // Indian road freight rate for cost calculation
  // Derived: ₹35–85/km for HGV ÷ 20t average load = ₹1.75–4.25/t-km
  // Using ₹3.2/t-km as central estimate for NH corridors (diesel ~₹95/L, 2024)
  freight_rate_inr_per_tkm: 3.2,
};
