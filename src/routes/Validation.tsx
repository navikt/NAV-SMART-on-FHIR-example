import ErrorPage from './ErrorPage.tsx'
import SmartConfigValidation from '../components/SmartConfigValidation.tsx'
import IdTokenValidation from '../components/IdTokenValidation.tsx'
import PatientValidation from '../components/PatientValidation.tsx'
import EncounterValidation from '../components/EncounterValidation.tsx'
import PractitionerValidation from '../components/PractitionerValidation.tsx'
import ConditionValidation from '../components/ConditionValidation.tsx'
import DocumentReferenceValidation from '../components/DocumentReferenceValidation.tsx'
import BinaryUploadWritableDocumentReference from '../components/BinaryUploadWritableDocumentReference.tsx'
import B64WritableDocumentReference from '../components/B64WritableDocumentReference.tsx'
import Page from '../components/layout/Page.tsx'
import { useSmart } from '../smart/use-smart.ts'
import RefetchSidebar from '../components/main-validation/RefetchSidebar.tsx'

function Validation() {
  const smart = useSmart()

  return (
    <Page sidebar={<RefetchSidebar />}>
      <div className="mt-4">
        <div className="ml-8 mb-4 pb-5">
          <h1 className="text-4xl ">Nav SMART on FHIR validation</h1>
          <p className="text-sm">
            Collection of resource fetches and writes to verify if a FHIR server is compliant with the FHIR
            specification
          </p>
        </div>
        {smart.isLoading && <p>Initializing SMART client...</p>}
        <div>
          <h2 className="ml-8 font-bold text-2xl">General FHIR Resource Validation</h2>
          {smart.client && (
            <div className="flex flex-col gap-3">
              <SmartConfigValidation client={smart.client} />
              <IdTokenValidation client={smart.client} />
              <PatientValidation client={smart.client} />
              <PractitionerValidation client={smart.client} />
              <EncounterValidation client={smart.client} />
            </div>
          )}
        </div>
        <div className="mt-8">
          <h2 className="ml-8 font-bold text-2xl">{`"Ny sykmelding" Resource Validation`}</h2>
          {smart.client && (
            <div className="flex flex-col gap-3">
              <ConditionValidation client={smart.client} />
              <DocumentReferenceValidation client={smart.client} />
              <BinaryUploadWritableDocumentReference client={smart.client} />
              <B64WritableDocumentReference client={smart.client} />
            </div>
          )}
        </div>
        {smart.error && <ErrorPage error={smart.error.message} />}
      </div>
    </Page>
  )
}

export default Validation
