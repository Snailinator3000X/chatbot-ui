import { NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk"
import { Blob, File } from "buffer"

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audioBlob") as unknown as File

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const blob = new Blob([buffer])
    const file = new File([blob], "audio.wav", { type: "audio/wav" })

    const response = await client.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3"
    })

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error("Transcription error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Transcription failed", details: errorMessage },
      { status: 500 }
    )
  }
}
