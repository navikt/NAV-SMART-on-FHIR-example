import {Severity, Validation} from "../utils/Validation.ts";
import clsx from "clsx";

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
    <div>
      {validations.length > 0 ?
        <table className="text-left w-full border-2 border-collapse">
          <thead className="text-neutral-200 uppercase bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200">
          <tr className="border-2 border-neutral-800">
            <th className="px-6 py-2">Severity</th>
            <th className="px-6 py-2">{validationTitle} results</th>
          </tr>
          </thead>
          <tbody>
          {sortedValidations.map((validation, index) => (
            <tr key={index} className="border-2 border-neutral-800">
              <td className={clsx(`px-6 py-4 text-blue-500`, {
                "text-red-500": validation.severity === Severity.ERROR,
                "text-yellow-400": validation.severity === Severity.WARNING
              })}>
                {validation.severity}
              </td>
              <td className="px-6 py-2 dark:text-neutral-200">{validation.message}</td>
            </tr>
          ))}
          </tbody>
        </table>
        :
        <h4>✅ No issues to report for {validationTitle}</h4>
      }
    </div>
  );
}