import { NextResponse } from "next/server"
import { createSSHClient } from "@/lib/ssh-client"

export async function POST(request: Request) {
  try {
    const { localPath, remotePath } = await request.json()

    if (!localPath || !remotePath) {
      return NextResponse.json(
        { error: "Caminhos local e remoto são obrigatórios" },
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

    await sshClient.uploadFile(localPath, remotePath)

    sshClient.disconnect()

    return NextResponse.json({
      success: true,
      message: "Arquivo enviado com sucesso",
    })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        error: error.message || "Erro ao enviar arquivo",
      },
      { status: 500 }
    )
  }
}
