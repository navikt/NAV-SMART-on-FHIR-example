import {Severity, Validation} from "../utils/Validation.ts";

export interface ValidationTableProps {
  readonly validationTitle: string;
  readonly validations: Validation[] | undefined;
}

export default function ValidationTable({validationTitle, validations}: ValidationTableProps) {
  if (!validations) return;

  const severityRank = {
    [Severity.ERROR]: 3,
    [Severity.WARNING]: 2,
    [Severity.INFO]: 1
  };

  const sortedValidations = [...validations].sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);

  return (
    <table>
      <caption>{validationTitle}</caption>
      <thead>
      <tr>
        <th>Severity</th>
        <th>Message</th>
      </tr>
      </thead>
      <tbody>
      {sortedValidations.map((validation, index) => (
        <tr key={index}>
          <td>{validation.severity}</td>
          <td>{validation.message}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}