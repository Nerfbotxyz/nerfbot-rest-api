export default class Logger {
  constructor(private className: string) {}

  private get prepend() {
    return `[${this.className}]`
  }

  log(...messages: any[]) {
    this.info(...messages)
  }

  info(...messages: any[]) {
    console.info(`[INFO]${this.prepend}`, ...messages)
  }

  error(...messages: any[]) {
    console.error(`[ERROR]${this.prepend}`, ...messages)
  }

  warn(...messages: any[]) {
    console.warn(`[WARN]${this.prepend}`, ...messages)
  }
}
