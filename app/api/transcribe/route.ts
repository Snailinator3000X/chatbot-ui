import { NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk"

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  console.log("GROQ_API_KEY:", apiKey) // Remove this line in production

  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set" },
      { status: 500 }
    )
  }

  const client = new Groq({
    apiKey: apiKey
  })

  try {
    const formData = await req.formData()
    const audioBlob = formData.get("file") as Blob

    if (!audioBlob) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Audio file is empty" },
        { status: 400 }
      )
    }

    console.log("Audio file size:", buffer.length, "bytes")

    const file = new File([buffer], "audio.wav", { type: "audio/wav" })

    const response = await client.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3"
    })

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error("Transcription error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// Add this line to explicitly allow POST requests
export const config = {
  api: {
    bodyParser: false
  }
}
