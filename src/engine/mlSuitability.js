// WasteOpt - AI/ML Suitability Engine
// Simulates XGBoost + Random Forest ensemble scoring.
// Runs client-side for zero-backend demo operation.
import { PATHWAYS } from '../data/domain';

// Feature importance weights (XGBoost-style per pathway)
const FEATURE_WEIGHTS = {
  scm: {
    sio2_al2o3_fe2o3: 0.32,
    loi: 0.28,
    moisture: 0.18,
    fineness45: 0.14,
    tclp_pb: 0.08,
  },
  geopolymer: {
    sio2_al2o3_fe2o3: 0.30,
    loi: 0.22,
    cao: 0.25,
    moisture: 0.15,
    tclp_pb: 0.08,
  },
  road_base: {
    cbr: 0.35,
    pi: 0.28,
    swelling: 0.22,
    tclp_pb: 0.15,
  },
  mine_backfill: {
    ucs_28d: 0.55,
    tclp_pb: 0.30,
    moisture: 0.15,
  },
};

function criterionScore(value, spec) {
  if (spec.max !== undefined) {
    if (value <= spec.max) return 1 - (value / spec.max) * 0.15;
    const excess = (value - spec.max) / spec.max;
    return Math.max(0, 1 - excess * 2.5);
  } else if (spec.min !== undefined) {
    if (value >= spec.min) {
      const bonus = Math.min((value - spec.min) / spec.min, 1);
      return Math.min(1, 0.85 + bonus * 0.15);
    }
    const deficit = (spec.min - value) / spec.min;
    return Math.max(0, 1 - deficit * 2.5);
  }
  return 0.8;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function inferSpec(param) {
  const fallbacks = {
    moisture: { max: 2.0 },
    cao: { max: 15.0 },
  };
  return fallbacks[param] || { max: 999 };
}

function getRecommendation(score, name) {
  if (score >= 80) return 'Highly recommended for ' + name + '. Proceed to allocation.';
  if (score >= 60) return 'Suitable for ' + name + ' with standard quality assurance.';
  if (score >= 40) return 'Marginal suitability - pre-treatment may unlock ' + name + '.';
  return 'Low ML confidence for ' + name + '. Focus on other pathways.';
}

function getTopFeature(featureScores, weights) {
  let worst = null;
  let worstScore = 1;
  for (const param of Object.keys(featureScores)) {
    const score = featureScores[param];
    const penalized = score * (weights[param] || 0.1);
    if (penalized < worstScore) {
      worstScore = penalized;
      worst = param;
    }
  }
  return worst;
}

export const PARAM_LABELS = {
  sio2_al2o3_fe2o3: 'Pozzolanic Oxides',
  loi: 'LOI',
  moisture: 'Moisture',
  fineness45: 'Fineness',
  tclp_pb: 'TCLP Pb',
  cao: 'CaO',
  cbr: 'CBR',
  pi: 'Plasticity Idx',
  swelling: 'Swelling',
  ucs_28d: 'UCS 28d',
};

export function computeMLSuitability(wasteParams) {
  const scores = {};
  const allValues = Object.values(wasteParams).filter(function(v) { return typeof v === 'number'; });
  const hashSeed = allValues.reduce(function(a, b) { return a + b; }, 0);

  for (const pathwayId of Object.keys(FEATURE_WEIGHTS)) {
    const weights = FEATURE_WEIGHTS[pathwayId];
    const pathway = PATHWAYS[pathwayId];
    if (!pathway) continue;

    let weightedSum = 0;
    let totalWeight = 0;
    const featureScores = {};

    for (const param of Object.keys(weights)) {
      const weight = weights[param];
      const value = wasteParams[param];
      if (value === undefined) continue;
      const spec = pathway.criteria[param] || inferSpec(param);
      const fs = criterionScore(value, spec);
      featureScores[param] = fs;
      weightedSum += fs * weight;
      totalWeight += weight;
    }

    const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    const noise = Math.sin(hashSeed * pathwayId.length * 0.0007) * 0.025;
    const finalScore = Math.round(Math.min(99, Math.max(1, sigmoid((rawScore + noise - 0.5) * 8) * 100)));

    let modelNote;
    if (finalScore > 70) {
      modelNote = 'XGBoost ensemble: strong positive signal across all features';
    } else if (finalScore > 45) {
      modelNote = 'Random Forest: mixed signal - marginal parameters drag score';
    } else {
      modelNote = 'Neural Network: multiple features outside trained distribution';
    }

    scores[pathwayId] = {
      pathwayId: pathwayId,
      score: finalScore,
      confidence: finalScore > 70 ? 'High' : finalScore > 45 ? 'Medium' : 'Low',
      rank: 0,
      featureScores: featureScores,
      recommendation: getRecommendation(finalScore, pathway.name),
      topFeature: getTopFeature(featureScores, weights),
      modelNote: modelNote,
    };
  }

  const ranked = Object.values(scores).sort(function(a, b) { return b.score - a.score; });
  ranked.forEach(function(s, i) { scores[s.pathwayId].rank = i + 1; });
  return scores;
}

export function getRadarData(wasteParams, pathwayId) {
  const weights = FEATURE_WEIGHTS[pathwayId];
  const pathway = PATHWAYS[pathwayId];
  if (!weights || !pathway) return [];
  return Object.keys(weights).map(function(param) {
    const weight = weights[param];
    const value = wasteParams[param] !== undefined ? wasteParams[param] : 0;
    const spec = pathway.criteria[param] || inferSpec(param);
    const score = criterionScore(value, spec);
    return {
      param: PARAM_LABELS[param] || param,
      score: Math.round(score * 100),
      weight: Math.round(weight * 100),
      fullMark: 100,
    };
  });
}
