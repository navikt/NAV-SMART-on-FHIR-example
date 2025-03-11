import Client from "fhirclient/lib/Client";
import {DocumentReference} from "fhir/r4";
import {pdf} from "../mocks/base64pdf.ts";
import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {Severity, Validation} from "../utils/Validation.ts";
import {validateDocumentReference} from "./validateDocRef.ts";
import ValidationTable from "./ValidationTable.tsx";
import {handleError} from "../utils/ErrorHandler.ts";
import {useDocumentReferenceQuery} from "./useDocumentReferenceQuery.ts";


export interface B64WritableDocumentReferenceProps {
    readonly client: Client
}

export default function B64WritableDocumentReference({client}: B64WritableDocumentReferenceProps) {
    const [docRefId, setDocRefId] = useState<string | undefined>(undefined);
    const validationTitle = 'Writable (b64) DocumentReference validation'
    const {
        mutate: mutateDocumentReference,
        isPending: createdDocumentReferenceIsPending,
        error: createdDocumentReferenceUploadError,
        isSuccess: isSuccessDocRef
    } = useMutation({
        mutationFn: async (documentReference: DocumentReference) => {
            console.log("Mutation function triggered with:", documentReference);
            const response = await client.create({
                resourceType: "DocumentReference",
                body: JSON.stringify(documentReference),
                headers: {
                    "Content-Type": "application/fhir+json",
                },
            });

            if (!response.id) {
                throw new Error(`Failed to create DocumentReference: ${response.statusText}`);
            }
            return response;
        },
        onSuccess: (response) => {
            console.log("✅ DocumentReference created with ID:", response.id);
            setDocRefId(response.id);
        },
    });

    const {error, data, isLoading} = useDocumentReferenceQuery(client, docRefId)
    const validations: Validation[] = data ? validateDocumentReference(data) : []

    // create document reference if it does not exist
    if (!docRefId) {
        const documentReference = getDocRefWithB64Data(client);
        return (
            <div className="flex flex-col">
                <div className="flex gap-4 justify-center mb-5">
                    <button
                        className="border rounded bg-blue-900 p-4 py-2 text-white"
                        onClick={() => {
                            mutateDocumentReference(documentReference)}
                        }
                        disabled={createdDocumentReferenceIsPending || isSuccessDocRef}
                    >
                        {createdDocumentReferenceIsPending ? "Uploading..." : "Upload DocumentReference (b64)"}
                    </button>
                </div>
            </div>
        );
    }

    if (createdDocumentReferenceUploadError) {
        return (
            <div className="basis-1/5">
                <ValidationTable validationTitle={validationTitle} validations={
                    [new Validation(handleError('Error while creating new DocumentReference based on b64 encoded data', error), Severity.ERROR)]
                }/>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="basis-1/5">
                <p>Loading DocumentReference data...</p>
            </div>
        )
    } else if (error) {
        return (
            <div className="basis-1/5">
                <ValidationTable validationTitle={validationTitle} validations={
                    [new Validation(handleError('Unable to fetch Writable DocumentReference', error), Severity.ERROR)]
                }/>
            </div>
        )
    } else {
        return (
            <div className="basis-1/5">
                        <div>
                            <ValidationTable validationTitle={validationTitle}
                                             validations={validations}/>
                        </div>
            </div>
        )
    }
}

function getDocRefWithB64Data(client: Client): DocumentReference {
    return {
        resourceType: "DocumentReference",
        status: "current",
        type: {
            coding: [
                {
                    system: "urn:oid:2.16.578.1.12.4.1.1.9602",
                    code: "J01-2",
                    display: "Sykmeldinger og trygdesaker",
                },
            ],
        },
        subject: {
            reference: `Patient/${client.patient.id}`,
        },
        author: [
            {
                reference: `Practitioner/${client.user.fhirUser}`,
            }
        ],
        description: "My cool document description with a b64 data",
        content: [
            {
                attachment: {
                    title: "My cool sykmelding document",
                    language: "NO-nb",
                    contentType: "application/pdf",
                    data: btoa(pdf)
                },
            },
        ],
        context: {
            encounter: [
                {
                    reference: `Encounter/${client.encounter.id}`,
                },
            ],
        },
    };
}