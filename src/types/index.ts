export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type CervicalMucusType = 'dry' | 'sticky' | 'creamy' | 'egg_white';

export type IntimacyType = 'none' | 'protected' | 'unprotected';

export type CyclePhaseType = 
  | 'menstruation' 
  | 'follicular' 
  | 'fertile' 
  | 'ovulation' 
  | 'luteal' 
  | 'late';

export type FertilityChance = 'basse' | 'moyenne' | 'elevee' | 'maximale';

export interface Cycle {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD (bleeding end)
  periodDays: number; // Bleeding length in days (e.g. 5)
  cycleLength?: number; // Days until the next cycle start
  notes?: string;
  createdAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD (Unique key)
  flow?: FlowIntensity;
  symptoms: string[]; // e.g. ['crampes', 'maux_de_tete', 'ballonnements']
  moods: string[];    // e.g. ['calme', 'joyeuse', 'sensible']
  cervicalMucus?: CervicalMucusType;
  temperature?: number; // Basal body temperature in °C
  intimacy?: IntimacyType;
  contraceptiveTaken?: boolean;
  notes?: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UserSettings {
  userName?: string;
  defaultCycleLength: number; // in days, standard 28
  defaultPeriodDuration: number; // in days, standard 5
  lutealPhaseLength: number; // in days, standard 14
  useAutoAverage: boolean; // if true, calculates average from logged cycles
  reminderConsent?: boolean;
  alarmSound?: boolean; // sonnerie accompagnant les rappels (défaut : activée)
  themeMode?: ThemeMode; // clair / sombre / auto (20h-7h), défaut : auto
  onboardingCompleted?: boolean;
  tutorialCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CyclePrediction {
  cycleNumber: number;
  periodStartDate: string;
  periodEndDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  cycleLengthDays: number;
}

export interface CalculatedCycleStatus {
  hasData: boolean;
  lastCycle?: Cycle;
  currentCycleDay: number;
  expectedCycleLength: number;
  expectedPeriodDuration: number;
  currentPhase: CyclePhaseType;
  phaseLabel: string;
  phaseDescription: string;
  fertilityLevel: FertilityChance;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPeriodDate: string;
  daysUntilNextPeriod: number;
  isLate: boolean;
  daysLate: number;
  pregnancyTestDate: string;
  progressPercent: number;
}

export interface CycleStatistics {
  totalCycles: number;
  averageCycleLength: number;
  averagePeriodDuration: number;
  shortestCycle: number;
  longestCycle: number;
  regularityDescription: string;
  varianceDays: number;
}

export interface ExportPayload {
  version: number;
  exportedAt: string;
  appName: string;
  settings: UserSettings;
  cycles: Cycle[];
  dailyLogs: DailyLog[];
}
