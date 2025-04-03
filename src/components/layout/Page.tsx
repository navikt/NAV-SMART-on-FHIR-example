import { PropsWithChildren, ReactNode } from 'react'

type Props = {
  sidebar: ReactNode
}

const Page = ({ children, sidebar }: PropsWithChildren<Props>) => {
  return (
    <div className="flex flex-row">
      <div className="grow m-4">{children}</div>
      <div className="max-w-64 m-4 mt-0 pt-6 border-l border-l-gray-300 pl-4">{sidebar}</div>
    </div>
  )
}

export default Page
