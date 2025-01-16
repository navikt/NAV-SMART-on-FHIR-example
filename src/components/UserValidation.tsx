import Client from 'fhirclient/lib/Client'
import { Severity, Validation } from '../utils/Validation.ts'
import ValidationTable from './ValidationTable.tsx'
import { Practitioner } from 'fhir/r4'
import { handleError } from '../utils/ErrorHandler.ts'
import { useQuery } from '@tanstack/react-query'

export interface UserValidationProps {
  readonly client: Client
}

/**
 * UserValidation will extract the logged-in user from the FHIR client
 * and validate the results accordingly. The user is set based on the
 * id_token claims fhirUser _or_ profile as requested by the scopes.
 *
 * @see https://github.com/smart-on-fhir/client-js/blob/master/src/Client.ts#L576-L593
 *
 * @param client - The FHIR client instance
 */
export default function UserValidation({ client }: UserValidationProps) {
  const { error, data, isLoading } = useQuery({
    queryKey: ['encounterValidation', client.user.fhirUser],
    queryFn: async () => {
      if (client.user.fhirUser && client.getUserType() === 'Practitioner') {
        const practitioner = await client.request<Practitioner>(client.user.fhirUser)
        console.debug('✅ Practitioner data fetched')
        Object.entries(practitioner).forEach(([key, value]) => {
          console.debug(`ℹ️ Practitioner.${key}:`, value)
        })
        return practitioner
      } else {
        throw new Error(
          `Logged-in user is not set or not the correct type "Practitioner". FhirUser claim: ${client.user.fhirUser}. ResourceType: ${client.user.resourceType}`,
        )
      }
    },
  })

  const validations = data ? validateUser(data) : []

  return (
    <div className="basis-1/5">
      {isLoading && <p>Loading User data...</p>}
      {error ? (
        <div>
          <h4>An error occurred when fetching User information.</h4>
          <p>{handleError('Unable to fetch Practitioner', error)}</p>
        </div>
      ) : (
        <ValidationTable validationTitle={'User validation'} validations={validations} />
      )}
    </div>
  )
}

function validateUser(fhirPractitioner: Practitioner) {
  const newValidations: Validation[] = []

  /**
   * @see https://www.ehelse.no/teknisk-dokumentasjon/oid-identifikatorserier-i-helse-og-omsorgstjenesten#nasjonale-identifikatorserier-for-personer
   */
  const norwegianHealthcareProfessionalSystem = fhirPractitioner.identifier?.find(
    (id) => id.system === 'urn:oid:2.16.578.1.12.4.1.4.4',
  )

  if (!norwegianHealthcareProfessionalSystem) {
    newValidations.push(
      new Validation(
        `The Practitioner does not have a norwegian healthcare professional ID number (HPR-number) with URN OID "urn:oid:2.16.578.1.12.4.1.4.4"`,
        Severity.ERROR,
      ),
    )
  }

  return newValidations
}
