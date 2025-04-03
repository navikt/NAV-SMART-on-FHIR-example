import { Severity, Validation } from '../../utils/Validation.ts'
import Pill from './Pill.tsx'

const severityRank = {
  [Severity.ERROR]: 3,
  [Severity.WARNING]: 2,
  [Severity.INFO]: 1,
}

export interface ValidationTableProps {
  readonly validationTitle: string
  readonly validations: Validation[] | undefined
}

export default function ValidationTable({ validationTitle, validations }: ValidationTableProps) {
  if (!validations) return

  const sortedValidations = [...validations].sort((a, b) => severityRank[b.severity] - severityRank[a.severity])

  return (
    <div className="my-3">
      <h3 className="ml-4 mb-2 font-bold">{validationTitle}</h3>
      {validations.length > 0 ? (
        <table className="text-left w-full border-collapse table-auto">
          <thead className="uppercase bg-neutral-600 text-white">
            <tr className="border-2 border-white rounded">
              <th className="px-6 py-2 w-36 border-r-2 border-white">Severity</th>
              <th className="px-6 py-2">Validation results</th>
            </tr>
          </thead>
          <tbody>
            {sortedValidations.map((validation, index) => (
              <tr key={index} className="border-2 border-white even:bg-gray-100 odd:bg-gray-300 h-full align-top">
                <td className="px-6 py-2 w-36 border-r-2 border-white align-middle">
                  <div className="flex items-center justify-center h-full">
                    <Pill severity={validation.severity} />
                  </div>
                </td>
                <td className="px-6 py-3 flex items-center justify-start h-full">{validation.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h4 className="ml-5">✅ No issues to report for {validationTitle}</h4>
      )}
    </div>
  )
}
