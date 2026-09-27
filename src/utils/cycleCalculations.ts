import { Cycle, CalculatedCycleStatus, CyclePhaseType, FertilityChance, CyclePrediction, CycleStatistics, UserSettings } from '../types';

/**
 * Format Date to YYYY-MM-DD safely
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a Date at midnight local time
 */
export function parseDate(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Add days to a YYYY-MM-DD string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Difference in days between two YYYY-MM-DD strings (b - a)
 */
export function diffDays(dateAStr: string, dateBStr: string): number {
  const a = parseDate(dateAStr).getTime();
  const b = parseDate(dateBStr).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Format date in French natural readable string (e.g., "14 Octobre 2026")
 */
export function formatFrenchDate(dateStr: string, includeYear = true): string {
  const d = parseDate(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    ...(includeYear ? { year: 'numeric' } : {}),
  };
  return d.toLocaleDateString('fr-FR', options);
}

/**
 * Format date with day of week (e.g. "Mercredi 14 Octobre")
 */
export function formatFrenchFullDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Calculate statistical averages and variation from recorded cycles
 */
export function calculateCycleStatistics(cycles: Cycle[], defaultLength = 28, defaultPeriod = 5): CycleStatistics {
  if (!cycles || cycles.length === 0) {
    return {
      totalCycles: 0,
      averageCycleLength: defaultLength,
      averagePeriodDuration: defaultPeriod,
      shortestCycle: defaultLength,
      longestCycle: defaultLength,
      regularityDescription: 'Données insuffisantes',
      varianceDays: 0,
    };
  }

  // Sort chronologically ascending
  const sorted = [...cycles].sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());

  // Extract explicit cycleLengths or calculate from consecutive starts
  const cycleLengths: number[] = [];
  const periodLengths: number[] = sorted.map((c) => c.periodDays || defaultPeriod);

  for (let i = 0; i < sorted.length - 1; i++) {
    const len = diffDays(sorted[i].startDate, sorted[i + 1].startDate);
    if (len >= 18 && len <= 55) {
      cycleLengths.push(len);
    }
  }

  // Also include any cycle length stored explicitly on older cycles
  if (cycleLengths.length === 0) {
    for (const c of sorted) {
      if (c.cycleLength && c.cycleLength >= 18 && c.cycleLength <= 55) {
        cycleLengths.push(c.cycleLength);
      }
    }
  }

  const effectiveLengths = cycleLengths.length > 0 ? cycleLengths : [defaultLength];
  const avgCycle = Math.round(effectiveLengths.reduce((acc, curr) => acc + curr, 0) / effectiveLengths.length);
  const avgPeriod = Math.round(periodLengths.reduce((acc, curr) => acc + curr, 0) / periodLengths.length);
  const minCycle = Math.min(...effectiveLengths);
  const maxCycle = Math.max(...effectiveLengths);
  const variance = maxCycle - minCycle;

  let regularityDescription = 'Régulier';
  if (effectiveLengths.length < 2) {
    regularityDescription = 'Basé sur vos paramètres par défaut';
  } else if (variance <= 2) {
    regularityDescription = 'Très régulier (±1 jour)';
  } else if (variance <= 5) {
    regularityDescription = 'Régulier (±2-3 jours)';
  } else {
    regularityDescription = 'Cycle variable (écart de ' + variance + ' jours)';
  }

  return {
    totalCycles: sorted.length,
    averageCycleLength: avgCycle,
    averagePeriodDuration: avgPeriod,
    shortestCycle: minCycle,
    longestCycle: maxCycle,
    regularityDescription,
    varianceDays: variance,
  };
}

/**
 * Determine current status based on the latest cycle and user settings
 */
export function getCycleStatus(
  cycles: Cycle[],
  settings: UserSettings,
  targetDateStr: string = formatDate(new Date())
): CalculatedCycleStatus {
  if (!cycles || cycles.length === 0) {
    return {
      hasData: false,
      currentCycleDay: 0,
      expectedCycleLength: settings.defaultCycleLength || 28,
      expectedPeriodDuration: settings.defaultPeriodDuration || 5,
      currentPhase: 'follicular',
      phaseLabel: 'Aucun cycle enregistré',
      phaseDescription: 'Enregistrez votre premier cycle pour activer le suivi et les prévisions.',
      fertilityLevel: 'basse',
      ovulationDate: '',
      fertileWindowStart: '',
      fertileWindowEnd: '',
      nextPeriodDate: '',
      daysUntilNextPeriod: 0,
      isLate: false,
      daysLate: 0,
      pregnancyTestDate: '',
      progressPercent: 0,
    };
  }

  // Get most recent cycle relative to target date
  const sorted = [...cycles].sort((a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime());
  const lastCycle = sorted[0];

  const stats = calculateCycleStatistics(cycles, settings.defaultCycleLength, settings.defaultPeriodDuration);
  const expectedCycleLength = settings.useAutoAverage && stats.totalCycles >= 2 
    ? stats.averageCycleLength 
    : (settings.defaultCycleLength || 28);
  
  const expectedPeriodDuration = lastCycle.periodDays || stats.averagePeriodDuration || settings.defaultPeriodDuration || 5;
  const lutealPhase = settings.lutealPhaseLength || 14;

  // Day calculation (Day 1 is startDate)
  const daysDiff = diffDays(lastCycle.startDate, targetDateStr);
  const currentCycleDay = daysDiff + 1; // 1-indexed

  // Ovulation is typically CycleLength - LutealPhase days after start
  const ovulationOffset = Math.max(7, expectedCycleLength - lutealPhase);
  const ovulationDate = addDaysToDate(lastCycle.startDate, ovulationOffset);

  // Fertile window: 5 days prior to ovulation until 1 day after
  const fertileWindowStart = addDaysToDate(ovulationDate, -5);
  const fertileWindowEnd = addDaysToDate(ovulationDate, 1);

  // Next period date
  const nextPeriodDate = addDaysToDate(lastCycle.startDate, expectedCycleLength);
  const daysUntilNextPeriod = diffDays(targetDateStr, nextPeriodDate);
  const isLate = daysUntilNextPeriod < 0;
  const daysLate = isLate ? Math.abs(daysUntilNextPeriod) : 0;

  // Pregnancy test date: day after expected period
  const pregnancyTestDate = addDaysToDate(nextPeriodDate, 1);

  // Determine current phase & fertility level
  let currentPhase: CyclePhaseType = 'follicular';
  let phaseLabel = 'Phase folliculaire';
  let phaseDescription = 'Votre corps prépare un nouvel ovule. L’énergie et l’optimisme sont souvent en hausse.';
  let fertilityLevel: FertilityChance = 'basse';

  if (currentCycleDay >= 1 && currentCycleDay <= expectedPeriodDuration) {
    currentPhase = 'menstruation';
    phaseLabel = 'Période des règles';
    phaseDescription = 'Vos menstruations sont en cours. Privilégiez le repos, une bonne hydratation et des aliments riches en fer.';
    fertilityLevel = 'basse';
  } else if (isLate) {
    currentPhase = 'late';
    phaseLabel = `Retard de règles (${daysLate} jour${daysLate > 1 ? 's' : ''})`;
    phaseDescription = 'Votre cycle dépasse la durée habituelle. Un test de grossesse urinaire est possible dès maintenant.';
    fertilityLevel = 'basse';
  } else if (targetDateStr === ovulationDate) {
    currentPhase = 'ovulation';
    phaseLabel = 'Jour d’ovulation';
    phaseDescription = 'Un ovule a été libéré. C’est le moment où les chances de conception sont à leur niveau maximal.';
    fertilityLevel = 'maximale';
  } else if (targetDateStr >= fertileWindowStart && targetDateStr <= fertileWindowEnd) {
    currentPhase = 'fertile';
    const daysToOvu = diffDays(targetDateStr, ovulationDate);
    if (daysToOvu === 1 || daysToOvu === 0) {
      fertilityLevel = 'elevee';
    } else {
      fertilityLevel = 'moyenne';
    }
    phaseLabel = 'Fenêtre de fertilité';
    phaseDescription = 'Période fertile. La glaire cervicale devient plus fluide et claire pour faciliter le passage des spermatozoïdes.';
  } else if (targetDateStr > fertileWindowEnd) {
    currentPhase = 'luteal';
    phaseLabel = 'Phase lutéale';
    phaseDescription = 'Post-ovulation dominée par la progestérone. Possibles signes prémenstruels légers à l’approche des règles.';
    fertilityLevel = 'basse';
  } else {
    currentPhase = 'follicular';
    phaseLabel = 'Phase pré-ovulatoire';
    phaseDescription = 'Développement folliculaire. Hausse progressive des œstrogènes et bien-être général.';
    fertilityLevel = 'moyenne';
  }

  // Progress percentage across expected cycle
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentCycleDay / expectedCycleLength) * 100)));

  return {
    hasData: true,
    lastCycle,
    currentCycleDay,
    expectedCycleLength,
    expectedPeriodDuration,
    currentPhase,
    phaseLabel,
    phaseDescription,
    fertilityLevel,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    nextPeriodDate,
    daysUntilNextPeriod,
    isLate,
    daysLate,
    pregnancyTestDate,
    progressPercent,
  };
}

/**
 * Predict next N cycles based on starting reference date and parameters
 */
export function predictFutureCycles(
  lastStartDate: string,
  cycleLength: number = 28,
  periodDuration: number = 5,
  lutealPhase: number = 14,
  count: number = 6
): CyclePrediction[] {
  const predictions: CyclePrediction[] = [];
  let currentStart = lastStartDate;

  for (let i = 1; i <= count; i++) {
    const nextStart = addDaysToDate(currentStart, cycleLength);
    const periodEnd = addDaysToDate(nextStart, periodDuration - 1);
    const ovulationOffset = Math.max(7, cycleLength - lutealPhase);
    const ovulationDate = addDaysToDate(nextStart, ovulationOffset);
    const fertileWindowStart = addDaysToDate(ovulationDate, -5);
    const fertileWindowEnd = addDaysToDate(ovulationDate, 1);

    predictions.push({
      cycleNumber: i,
      periodStartDate: nextStart,
      periodEndDate: periodEnd,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      cycleLengthDays: cycleLength,
    });

    currentStart = nextStart;
  }

  return predictions;
}

/**
 * Get detailed classification for any specific calendar date
 */
export function getDayClassification(
  dateStr: string,
  cycles: Cycle[],
  settings: UserSettings
): {
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isLuteal: boolean;
  isPredictedPeriod: boolean;
  cycleDay?: number;
} {
  if (!cycles || cycles.length === 0) {
    return { isPeriod: false, isFertile: false, isOvulation: false, isLuteal: false, isPredictedPeriod: false };
  }

  const stats = calculateCycleStatistics(cycles, settings.defaultCycleLength, settings.defaultPeriodDuration);
  const cycleLength = settings.useAutoAverage ? stats.averageCycleLength : settings.defaultCycleLength;
  const periodDuration = stats.averagePeriodDuration || settings.defaultPeriodDuration;
  const luteal = settings.lutealPhaseLength || 14;

  // Check if date falls in any logged past cycle period
  for (const c of cycles) {
    const periodEnd = c.endDate || addDaysToDate(c.startDate, (c.periodDays || periodDuration) - 1);
    if (dateStr >= c.startDate && dateStr <= periodEnd) {
      const day = diffDays(c.startDate, dateStr) + 1;
      return {
        isPeriod: true,
        isFertile: false,
        isOvulation: false,
        isLuteal: false,
        isPredictedPeriod: false,
        cycleDay: day,
      };
    }
  }

  // Check relative to latest cycle
  const latestCycle = [...cycles].sort((a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime())[0];
  const daysDiff = diffDays(latestCycle.startDate, dateStr);

  // If in the current active cycle
  if (daysDiff >= 0 && daysDiff < cycleLength * 1.5) {
    const currentDay = daysDiff + 1;
    const ovulationOffset = Math.max(7, cycleLength - luteal);
    const ovulationDate = addDaysToDate(latestCycle.startDate, ovulationOffset);
    const fertileStart = addDaysToDate(ovulationDate, -5);
    const fertileEnd = addDaysToDate(ovulationDate, 1);

    const isOvulation = dateStr === ovulationDate;
    const isFertile = dateStr >= fertileStart && dateStr <= fertileEnd;
    const isPeriod = currentDay <= (latestCycle.periodDays || periodDuration);
    const isLuteal = dateStr > fertileEnd && dateStr < addDaysToDate(latestCycle.startDate, cycleLength);

    return {
      isPeriod,
      isFertile,
      isOvulation,
      isLuteal,
      isPredictedPeriod: false,
      cycleDay: currentDay,
    };
  }

  // Check predicted future cycles (up to 6 ahead)
  const predictions = predictFutureCycles(latestCycle.startDate, cycleLength, periodDuration, luteal, 6);
  for (const p of predictions) {
    if (dateStr >= p.periodStartDate && dateStr <= p.periodEndDate) {
      return {
        isPeriod: false,
        isFertile: false,
        isOvulation: false,
        isLuteal: false,
        isPredictedPeriod: true,
      };
    }
    if (dateStr === p.ovulationDate) {
      return {
        isPeriod: false,
        isFertile: true,
        isOvulation: true,
        isLuteal: false,
        isPredictedPeriod: false,
      };
    }
    if (dateStr >= p.fertileWindowStart && dateStr <= p.fertileWindowEnd) {
      return {
        isPeriod: false,
        isFertile: true,
        isOvulation: false,
        isLuteal: false,
        isPredictedPeriod: false,
      };
    }
  }

  return { isPeriod: false, isFertile: false, isOvulation: false, isLuteal: false, isPredictedPeriod: false };
}
