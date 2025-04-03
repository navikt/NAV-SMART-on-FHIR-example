import ErrorPage from './ErrorPage.tsx'
import SmartConfigValidation from '../components/SmartConfigValidation.tsx'
import IdTokenValidation from '../components/IdTokenValidation.tsx'
import PatientValidation from '../components/PatientValidation.tsx'
import EncounterValidation from '../components/EncounterValidation.tsx'
import { Link } from 'react-router-dom'
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
        <p className="text-3xl ml-8 pb-5">Nav SMART on FHIR validation</p>
        {smart.isLoading && <p>Initializing SMART client...</p>}
        {smart.client && (
          <div className="flex flex-col">
            <br />
            <SmartConfigValidation client={smart.client} />
            <br />
            <IdTokenValidation client={smart.client} />
            <br />
            <PatientValidation client={smart.client} />
            <br />
            <PractitionerValidation client={smart.client} />
            <br />
            <EncounterValidation client={smart.client} />
            <br />
            <ConditionValidation client={smart.client} />
            <br />
            <DocumentReferenceValidation client={smart.client} />
            <br />
            <BinaryUploadWritableDocumentReference client={smart.client} />
            <br />
            <B64WritableDocumentReference client={smart.client} />
          </div>
        )}
        {smart.error && <ErrorPage error={smart.error.message} />}
      </div>
    </Page>
  )
}

export default Validation
