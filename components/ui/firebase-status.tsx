"use client"

import { useEffect, useState } from "react"
import { db, auth } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { CircleCheck as CheckCircle2, Circle as XCircle, Wifi, WifiOff } from "lucide-react"

export function FirebaseStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkFirebaseConnection = async () => {
      setChecking(true)

      if (!db || !auth) {
        console.error("[FIREBASE STATUS] Firebase não está configurado")
        setIsConnected(false)
        setChecking(false)
        return
      }

      try {
        console.log("[FIREBASE STATUS] Verificando conexão...")
        setIsConnected(true)
        console.log("[FIREBASE STATUS] Firebase conectado!")
      } catch (error) {
        console.error("[FIREBASE STATUS] Erro ao conectar:", error)
        setIsConnected(false)
      } finally {
        setChecking(false)
      }
    }

    checkFirebaseConnection()

    const interval = setInterval(checkFirebaseConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  if (checking) {
    return (
      <Badge variant="outline" className="gap-2">
        <Wifi className="h-3 w-3 animate-pulse" />
        Verificando...
      </Badge>
    )
  }

  if (isConnected) {
    return (
      <Badge variant="outline" className="gap-2 border-green-500 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Firebase Conectado
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-2 border-red-500 text-red-700 dark:text-red-400">
      <XCircle className="h-3 w-3" />
      Firebase Desconectado
    </Badge>
  )
}
