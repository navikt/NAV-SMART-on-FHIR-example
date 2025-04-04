import Client from 'fhirclient/lib/Client'
import { DocumentReference, Bundle } from 'fhir/r4'
import { useQuery } from '@tanstack/react-query'
import { Severity, Validation } from '../utils/Validation.ts'
import { handleError } from '../utils/ErrorHandler.ts'
import ValidationTable from './validation-table/ValidationTable.tsx'
import { validateDocumentReference } from './validateDocRef.ts'
import Spinner from './spinner/Spinner.tsx'

export interface DocumentReferenceValidationProps {
  readonly client: Client
}

export default function DocumentReferenceValidation({ client }: DocumentReferenceValidationProps) {
  const { error, data, isLoading } = useQuery({
    queryKey: ['documentReferenceValidation', client.encounter.id],
    queryFn: async (): Promise<DocumentReference | null> => {
      const bundle = await client.request<Bundle<DocumentReference>>(
        `DocumentReference?patient=${client.patient.id}&type=urn:oid:2.16.578.1.12.4.1.1.9602|J01-2`,
      )

      console.debug('✅ DocumentReference data fetched')

      if (bundle == null || !('resourceType' in bundle) || bundle.resourceType !== 'Bundle') {
        console.warn(`❌ Expected Bundle, got ${bundle.resourceType}`)
        return null
      }

      if (bundle.entry == null || bundle.entry.length === 0) {
        console.debug(`❌ No DocumentReferences with token "type=urn:oid:2.16.578.1.12.4.1.1.9602|J01-2" found`)
        return null
      }

      const documentReferences = bundle.entry.map((it) => it.resource)
      documentReferences.forEach((docRef, index) => {
        if (docRef == null) {
          console.warn(`❌ ℹ️ DocumentReference[${index}] was null for some reason`)
          return
        }

        Object.entries(docRef).forEach(([key, value]) => {
          console.debug(`ℹ️ DocumentReference[${index}].${key}:`, value)
        })
      })

      const firstRelevantDocumentReference: DocumentReference | undefined = documentReferences.find(
        (it) => it != null && it.resourceType === 'DocumentReference',
      )

      return firstRelevantDocumentReference ?? null
    },
  })

  const validations: Validation[] = validateDocumentReference(data ?? null)

  return (
    <div>
      {isLoading && <Spinner text="Loading DocumentReference data..." />}
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
