import { Client, ConnectConfig } from "ssh2"

export interface SSHConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: Buffer | string
}

export interface SSHCommandResult {
  stdout: string
  stderr: string
  code: number | null
}

export class SSHClient {
  private client: Client | null = null
  private config: SSHConfig

  constructor(config: SSHConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client()

      const connectConfig: ConnectConfig = {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
      }

      if (this.config.password) {
        connectConfig.password = this.config.password
      }

      if (this.config.privateKey) {
        connectConfig.privateKey = this.config.privateKey
      }

      this.client
        .on("ready", () => {
          resolve()
        })
        .on("error", (err) => {
          reject(err)
        })
        .connect(connectConfig)
    })
  }

  async executeCommand(command: string): Promise<SSHCommandResult> {
    if (!this.client) {
      throw new Error("SSH client not connected. Call connect() first.")
    }

    return new Promise((resolve, reject) => {
      this.client!.exec(command, (err, stream) => {
        if (err) {
          reject(err)
          return
        }

        let stdout = ""
        let stderr = ""

        stream
          .on("close", (code: number) => {
            resolve({
              stdout,
              stderr,
              code,
            })
          })
          .on("data", (data: Buffer) => {
            stdout += data.toString()
          })
          .stderr.on("data", (data: Buffer) => {
            stderr += data.toString()
          })
      })
    })
  }

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    if (!this.client) {
      throw new Error("SSH client not connected. Call connect() first.")
    }

    return new Promise((resolve, reject) => {
      this.client!.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        sftp.fastPut(localPath, remotePath, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
  }

  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    if (!this.client) {
      throw new Error("SSH client not connected. Call connect() first.")
    }

    return new Promise((resolve, reject) => {
      this.client!.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        sftp.fastGet(remotePath, localPath, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
  }

  async listDirectory(remotePath: string): Promise<any[]> {
    if (!this.client) {
      throw new Error("SSH client not connected. Call connect() first.")
    }

    return new Promise((resolve, reject) => {
      this.client!.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        sftp.readdir(remotePath, (err, list) => {
          if (err) {
            reject(err)
          } else {
            resolve(list)
          }
        })
      })
    })
  }

  disconnect(): void {
    if (this.client) {
      this.client.end()
      this.client = null
    }
  }

  isConnected(): boolean {
    return this.client !== null
  }
}

export function createSSHClient(): SSHClient | null {
  const host = process.env.SSH_HOST
  const port = parseInt(process.env.SSH_PORT || "22")
  const username = process.env.SSH_USER
  const password = process.env.SSH_PASSWORD
  const privateKeyPath = process.env.SSH_PRIVATE_KEY_PATH

  if (!host || !username) {
    return null
  }

  const config: SSHConfig = {
    host,
    port,
    username,
  }

  if (password) {
    config.password = password
  }

  if (privateKeyPath) {
    try {
      const fs = require("fs")
      config.privateKey = fs.readFileSync(privateKeyPath)
    } catch (error) {
      console.error("Error reading SSH private key:", error)
    }
  }

  return new SSHClient(config)
}
