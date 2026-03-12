'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Square, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn, formatDuration } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CallRecorderProps {
  candidateId: string
  jobOfferId: string
  onRecordingComplete: (transcription: string, audioUrl: string, duration: number) => void
}

export function CallRecorder({ candidateId, jobOfferId, onRecordingComplete }: CallRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'uploading'>('idle')
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start(1000)
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      toast.error('No se pudo acceder al micrófono')
    }
  }

  async function stopRecording() {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (timerRef.current) clearInterval(timerRef.current)

    const duration = seconds

    setState('uploading')

    // Wait for final chunks
    await new Promise((resolve) => setTimeout(resolve, 300))

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const file = new File([blob], `call-${Date.now()}.webm`, { type: 'audio/webm' })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('candidateId', candidateId)
      formData.append('jobOfferId', jobOfferId)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      onRecordingComplete(data.transcription ?? '', data.url, duration)
      setState('idle')
      setSeconds(0)
      toast.success('Grabación guardada')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir la grabación'
      toast.error(msg)
      setState('idle')
    }
  }

  return (
    <div className="flex items-center gap-4">
      {state === 'idle' && (
        <Button variant="secondary" size="sm" icon={<Mic size={15} />} onClick={startRecording}>
          Iniciar grabación
        </Button>
      )}

      {state === 'recording' && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#ef4444]">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <MicOff size={16} />
            <span className="text-sm font-mono font-medium">{formatDuration(seconds)}</span>
          </div>
          <Button variant="danger" size="sm" icon={<Square size={13} />} onClick={stopRecording}>
            Detener
          </Button>
        </div>
      )}

      {state === 'uploading' && (
        <div className="flex items-center gap-2 text-[#a0a0a0] text-sm">
          <Loader2 size={15} className="animate-spin" />
          <span>Transcribiendo con IA…</span>
        </div>
      )}
    </div>
  )
}
