import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { CalculatedCycleStatus } from '../types';
import { generatePersonalizedAdvice, isGeminiConfigured } from '../services/gemini';

interface PersonalizedAdviceCardProps {
  status: CalculatedCycleStatus;
}

export const PersonalizedAdviceCard: React.FC<PersonalizedAdviceCardProps> = ({ status }) => {
  const [text, setText] = useState<string | null>(null);
  const [source, setSource] = useState<'gemini' | 'local' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const result = await generatePersonalizedAdvice(status);
      setText(result.text);
      setSource(result.source);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            Conseil du moment
          </h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Sur demande uniquement. Seule la phase du cycle est envoyée à Gemini — jamais tes notes intimes.
            {!isGeminiConfigured() && (
              <span> Sans clé <code className="text-[10px]">GEMINI_API_KEY</code>, le texte reste local.</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAsk}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Rédaction…' : 'Me conseiller'}
        </button>
      </div>
      {text && (
        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-rose-50/60 border border-rose-100 rounded-xl p-3">
          {text}
          {source && (
            <p className="mt-2 text-[10px] text-stone-400">
              Source : {source === 'gemini' ? 'Gemini' : 'guide local'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
