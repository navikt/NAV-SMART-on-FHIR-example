import { ReactElement, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { oauth2 as SMART } from 'fhirclient'
import Client from 'fhirclient/lib/Client'

function FhirCreateTester(): ReactElement {
  const { data: client, error } = useQuery({
    queryKey: ['smartClient'],
    queryFn: () => {
      return SMART.ready()
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
  })

  return (
    <div>
      <h2 className="text-xl mb-4">FHIR creator</h2>
      {client == null ? <div>Initializing client</div> : <ResourceTester client={client} />}
      {error && <div>Error initializing client: {error.message}</div>}
    </div>
  )
}

function ResourceTester({ client }: { client: Client }) {
  useGlobalClient(client)

  const [resource, setResource] = useState<string | null>(null)
  const { isPending, data, error, mutate } = useMutation({
    mutationKey: ['resource', resource],
    mutationFn: async () => {
      if (resource == null) {
        console.debug(`Resource is not set, nothing to fetch`)
        return null
      }

      console.debug(`ℹ Fetching resource ${resource}`)

      const result = await client.create(JSON.parse(resource))
      console.debug(`✅ ${resource} data fetched`)
      Object.entries(result).forEach(([key, value]) => {
        console.debug(`ℹ️ ${resource}.${key}:`, value)
      })

      return result
    },
  })

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          console.debug(`🔍 Fetching resource ${resource}`)
          mutate()
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex gap-1">
          <button type="submit" className="border p-2 border-green-500">
            Create resource
          </button>
        </div>
        <textarea
          className="bg-gray-100 p-2 grow"
          placeholder="FHIR resource JSON"
          rows={25}
          value={resource ?? ''}
          onChange={(event) => {
            setResource(event.target.value)
          }}
        />
      </form>
      {error && (
        <div>
          Unable to create {resource}: {error.message}
        </div>
      )}
      {isPending && <div className="mt-8">Creating {resource}...</div>}
      {data && (
        <div className="mt-8">
          <div className="mb-2 flex justify-between">
            <h3 className="break-all">Successfully fetched {resource}</h3>
            <button
              className="underline shrink-0 px-2 ml-4 hover:bg-gray-500"
              onClick={() => {
                const element = document.getElementById('resource-json')
                if (element == null) return

                const selection = window.getSelection()
                if (selection == null) return

                const range = document.createRange()
                range.selectNodeContents(element)
                selection.removeAllRanges()
                selection.addRange(range)
              }}
            >
              Mark all
            </button>
          </div>
          <pre id="resource-json" className="p-2 border overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      {data == null && <div className="mt-8">No resource created yet</div>}
    </div>
  )
}

function useGlobalClient(client: Client): void {
  useEffect(() => {
    // Put the FHIR client on the window object for debugging
    const global = window as unknown as { smart: Client }

    global.smart = client

    console.debug("ℹ Set 'smart' on window object for debugging")
  }, [client])
}

export default FhirCreateTester
