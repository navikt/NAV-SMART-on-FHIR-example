import { Severity } from '../../utils/Validation.ts'
import clsx from 'clsx'

type Props = {
  severity: Severity
}

const Pill = ({ severity }: Props) => {
  return (
    <div
      className={clsx(`h-7 w-22 p-1 rounded border flex justify-center items-center`, {
        ' text-blue-800 bg-blue-200': severity === Severity.INFO,
        'text-red-700 bg-red-200': severity === Severity.ERROR,
        'text-yellow-700 bg-yellow-200': severity === Severity.WARNING,
      })}
    >
      {severity}
    </div>
  )
}

export default Pill
