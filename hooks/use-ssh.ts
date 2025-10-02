"use client"

import { useState } from "react"

export interface SSHCommandResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

export function useSSH() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeCommand = async (command: string): Promise<SSHCommandResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ssh/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao executar comando")
      }

      return {
        stdout: data.stdout,
        stderr: data.stderr,
        exitCode: data.exitCode,
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (localPath: string, remotePath: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ssh/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ localPath, remotePath }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar arquivo")
      }

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (remotePath: string, localPath: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ssh/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remotePath, localPath }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao baixar arquivo")
      }

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const listDirectory = async (remotePath: string): Promise<any[] | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ssh/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remotePath }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao listar diretório")
      }

      return data.files
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    executeCommand,
    uploadFile,
    downloadFile,
    listDirectory,
  }
}
