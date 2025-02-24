import Client from "fhirclient/lib/Client";
import {Practitioner} from "fhir/r4";
import {useQuery} from "@tanstack/react-query";
import {Severity, Validation} from "../utils/Validation.ts";
import {handleError} from "../utils/ErrorHandler.ts";
import ValidationTable from "./ValidationTable.tsx";

export interface PractitionerValidationProps {
    readonly client: Client
}

export default function PractitionerValidation({client}: PractitionerValidationProps) {
    const {error, data, isLoading} = useQuery({
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

    const validations: Validation[] = data ? validatePractitioner(data) : []

    return (
        <div className="basis-1/5">
            {isLoading && <p>Loading Practitioner data...</p>}
            {error ? (
                <div>
                    <h4>An error occurred when fetching Practitioner information.</h4>
                    <p>{handleError('Unable to fetch Practitioner', error)}</p>
                </div>
            ) : (
                <ValidationTable validationTitle={'Practitioner validation'} validations={validations}/>
            )}
        </div>
    )
}

function validatePractitioner(practitioner: Practitioner): Validation[] {
    const newValidations: Validation[] = []

    const meta = practitioner.meta

    if (!meta) {
        newValidations.push(new Validation('Practitioner object does not contain a meta reference', Severity.ERROR))
    } else if (!meta.profile) {
        newValidations.push(new Validation('The Practitioner Meta object does not contain a profile reference', Severity.ERROR))
    } else if (!meta.profile.includes('http://hl7.no/fhir/StructureDefinition/no-basis-Practitioner')) {
        newValidations.push(new Validation('The Practitioner must be of type no-basis-Practitioner', Severity.ERROR))
    }

    const hprSystemIdentifier = 'urn:oid:2.16.578.1.12.4.1.4.4'
    const herSystemIdentifier = 'urn:oid:2.16.578.1.12.4.1.2'

    const norwegianHPRIdentifierSystem = practitioner.identifier?.find((id) => id.system === hprSystemIdentifier)
    const norwegianHERIdentifierSystem = practitioner.identifier?.find((id) => id.system === herSystemIdentifier)

    if (!norwegianHPRIdentifierSystem) {
        newValidations.push(
            new Validation(
                `The Practitioner does not have a Norwegian Health Personnel Record number (HPR) from OID "${hprSystemIdentifier}"`,
                Severity.ERROR,
            ),
        )
    } else if (!norwegianHERIdentifierSystem) {
        newValidations.push(
            new Validation(
                `The Practitioner does not have a Norwegian HER-id from OID "${hprSystemIdentifier}"`,
                Severity.INFO,
            ),
        )
    }

    const practitionerName = practitioner.name
    if (!practitionerName || practitionerName.length === 0) {
        newValidations.push(new Validation(`The Practitioner does not have a name property`, Severity.ERROR))
    } else {
        const humanName = practitionerName[0]
        if (!humanName.family) {
            newValidations.push(new Validation('The Practitioner does not have a family name', Severity.ERROR))
        }
        if (!humanName.given || humanName.given.length === 0) {
            newValidations.push(new Validation('The Practitioner does not have given name(s)', Severity.ERROR))
        }
    }

    const practitionerTelecom = practitioner.telecom
    if (!practitionerTelecom || practitionerTelecom.length === 0) {
        newValidations.push(new Validation(`The Practitioner does not have a telecom property`, Severity.ERROR))
    } else {
        practitionerTelecom.forEach((telecom, index) => {
            if (!telecom.system || !['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'].includes(telecom.system)) {
                newValidations.push(new Validation(`The Practitioner content [${index}] does not have a telecom system: ${telecom.system ?? 'undefined'} `, Severity.WARNING))
            }
            if (!telecom.value) {
                newValidations.push(new Validation(`The Practitioner content [${index}] does not have a telecom value`, Severity.ERROR))
            }
            if (!telecom.use || !['home', 'work', 'temp', 'old', 'mobile'].includes(telecom.use)) {
                newValidations.push(new Validation(`The Practitioner content [${index}] does not have a telecom use: "${telecom.use ?? 'undefined'}"`, Severity.WARNING))
            }
        })
    }

    return newValidations
}