import ErrorPage from './ErrorPage.tsx'
import SmartConfigValidation from '../components/SmartConfigValidation.tsx'
import IdTokenValidation from '../components/IdTokenValidation.tsx'
import PatientValidation from '../components/PatientValidation.tsx'
import EncounterValidation from '../components/EncounterValidation.tsx'
import {useQuery} from '@tanstack/react-query'
import {oauth2 as SMART} from 'fhirclient'
import {Link} from 'react-router-dom'
import PractitionerValidation from "../components/PractitionerValidation.tsx";
import ConditionValidation from "../components/ConditionValidation.tsx";

function App() {
    const {
        data: client,
        error,
        isLoading,
    } = useQuery({
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
            <p className="text-3xl text-center pb-5">NAV SMART on FHIR compliance test</p>
            {isLoading && <p>Initializing SMART client...</p>}
            {client && (
                <div className="flex flex-col">
                    <div className="flex gap-4 justify-center mb-5">
                        <button
                            className="border rounded bg-blue-900 p-4 py-2 text-white"
                            onClick={async () => {
                                const webMedPractitionerId = client?.getState('tokenResponse.practitioner')
                                const practitioner = await client?.request(`Practitioner/${webMedPractitionerId}`)
                                Object.entries(practitioner).forEach(([key, value]) => {
                                    console.debug(`ℹ️ (manual) Practitioner.${key}:`, JSON.stringify(value))
                                })
                            }}
                        >
                            Fetch WebMed Practitioner
                        </button>
                        <button
                            className="border rounded bg-blue-900 p-4 py-2 text-white"
                            onClick={async () => {
                                const practitioner = await client?.request(`Patient/${client.patient.id}`)
                                Object.entries(practitioner).forEach(([key, value]) => {
                                    console.debug(`ℹ️ (manual) Practitioner.${key}:`, JSON.stringify(value))
                                })
                            }}
                        >
                            Fetch Patient
                        </button>
                        <button
                            className="border rounded bg-blue-900 p-4 py-2 text-white"
                            onClick={async () => {
                                const encounter = await client?.request(`Encounter/${client.encounter.id}`)
                                Object.entries(encounter).forEach(([key, value]) => {
                                    console.debug(`ℹ️ (manual) Encounter.${key}:`, JSON.stringify(value))
                                })
                            }}
                        >
                            Fetch Encounter
                        </button>
                    </div>
                    <br/>
                    <SmartConfigValidation client={client}/>
                    <br/>
                    <IdTokenValidation client={client}/>
                    <br/>
                    <PatientValidation client={client}/>
                    <br/>
                    <PractitionerValidation client={client}/>
                    <br/>
                    <EncounterValidation client={client}/>
                    <br/>
                    <ConditionValidation client={client}/>
                </div>
            )}
            {error && <ErrorPage error={error.message}/>}
            <div className="flex flex-col gap-3 my-8">
                <Link className="underline" to="/fhir-tester">
                    Go to FHIR Resource Tester
                </Link>
                <Link className="underline" to="/fhir-creator">
                    Go to FHIR Creation Centre
                </Link>
            </div>
        </div>
    )
}

export default App
