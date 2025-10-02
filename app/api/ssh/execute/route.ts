import { NextResponse } from "next/server"
import { createSSHClient } from "@/lib/ssh-client"

export async function POST(request: Request) {
  try {
    const { command } = await request.json()

    if (!command) {
      return NextResponse.json({ error: "Comando não fornecido" }, { status: 400 })
    }

    const sshClient = createSSHClient()

    if (!sshClient) {
      return NextResponse.json(
        { error: "Configuração SSH não encontrada" },
        { status: 503 }
      )
    }

    await sshClient.connect()

    const result = await sshClient.executeCommand(command)

    sshClient.disconnect()

    return NextResponse.json({
      success: true,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.code,
    })
  } catch (error: any) {
    console.error("Error executing SSH command:", error)
    return NextResponse.json(
      {
        error: error.message || "Erro ao executar comando SSH",
      },
      { status: 500 }
    )
  }
}
