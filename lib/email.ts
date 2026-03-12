import { Resend } from 'resend'
import { interpolateTemplate } from './utils'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = 'RecrutaHost <noreply@recrutahost.app>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// ─── SEND FORM LINK EMAIL ─────────────────────────────────────
export async function sendFormLinkEmail(params: {
  candidateEmail: string
  candidateName: string
  jobTitle: string
  restaurantName: string
  formUrl: string
  templateHtml?: string
  templateSubject?: string
}): Promise<boolean> {
  const defaultSubject = 'Recibimos tu candidatura — Siguiente paso'
  const defaultHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2 style="color: #FFD700;">Hola ${params.candidateName},</h2>
  <p>Gracias por tu interés en el puesto de <strong>${params.jobTitle}</strong> en <strong>${params.restaurantName}</strong>.</p>
  <p>Hemos recibido tu candidatura y nos gustaría conocerte mejor. Para continuar con el proceso, te pedimos que rellenes este breve formulario:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${params.formUrl}" style="background:#FFD700;color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
      Rellenar formulario →
    </a>
  </p>
  <p>El formulario solo te llevará unos minutos.</p>
  <p>¡Mucha suerte!</p>
  <p>El equipo de <strong>${params.restaurantName}</strong></p>
</div>
  `

  const subject = params.templateSubject
    ? interpolateTemplate(params.templateSubject, {
        nombre_candidato: params.candidateName,
        puesto: params.jobTitle,
        nombre_restaurante: params.restaurantName,
      })
    : defaultSubject

  const html = params.templateHtml
    ? interpolateTemplate(params.templateHtml, {
        nombre_candidato: params.candidateName,
        puesto: params.jobTitle,
        nombre_restaurante: params.restaurantName,
        link_formulario: params.formUrl,
      })
    : defaultHtml

  return sendEmail({ to: params.candidateEmail, subject, html })
}

// ─── SEND DISCARD EMAIL ───────────────────────────────────────
export async function sendDiscardEmail(params: {
  candidateEmail: string
  candidateName: string
  jobTitle: string
  restaurantName: string
  templateHtml?: string
  templateSubject?: string
}): Promise<boolean> {
  const defaultSubject = 'Actualización sobre tu candidatura'
  const defaultHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2>Hola ${params.candidateName},</h2>
  <p>Gracias por tu interés en el puesto de <strong>${params.jobTitle}</strong> en <strong>${params.restaurantName}</strong>.</p>
  <p>Tras revisar tu candidatura, lamentamos informarte que en esta ocasión no vamos a continuar con el proceso de selección.</p>
  <p>Te animamos a seguir buscando y te deseamos mucho éxito.</p>
  <p>Un saludo,</p>
  <p>El equipo de <strong>${params.restaurantName}</strong></p>
</div>
  `

  const vars = {
    nombre_candidato: params.candidateName,
    puesto: params.jobTitle,
    nombre_restaurante: params.restaurantName,
  }

  return sendEmail({
    to: params.candidateEmail,
    subject: params.templateSubject ? interpolateTemplate(params.templateSubject, vars) : defaultSubject,
    html: params.templateHtml ? interpolateTemplate(params.templateHtml, vars) : defaultHtml,
  })
}

// ─── SEND TRIAL DAY EMAIL ─────────────────────────────────────
export async function sendTrialDayEmail(params: {
  candidateEmail: string
  candidateName: string
  jobTitle: string
  restaurantName: string
  templateHtml?: string
  templateSubject?: string
}): Promise<boolean> {
  const defaultSubject = `¡Estás seleccionado/a! — Día de prueba en ${params.restaurantName}`
  const defaultHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2 style="color: #22c55e;">¡Enhorabuena, ${params.candidateName}!</h2>
  <p>Nos has causado muy buena impresión y queremos invitarte a realizar un <strong>día de prueba</strong> en <strong>${params.restaurantName}</strong>.</p>
  <p>Te contactaremos para confirmar la fecha y los detalles.</p>
  <p>¡Te esperamos!</p>
  <p>El equipo de <strong>${params.restaurantName}</strong></p>
</div>
  `

  const vars = {
    nombre_candidato: params.candidateName,
    puesto: params.jobTitle,
    nombre_restaurante: params.restaurantName,
  }

  return sendEmail({
    to: params.candidateEmail,
    subject: params.templateSubject ? interpolateTemplate(params.templateSubject, vars) : defaultSubject,
    html: params.templateHtml ? interpolateTemplate(params.templateHtml, vars) : defaultHtml,
  })
}
