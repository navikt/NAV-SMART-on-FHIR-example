export enum Severity {
  INFO = "ℹ️",
  WARNING = "⚠️",
  ERROR = "🚫"
}

export class SoFValidation {
  message: string;
  severity: Severity;

  constructor(message: string, severity: Severity) {
    this.message = message;
    this.severity = severity;
  }

}