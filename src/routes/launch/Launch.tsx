import { oauth2 as SMART } from 'fhirclient'
import { authOptions } from '../../fhir/FhirAuth.ts'
import { useQuery } from '@tanstack/react-query'

export default function Launch() {
  /**
   * STEP 1 - FHIR authorization
   *
   * This step takes the client configuration via authOptions and requests permission to launch
   * the SMART on FHIR framework for the given provider.
   *
   * When launch is called from within the EHR, the `iss` option **MUST NOT** be passed as it
   * is provided by the EHR. The `iss` will then be equal to the FHIR server resource used
   * for fetching data from the FHIR API.
   */
  const { error, isLoading } = useQuery({
    queryKey: ['smartAuth'],
    queryFn: async () => {
      // Ikke gjør noe med promise callback, denne siden skal bare omdirigere.
      await SMART.authorize(authOptions)
    },
  })

  return (
    <div id="launch-container">
      {error && <p>{error.message}</p>}
      {isLoading ? <p>Loading...</p> : <p>Starter SMART launch sekvens, denne siden vil omdirigere automatisk.</p>}
    </div>
  )
}
