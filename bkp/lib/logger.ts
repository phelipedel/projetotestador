import fs from "fs"
import path from "path"

export interface LogEntry {
  timestamp: string
  level: "INFO" | "WARN" | "ERROR"
  action: string
  userId?: string
  details: any
  ip?: string
}

class Logger {
  private logDir: string

  constructor() {
    this.logDir = path.join(process.cwd(), "logs")
    this.ensureLogDirectory()
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private getLogFileName(): string {
    const today = new Date().toISOString().split("T")[0]
    return path.join(this.logDir, `${today}.txt`)
  }

  private formatLogEntry(entry: LogEntry): string {
    return `[${entry.timestamp}] ${entry.level} - ${entry.action} - User: ${entry.userId || "anonymous"} - IP: ${entry.ip || "unknown"} - Details: ${JSON.stringify(entry.details)}\n`
  }

  log(level: LogEntry["level"], action: string, details: any, userId?: string, ip?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      userId,
      details,
      ip,
    }

    const logLine = this.formatLogEntry(entry)
    const logFile = this.getLogFileName()

    try {
      fs.appendFileSync(logFile, logLine)
    } catch (error) {
      console.error("Failed to write to log file:", error)
    }
  }

  info(action: string, details: any, userId?: string, ip?: string) {
    this.log("INFO", action, details, userId, ip)
  }

  warn(action: string, details: any, userId?: string, ip?: string) {
    this.log("WARN", action, details, userId, ip)
  }

  error(action: string, details: any, userId?: string, ip?: string) {
    this.log("ERROR", action, details, userId, ip)
  }
}

export const logger = new Logger()
