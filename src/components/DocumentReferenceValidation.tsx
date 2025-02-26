import Client from "fhirclient/lib/Client";
import {DocumentReference} from "fhir/r4";
import {useQuery} from "@tanstack/react-query";
import {Severity, Validation} from "../utils/Validation.ts";
import {handleError} from "../utils/ErrorHandler.ts";
import ValidationTable from "./ValidationTable.tsx";

export interface DocumentReferenceValidationProps {
    readonly client: Client
}

export default function DocumentReferenceValidation({client}: DocumentReferenceValidationProps) {
    const {error, data, isLoading} = useQuery({
        queryKey: ['documentReferenceValidation', client.encounter.id],
        queryFn: async () => {
            const documentReferences = await client.request<DocumentReference>(`DocumentReference?patient=${client.patient.id}&type=urn:oid:2.16.578.1.12.4.1.1.9602|J01-2`)

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
                <ValidationTable validationTitle={'DocumentReference validation'} validations={
                    [new Validation(handleError('Unable to fetch DocumentReference', error), Severity.ERROR)]
                }/>
            ) : (
                <ValidationTable validationTitle={'DocumentReference validation'} validations={validations}/>
            )}
        </div>
    )
}

function validateDocumentReference(documentReference: DocumentReference): Validation[] {
    const newValidations: Validation[] = []

    if (documentReference.resourceType !== 'DocumentReference') {
        newValidations.push(new Validation('Resource is not of type DocumentReference', Severity.ERROR))
    }

    if (!documentReference.status) {
        newValidations.push(new Validation('DocumentReference does not contain a status object', Severity.ERROR))
    } else if (documentReference.status !== 'current') {
        newValidations.push(new Validation('DocumentReference status must be current', Severity.ERROR))
    }


    if (!documentReference.type) {
        newValidations.push(new Validation('DocumentReference does not contain a type object', Severity.ERROR))
    } else if (!documentReference.type.coding) {
        newValidations.push(new Validation('DocumentReference type object does not contain a coding object', Severity.ERROR))
    } else {
        documentReference.type.coding.forEach(coding => {
            if (!coding.display) {
                newValidations.push(new Validation('DocumentReference type coding object does not contain a display object', Severity.ERROR))
            }
            if (!coding.system || !coding.code) {
                newValidations.push(new Validation(`DocumentReference type coding object does not contain a system or code object. System was: ${coding.system} and code was: ${coding.code}`, Severity.ERROR))
            } else if (coding.system !== 'urn:oid:2.16.578.1.12.4.1.1.9602' || coding.code !== 'J01-2') {
                newValidations.push(new Validation(`DocumentReference type coding system must be "urn:oid:2.16.578.1.12.4.1.1.9602" and code must be ""J01-2", but was "${coding.system}" and "${coding.code}"`, Severity.ERROR))
            }
        })
    }


    if (!documentReference.subject) {
        newValidations.push(new Validation('DocumentReference does not contain a subject object', Severity.ERROR))
    } else {
        if (!documentReference.subject.reference) {
            newValidations.push(new Validation('DocumentReference subject object does not contain a reference', Severity.ERROR))
        }
    }

    if (!documentReference.author) {
        newValidations.push(new Validation('DocumentReference does not contain an author object', Severity.ERROR))
    } else {
        documentReference.author.forEach(author => {
            if (!author.reference) {
                newValidations.push(new Validation('DocumentReference author object does not contain a reference to the Practitioner who authorized the document', Severity.ERROR))
            }
        })
    }
    if (!documentReference.content) {
        newValidations.push(new Validation('DocumentReference does not contain a content object', Severity.ERROR))
    } else {
        documentReference.content.forEach(content => {
            if (!content.attachment) {
                newValidations.push(new Validation('DocumentReference content object does not contain an attachment object', Severity.ERROR))
            } else {
                if (!content.attachment.contentType) {
                    newValidations.push(new Validation('DocumentReference content attachment object does not contain a contentType object, should be "application/pdf"', Severity.ERROR))
                }
                if (!content.attachment.title) {
                    newValidations.push(new Validation('DocumentReference content attachment object does not contain a title', Severity.ERROR))
                }
                if (!content.attachment.data) {
                    newValidations.push(new Validation('DocumentReference content attachment object does not contain data, should be "base64 PDF"', Severity.ERROR))
                }
                if (!content.attachment.language) {
                    newValidations.push(new Validation('DocumentReference content attachment object does not contain a language object', Severity.ERROR))
                }
            }
        })
    }

    if (!documentReference.context) {
        newValidations.push(new Validation('DocumentReference does not contain a context object', Severity.ERROR))
    } else if (!documentReference.context.encounter) {
        newValidations.push(new Validation('DocumentReference context object does not contain an encounter object', Severity.ERROR))
    }

    return newValidations
}