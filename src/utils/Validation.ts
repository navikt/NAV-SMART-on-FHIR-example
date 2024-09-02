export enum Severity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR"
}

export class Validation {
  message: string;
  severity: Severity;

  constructor(message: string, severity: Severity) {
    this.message = message;
    this.severity = severity;
  }

}