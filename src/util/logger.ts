const logLevels: { [key: string]: number } = {
  error: 1,
  warn: 2,
  info: 3,
  verbose: 4,
  debug: 5
}

export default class Logger {
  private level = logLevels[process.env.LOG_LEVEL || 'info']

  constructor(private className: string) {}

  private get prepend() {
    return `[${this.className}]`
  }

  log(...messages: any[]) {
    this.info(...messages)
  }

  info(...messages: any[]) {
    if (this.level >= logLevels.info) {
      console.info(`[INFO]${this.prepend}`, ...messages)
    }
  }

  error(...messages: any[]) {
    if (this.level >= logLevels.error) {
      console.error(`[ERROR]${this.prepend}`, ...messages)
    }
  }

  warn(...messages: any[]) {
    if (this.level >= logLevels.warn) {
      console.warn(`[WARN]${this.prepend}`, ...messages)
    }
  }
}
