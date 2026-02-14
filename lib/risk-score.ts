/**
 * Computes the compound risk score (1-100) based on domain severities and event type.
 * 
 * Algorithm:
 * 1. Extract each domain's max severity (G, E, F, I, C) - 1-10 scale.
 * 2. Determine category weights based on the event type (see weights table).
 * 3. weighted_avg = sum(weight_i * score_i) for all 5 domains.
 * 4. Count domains with score >= 7 as "high_severity_domains".
 * 5. cascade_multiplier = 1.0 + (high_severity_domains - 1) * 0.1  (min 1.0)
 * 6. compound_risk_score = min(round(weighted_avg * cascade_multiplier * 10), 100)
 */

type DomainScores = {
    geopolitics: number;
    economy: number;
    food: number;
    infrastructure: number;
    civilian: number;
};

// Weights table from Spec §3.7
const CATEGORY_WEIGHTS: Record<string, DomainScores> = {
    geopolitical: { geopolitics: 0.30, economy: 0.20, food: 0.15, infrastructure: 0.15, civilian: 0.20 },
    climate: { geopolitics: 0.10, economy: 0.20, food: 0.25, infrastructure: 0.20, civilian: 0.25 },
    infrastructure: { geopolitics: 0.10, economy: 0.25, food: 0.15, infrastructure: 0.30, civilian: 0.20 },
    economic: { geopolitics: 0.15, economy: 0.35, food: 0.15, infrastructure: 0.15, civilian: 0.20 },
    health: { geopolitics: 0.15, economy: 0.25, food: 0.10, infrastructure: 0.10, civilian: 0.40 },
};

export function computeCompoundRiskScore(
    scores: DomainScores,
    eventCategories: string[]
): number {
    // Determine weights. Use the first category as primary.
    // Spec says: "Determine category weights based on the event type".
    // If no match found, default to equal weights or 'geopolitical' as fallback?
    // Let's use 'geopolitical' as fallback or equal weights if empty.
    const primaryCategory = eventCategories[0]?.toLowerCase() || "geopolitical";
    const weights = CATEGORY_WEIGHTS[primaryCategory] || CATEGORY_WEIGHTS["geopolitical"];

    // Calculate weighted average (on 1-10 scale)
    let weightedSum = 0;
    weightedSum += scores.geopolitics * weights.geopolitics;
    weightedSum += scores.economy * weights.economy;
    weightedSum += scores.food * weights.food;
    weightedSum += scores.infrastructure * weights.infrastructure;
    weightedSum += scores.civilian * weights.civilian;

    // Count high severity domains (>= 7)
    let highSeverityCount = 0;
    if (scores.geopolitics >= 7) highSeverityCount++;
    if (scores.economy >= 7) highSeverityCount++;
    if (scores.food >= 7) highSeverityCount++;
    if (scores.infrastructure >= 7) highSeverityCount++;
    if (scores.civilian >= 7) highSeverityCount++;

    // Calculate cascade multiplier
    // cascade_multiplier = 1.0 + (high_severity_domains - 1) * 0.1  (min 1.0)
    let cascadeMultiplier = 1.0;
    if (highSeverityCount > 1) {
        cascadeMultiplier = 1.0 + (highSeverityCount - 1) * 0.1;
    }

    // Result calculation
    // compound_risk_score = min(round(weighted_avg * cascade_multiplier * 10), 100)
    const rawScore = weightedSum * cascadeMultiplier * 10;

    // Spec implies rounding THEN capping? Or cap then round?
    // "min(round(...), 100)" implies round first.
    let finalScore = Math.round(rawScore);

    if (finalScore > 100) finalScore = 100;

    // Should pass the Suez test (score ~99/100)

    return finalScore;
}
