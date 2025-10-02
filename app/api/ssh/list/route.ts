import { NextResponse } from "next/server"
import { createSSHClient } from "@/lib/ssh-client"

export async function POST(request: Request) {
  try {
    const { remotePath } = await request.json()

    if (!remotePath) {
      return NextResponse.json(
        { error: "Caminho remoto é obrigatório" },
        { status: 400 }
      )
    }

    const sshClient = createSSHClient()

    if (!sshClient) {
      return NextResponse.json(
        { error: "Configuração SSH não encontrada" },
        { status: 503 }
      )
    }

    await sshClient.connect()

    const files = await sshClient.listDirectory(remotePath)

    sshClient.disconnect()

    return NextResponse.json({
      success: true,
      files,
    })
  } catch (error: any) {
    console.error("Error listing directory:", error)
    return NextResponse.json(
      {
        error: error.message || "Erro ao listar diretório",
      },
      { status: 500 }
    )
  }
}
