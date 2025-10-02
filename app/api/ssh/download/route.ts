import { NextResponse } from "next/server"
import { createSSHClient } from "@/lib/ssh-client"

export async function POST(request: Request) {
  try {
    const { remotePath, localPath } = await request.json()

    if (!remotePath || !localPath) {
      return NextResponse.json(
        { error: "Caminhos remoto e local são obrigatórios" },
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

    await sshClient.downloadFile(remotePath, localPath)

    sshClient.disconnect()

    return NextResponse.json({
      success: true,
      message: "Arquivo baixado com sucesso",
    })
  } catch (error: any) {
    console.error("Error downloading file:", error)
    return NextResponse.json(
      {
        error: error.message || "Erro ao baixar arquivo",
      },
      { status: 500 }
    )
  }
}
