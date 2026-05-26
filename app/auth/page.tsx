import { Suspense } from "react"
import AuthContent from "./AuthContent"

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <AuthContent />
    </Suspense>
  )
}

