# RecrutaHost

ATS (Applicant Tracking System) para hostelería y restauración. Gestiona candidatos, ofertas de empleo, formularios personalizados y llamadas con análisis de IA.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth + Storage)
- **OpenAI** GPT-4o + Whisper
- **Resend** (emails transaccionales)
- **Tailwind CSS v4**

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Edita .env.local con tus claves

# 3. Base de datos
# Ejecuta supabase/migrations/001_initial_schema.sql en tu proyecto Supabase

# 4. Servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) |
| `OPENAI_API_KEY` | Clave de API de OpenAI |
| `RESEND_API_KEY` | Clave de API de Resend |
| `RESEND_FROM_EMAIL` | Dirección de envío verificada en Resend |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (para links en emails) |

## Estructura

```
app/
  dashboard/          # Panel principal con métricas
  candidatos/         # Kanban de candidatos
  ofertas/            # Gestión de ofertas de empleo
  configuracion/      # Configuración del restaurante, emails, formulario e IA
  aplicar/[ofertaId]/ # Formulario público de candidatura
  api/                # Route handlers (REST API)
components/
  ui/                 # Componentes base (Button, Badge, Modal…)
  layout/             # Sidebar, Header, DashboardShell
  kanban/             # Tablero y columnas Kanban
  candidates/         # Detalle y tarjeta de candidato
hooks/                # useAudioRecorder, useCandidates, useKanban
lib/                  # supabase, openai, email, types, utils, constants
supabase/migrations/  # Schema SQL
```

## Flujo de candidatos

1. **Recepción** — Email entrante (`/api/webhooks/email-inbound`) o formulario público (`/aplicar/[ofertaId]`)
2. **Formulario IA** — Se envía link de formulario; al completarlo, GPT-4o evalúa respuestas
3. **Llamada** — Se graba llamada telefónica, Whisper transcribe, GPT-4o analiza
4. **Decisión** — IA recomienda `DIA_DE_PRUEBA` o `DESCARTAR`; el reclutador puede mover manualmente

## Webhooks

- **Email entrante**: `POST /api/webhooks/email-inbound` — compatible con Resend Inbound y Postmark
