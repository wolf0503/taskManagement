"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/sign-in")
  }, [router])

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
