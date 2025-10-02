import { createSSHClient } from "./ssh-client"

export async function sshExamples() {
  const client = createSSHClient()

  if (!client) {
    console.error("SSH client not configured")
    return
  }

  try {
    await client.connect()
    console.log("Connected to SSH server")

    const result = await client.executeCommand("ls -la")
    console.log("Command output:", result.stdout)
    console.log("Command stderr:", result.stderr)
    console.log("Exit code:", result.code)

    const files = await client.listDirectory("/home")
    console.log("Directory listing:", files)

    client.disconnect()
    console.log("Disconnected from SSH server")
  } catch (error) {
    console.error("SSH error:", error)
    client.disconnect()
  }
}

export async function executeRemoteCommand(command: string): Promise<string> {
  const client = createSSHClient()

  if (!client) {
    throw new Error("SSH client not configured")
  }

  try {
    await client.connect()

    const result = await client.executeCommand(command)

    client.disconnect()

    if (result.code !== 0) {
      throw new Error(`Command failed: ${result.stderr}`)
    }

    return result.stdout
  } catch (error) {
    client.disconnect()
    throw error
  }
}

export async function transferFile(
  localPath: string,
  remotePath: string,
  direction: "upload" | "download"
): Promise<void> {
  const client = createSSHClient()

  if (!client) {
    throw new Error("SSH client not configured")
  }

  try {
    await client.connect()

    if (direction === "upload") {
      await client.uploadFile(localPath, remotePath)
    } else {
      await client.downloadFile(remotePath, localPath)
    }

    client.disconnect()
  } catch (error) {
    client.disconnect()
    throw error
  }
}
