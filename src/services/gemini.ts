import type { CalculatedCycleStatus } from '../types';

/**
 * Conseils IA : n’envoie que des indicateurs de cycle (phase, jours), jamais le carnet intime.
 * Sans clé API, on reste sur un texte local (clé optionnelle dans .env.local).
 * La bibliothèque @google/genai est chargée à la demande (code-splitting) pour alléger le bundle.
 */
function getApiKey(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  return (env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '').trim();
}

export function isGeminiConfigured(): boolean {
  return getApiKey().length > 0;
}

export function buildLocalAdvice(status: CalculatedCycleStatus): string {
  if (!status.hasData) {
    return 'Enregistre le début de tes règles pour obtenir des repères adaptés à ton cycle. Ce n’est pas un avis médical.';
  }
  if (status.isLate) {
    return `Un retard de ${status.daysLate} jour(s) est fréquent (stress, sommeil, voyage). Un test urinaire au réveil reste l’indicateur le plus simple si un rapport non protégé est possible. Consulte un professionnel si le retard dépasse 10 jours avec test négatif. Ce n’est pas un avis médical.`;
  }
  switch (status.currentPhase) {
    case 'menstruation':
      return 'Pendant les règles, privilégie chaleur, hydratation et repos. Une douleur qui t’empêche de vivre ta journée mérite un avis médical. Ce n’est pas un avis médical.';
    case 'fertile':
    case 'ovulation':
      return `Fenêtre fertile estimée jusqu’au ${status.fertileWindowEnd}. La glaire filante (type blanc d’œuf) est un meilleur signal que le calendrier seul. Ce n’est pas un avis médical.`;
    case 'luteal':
      return 'En phase lutéale, fatigue, seins sensibles ou SPM sont courants. Réduis café et sel si tu ballonnes, et note tes ressentis pour voir les tendances. Ce n’est pas un avis médical.';
    default:
      return `Jour ${status.currentCycleDay} d’un cycle estimé à ${status.expectedCycleLength} jours. Prochaines règles prévues vers le ${status.nextPeriodDate}. Ce n’est pas un avis médical.`;
  }
}

export async function generatePersonalizedAdvice(
  status: CalculatedCycleStatus
): Promise<{ text: string; source: 'gemini' | 'local' }> {
  const local = buildLocalAdvice(status);
  const apiKey = getApiKey();
  if (!apiKey) {
    return { text: local, source: 'local' };
  }

  try {
    // Chargement différé : le SDK ne se retrouve dans le bundle principal que si l’IA est réellement utilisée.
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const prompt = [
      'Tu es une assistante bienveillante (français, tutoiement) pour une appli de suivi de cycle.',
      'Tu n’es pas médecin. Termine toujours par : « Ce n’est pas un avis médical. »',
      'Réponds en 80 à 120 mots, concret, sans diagnostiquer.',
      `Phase: ${status.currentPhase} (${status.phaseLabel}).`,
      `Jour du cycle: ${status.currentCycleDay}/${status.expectedCycleLength}.`,
      `Fertilité estimée: ${status.fertilityLevel}.`,
      `Jours avant prochaines règles: ${status.daysUntilNextPeriod}.`,
      `Retard: ${status.isLate ? status.daysLate + ' jours' : 'non'}.`,
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = (response.text || '').trim();
    if (!text) {
      return { text: local, source: 'local' };
    }
    return { text, source: 'gemini' };
  } catch (err) {
    console.error('Gemini indisponible, repli local:', err);
    return { text: local, source: 'local' };
  }
}
