import { ReactElement, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { oauth2 as SMART } from 'fhirclient'
import Client from 'fhirclient/lib/Client'

function FhirTester(): ReactElement {
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
      <h2 className="text-xl mb-4">FHIR Resource Tester</h2>
      {client == null ? <div>Initializing client</div> : <ResourceTester client={client} />}
      {error && <div>Error initializing client: {error.message}</div>}
    </div>
  )
}

function ResourceTester({ client }: { client: Client }) {
  const [resource, setResource] = useState<string | null>(null)
  const { isPending, data, error, mutate } = useMutation({
    mutationKey: ['resource', resource],
    mutationFn: async () => {
      if (resource == null) {
        console.debug(`Resource is not set, nothing to fetch`)
        return null
      }

      console.debug(`ℹ Fetching resource ${resource}`)
      const result = await client.request(resource)
      console.debug(`✅ ${resource} data fetched`)
      Object.entries(result).forEach(([key, value]) => {
        console.debug(`ℹ️ ${resource}.${key}:`, value)
      })

      return result
    },
  })

  useEffect(() => {
    // Put the FHIR client on the window object for debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).fhirClient = client
  }, [client])

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          console.debug(`🔍 Fetching resource ${resource}`)
          mutate()
        }}
        className="flex gap-3"
      >
        <input
          className="dark:bg-gray-800 dark:text-white p-2 grow"
          type="text"
          placeholder="Resource ID"
          value={resource ?? ''}
          onChange={(event) => {
            setResource(event.target.value)
          }}
        />
        <div className="flex gap-1">
          <button type="submit" className="border p-2 border-green-500">
            Fetch resource
          </button>
          <button
            type="button"
            className="border p-2"
            onClick={() => {
              setResource(client.user.fhirUser)
              requestAnimationFrame(() => mutate())
            }}
          >
            Fetch Practitioner from context
          </button>
          <button
            type="button"
            className="border p-2"
            onClick={() => {
              setResource(`Patient/${client.patient.id}`)
              requestAnimationFrame(() => mutate())
            }}
          >
            Fetch Patient from context
          </button>
        </div>
      </form>
      {error && (
        <div>
          Unable to fetch {resource}: {error.message}
        </div>
      )}
      {isPending && <div>Fetching {resource}...</div>}
      {data && (
        <div className="mt-8">
          <h3>Successfully fetched {resource}</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      {data == null && <div className="mt-8">No resource fetched yet</div>}
    </div>
  )
}

export default FhirTester
