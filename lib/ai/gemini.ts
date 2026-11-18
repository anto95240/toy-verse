/**
 * lib/ai/gemini.ts
 * Client partagé pour l'API Google Gemini
 */

export async function callGemini(prompt: string, imageBase64?: string, retries = 3): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY manquante");
    return null;
  }

  // Meilleur modèle Flash gratuit recommandé pour les nouveaux projets (2026)
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [{ text: prompt }];

  if (imageBase64) {
    // Nettoyage éventuel du préfixe data:image/...;base64,
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    parts.push({
      inline_data: {
        mime_type: "image/jpeg", // Fallback générique
        data: base64Data
      }
    });
  }

  const payload = {
    contents: [
      {
        parts: parts
      }
    ],
    generationConfig: {
      temperature: 0.2, // Faible température pour du JSON déterministe
      response_mime_type: "application/json"
    }
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`[Gemini API] Erreur réseau (essai ${attempt + 1}/${retries}):`, res.status, err);
        
        if (res.status === 503 || res.status === 429 || res.status >= 500) {
          if (attempt < retries - 1) {
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); // Backoff progressif
            continue;
          }
        }
        return null;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error("[Gemini API] Réponse vide ou format inattendu", data);
        return null;
      }

      return text;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error(`[Gemini API] Timeout dépassé (30s) (essai ${attempt + 1}/${retries})`);
      } else {
        console.error(`[Gemini API] Exception (essai ${attempt + 1}/${retries}):`, err);
      }
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * Extrait et parse un JSON depuis une chaîne (même si encadré par ```json)
 */
export function parseGeminiJSON<T>(raw: string): T | null {
  try {
    // Supprimer les potentiels blocs markdown
    let cleaned = raw.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("[Gemini API] Erreur de parsing JSON:", err, "Raw text:", raw);
    return null;
  }
}
