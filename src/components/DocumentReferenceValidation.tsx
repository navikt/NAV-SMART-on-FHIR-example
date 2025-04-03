import Client from 'fhirclient/lib/Client'
import { DocumentReference } from 'fhir/r4'
import { useQuery } from '@tanstack/react-query'
import { Severity, Validation } from '../utils/Validation.ts'
import { handleError } from '../utils/ErrorHandler.ts'
import ValidationTable from './validation-table/ValidationTable.tsx'
import { validateDocumentReference } from './validateDocRef.ts'

export interface DocumentReferenceValidationProps {
  readonly client: Client
}

export default function DocumentReferenceValidation({ client }: DocumentReferenceValidationProps) {
  const { error, data, isLoading } = useQuery({
    queryKey: ['documentReferenceValidation', client.encounter.id],
    queryFn: async () => {
      const documentReferences = await client.request<DocumentReference>(
        `DocumentReference?patient=${client.patient.id}&type=urn:oid:2.16.578.1.12.4.1.1.9602|J01-2`,
      )

      console.debug('✅ DocumentReference data fetched')
      Object.entries(documentReferences).forEach(([key, value]) => {
        console.debug(`ℹ️ DocumentReference.${key}:`, value)
      })

      return documentReferences
    },
  })

  const validations: Validation[] = data ? validateDocumentReference(data) : []

  return (
    <div className="basis-1/5">
      {isLoading && <p>Loading DocumentReference data...</p>}
      {error ? (
        <ValidationTable
          validations={[new Validation(handleError('Unable to fetch DocumentReference', error), Severity.ERROR)]}
        />
      ) : (
        <ValidationTable validations={validations} />
      )}
    </div>
  )
}
