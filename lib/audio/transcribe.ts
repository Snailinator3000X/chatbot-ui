import { useRef, useEffect } from "react"

export async function transcribeSpeech(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append("file", audioBlob, "audio.webm")

  try {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`${response.status} ${JSON.stringify(data)}`)
    }

    return data.text
  } catch (error) {
    console.error("Transcription error:", error)
    throw error
  }
}

export const useAudioTranscription = () => {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream)
        mediaRecorder.current.start()

        mediaRecorder.current.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data)
          }
        }

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm"
          })
          const transcript = await transcribeSpeech(audioBlob)
          console.log("Transcript:", transcript)
        }
      })
      .catch(error => {
        console.error("Error:", error)
      })
  }, [])

  return {
    startRecording: () => {
      mediaRecorder.current?.start()
    },
    stopRecording: () => {
      mediaRecorder.current?.stop()
    }
  }
}
