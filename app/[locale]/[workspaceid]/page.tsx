"use client"

import { ChatbotUIContext } from "@/context/context"
import { useContext } from "react"

export async function generateStaticParams() {
  // Hier können Sie die statischen Pfade generieren, wenn Sie sie benötigen
  // Für dynamische Routen können Sie ein leeres Array zurückgeben
  return []
}

export default function WorkspacePage() {
  const { selectedWorkspace } = useContext(ChatbotUIContext)

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="text-4xl">{selectedWorkspace?.name}</div>
    </div>
  )
}
