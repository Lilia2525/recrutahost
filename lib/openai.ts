import OpenAI from 'openai'
import { AIFormAnalysis, AICallAnalysis, AIExtractResult, FormQuestion, Candidate, JobOffer, AIRulesConfig } from './types'

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ─────────────────────────────────────────────────────────────
// 1. EXTRACT CV / EMAIL DATA
// ─────────────────────────────────────────────────────────────
export async function extractCVData(
  emailBody: string,
  cvText?: string
): Promise<AIExtractResult> {
  const prompt = `Eres un experto en selección de personal para hostelería.
Analiza el siguiente email (y CV si se proporciona) de un candidato y extrae los datos relevantes.

EMAIL DEL CANDIDATO:
${emailBody}

${cvText ? `TEXTO DEL CV:\n${cvText}` : ''}

INSTRUCCIONES:
Extrae la información disponible y responde ÚNICAMENTE en formato JSON válido:
{
  "full_name": "Nombre completo del candidato",
  "email": "email si aparece",
  "phone": "teléfono si aparece",
  "position": "puesto al que aplica si se menciona",
  "experience_summary": "resumen de experiencia en 1-2 frases",
  "languages": ["idiomas que menciona"],
  "summary": "resumen ejecutivo en 1-2 frases para el reclutador"
}
Si no encuentras algún campo, usa null o array vacío según corresponda.`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })

  try {
    return JSON.parse(response.choices[0].message.content ?? '{}') as AIExtractResult
  } catch {
    return {}
  }
}

// ─────────────────────────────────────────────────────────────
// 2. ANALYZE FORM RESPONSES
// ─────────────────────────────────────────────────────────────
export async function analyzeFormResponses(params: {
  candidate: Candidate
  jobOffer: JobOffer
  questions: FormQuestion[]
  responses: Record<string, string>
  cvText?: string
  rulesConfig?: AIRulesConfig
}): Promise<AIFormAnalysis> {
  const { candidate, jobOffer, questions, responses, cvText, rulesConfig } = params

  const formattedQA = questions
    .map((q) => {
      const answer = responses[q.id] ?? '(sin respuesta)'
      return `- Pregunta (peso: ${q.ai_weight}/5): ${q.question_text}\n  Respuesta: ${answer}${q.ai_ideal_answer ? `\n  Respuesta ideal: ${q.ai_ideal_answer}` : ''}`
    })
    .join('\n\n')

  const rulesText = rulesConfig
    ? `
REGLAS DE EVALUACIÓN:
- Experiencia mínima: ${rulesConfig.min_experience_months ?? 'no especificada'} meses
- Disponibilidad requerida: ${rulesConfig.required_availability?.join(', ') ?? 'cualquiera'}
- Idiomas requeridos: ${rulesConfig.required_languages?.join(', ') ?? 'español'}
- Umbral de descarte automático: ${rulesConfig.auto_discard_threshold ?? 30} puntos
- Umbral de cualificación automática: ${rulesConfig.auto_qualify_threshold ?? 70} puntos
- Reglas adicionales: ${rulesConfig.custom_rules?.join('; ') ?? 'ninguna'}`
    : ''

  const prompt = `Eres un experto en selección de personal para hostelería.

PUESTO: ${jobOffer.title}
DESCRIPCIÓN: ${jobOffer.description ?? 'No especificada'}
REQUISITOS: ${jobOffer.requirements ?? 'No especificados'}
${rulesText}

CANDIDATO: ${candidate.full_name}

RESPUESTAS DEL FORMULARIO DE PRECUALIFICACIÓN:
${formattedQA}

${cvText ? `TEXTO DEL CV:\n${cvText}` : ''}

INSTRUCCIONES:
1. Evalúa cada respuesta del 0-100 según los criterios y su peso (peso 5 = muy importante)
2. Calcula una puntuación global ponderada
3. Identifica banderas rojas (red flags) y puntos positivos (green flags)
4. Da una recomendación: AVANZAR / REVISAR / DESCARTAR
5. Responde ÚNICAMENTE en formato JSON válido:
{
  "score": 75,
  "breakdown": [
    {"question": "texto de la pregunta", "score": 80, "weight": 3, "reasoning": "explicación breve"}
  ],
  "red_flags": ["bandera roja 1", "bandera roja 2"],
  "green_flags": ["punto positivo 1", "punto positivo 2"],
  "recommendation": "AVANZAR",
  "summary": "Resumen en 2-3 frases para Dori, en español, lenguaje claro y directo"
}`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  try {
    return JSON.parse(response.choices[0].message.content ?? '{}') as AIFormAnalysis
  } catch {
    return {
      score: 0,
      breakdown: [],
      red_flags: ['Error al analizar respuestas'],
      green_flags: [],
      recommendation: 'REVISAR',
      summary: 'Error al procesar el análisis de IA. Por favor, revisa manualmente.',
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3. ANALYZE CALL TRANSCRIPTION
// ─────────────────────────────────────────────────────────────
export async function analyzeCallTranscription(params: {
  candidate: Candidate
  jobOffer: JobOffer
  transcription: string
  interviewerNotes?: string
  previousScore?: number
  previousSummary?: string
}): Promise<AICallAnalysis> {
  const {
    candidate,
    jobOffer,
    transcription,
    interviewerNotes,
    previousScore,
    previousSummary,
  } = params

  const prompt = `Eres un experto en selección de personal para hostelería.

PUESTO: ${jobOffer.title}

CONTEXTO PREVIO DEL CANDIDATO:
- Nombre: ${candidate.full_name}
- Puntuación formulario: ${previousScore ?? 'No disponible'}
- Resumen previo: ${previousSummary ?? 'No disponible'}

TRANSCRIPCIÓN DE LA LLAMADA:
${transcription}

${interviewerNotes ? `NOTAS DE LA ENTREVISTADORA:\n${interviewerNotes}` : ''}

INSTRUCCIONES:
1. Evalúa la actitud, motivación, experiencia y adecuación al puesto
2. Identifica puntos fuertes y preocupaciones
3. Combina tu análisis con la puntuación previa del formulario (si disponible)
4. Da una recomendación final: DIA_DE_PRUEBA / DESCARTAR
5. Responde ÚNICAMENTE en formato JSON válido:
{
  "score": 82,
  "strengths": ["punto fuerte 1", "punto fuerte 2"],
  "concerns": ["preocupación 1", "preocupación 2"],
  "recommendation": "DIA_DE_PRUEBA",
  "summary": "Resumen en 2-3 frases para Dori, en español, lenguaje claro y directo"
}`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  try {
    return JSON.parse(response.choices[0].message.content ?? '{}') as AICallAnalysis
  } catch {
    return {
      score: 0,
      strengths: [],
      concerns: ['Error al analizar la llamada'],
      recommendation: 'DESCARTAR',
      summary: 'Error al procesar el análisis de IA. Por favor, revisa manualmente.',
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 4. ANALYZE TALLY CANDIDATE (simplified - no job_offer needed)
// ─────────────────────────────────────────────────────────────
export async function analyzeTallyCandidate(params: {
  candidateName: string
  position: string
  formSummary: string
}): Promise<AIFormAnalysis> {
  const { candidateName, position, formSummary } = params

  const positionLabels: Record<string, string> = {
    camarero_sala: 'Camarero/a de Sala',
    ayudante_cocina: 'Ayudante de Cocina',
    camarero_piso: 'Camarero/a de Piso / Limpiador/a',
    otro: 'Puesto general hostelería',
  }

  const prompt = `Eres un experto en selección de personal para hostelería.
Evalúa este candidato para un restaurante familiar de comida casera asturiana y mediterránea, con más de 50 años de trayectoria, gran volumen y alta rotación de clientes.

CANDIDATO: ${candidateName}
PUESTO: ${positionLabels[position] || position}

RESPUESTAS DEL FORMULARIO:
${formSummary}

CRITERIOS DE EVALUACIÓN:
- Experiencia relevante en hostelería (muy importante)
- Disponibilidad para incorporación inmediata (importante)
- Permiso de trabajo en España (obligatorio - sin él = descarte)
- Habilidades específicas del puesto
- Actitud y trabajo en equipo

INSTRUCCIONES:
1. Evalúa al candidato del 0-100
2. Si no tiene permiso de trabajo → puntuación < 30 y DESCARTAR
3. Identifica banderas rojas y puntos positivos
4. Recomendación: AVANZAR (>=60) / REVISAR (30-59) / DESCARTAR (<30)
5. Responde ÚNICAMENTE en JSON válido:
{
  "score": 75,
  "breakdown": [],
  "red_flags": ["bandera roja 1"],
  "green_flags": ["punto positivo 1"],
  "recommendation": "AVANZAR",
  "summary": "Resumen en 2-3 frases claro y directo para la reclutadora"
}`

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })
    return JSON.parse(response.choices[0].message.content ?? '{}') as AIFormAnalysis
  } catch {
    return {
      score: 50,
      breakdown: [],
      red_flags: [],
      green_flags: [],
      recommendation: 'REVISAR',
      summary: 'No se pudo analizar con IA. Revisa manualmente.',
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 5. TRANSCRIBE AUDIO (Whisper)
// ─────────────────────────────────────────────────────────────
export async function transcribeAudio(audioFile: File): Promise<string> {
  const transcription = await getOpenAI().audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'es',
  })
  return transcription.text
}

export { getOpenAI }
