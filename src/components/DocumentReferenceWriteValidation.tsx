import Client from "fhirclient/lib/Client";
import {useMutation, useQuery} from "@tanstack/react-query";
import {DocumentReference} from "fhir/r4";
import {Severity, Validation} from "../utils/Validation.ts";
import ValidationTable from "./ValidationTable.tsx";
import {handleError} from "../utils/ErrorHandler.ts";
import {validateDocumentReference} from "./validateDocRef.ts";
import {useState} from "react";

export interface DocumentReferenceWriteValidationProps {
    readonly client: Client
}

export default function DocumentReferenceWriteValidation({client}: DocumentReferenceWriteValidationProps) {
    // TODO Binary file upload to FHIR-server
    // trigger by calling mutateBinary({file})
    // const {
    //     mutate: mutateBinary,
    //     isPending: binaryIsPending,
    //     error: binaryUploadError,
    //     data: binaryData
    // } = useMutation({
    //     mutationFn: async ({file}: { file: File }) => {
    //         const response = await client.create({
    //             resourceType: "Binary",
    //             contentType: file.type,
    //             data: file,
    //         });
    //
    //         if (!response.ok) {
    //             throw new Error(`Failed to upload binary: ${response.statusText}`);
    //         }
    //
    //         return response;
    //     },
    // });
    //
    // // create DocumentReference with binaryReference
    // // Create DocumentReference pointing to the Binary resource
    // const documentReferenceBinary = getDocRefWithBinary(client, binaryData)

    // optionally, create DocumentReference with base64 data
    const documentReferenceWithB64Data = getDocRefWithB64Data(client)
    const [docRefId, setDocRefId] = useState<string | undefined>(undefined);
    const {
        mutate: mutateDocumentReference,
        isPending: createdDocumentReferenceIsPending,
        error: createdDocumentReferenceUploadError,
        isSuccess: isSuccessDocRef} = useMutation({
        mutationFn: async (documentReference: DocumentReference) => {
            console.log("Mutation function triggered with:", documentReference);
            const response = await client.create({
                resourceType: "DocumentReference",
                body: JSON.stringify(documentReference),
                headers: {
                    "Content-Type": "application/fhir+json",
                },
            });

            console.log("Response from create DocumentReference:", response);
            if (!response.id) {
                throw new Error(`Failed to create DocumentReference: ${response.statusText}`);
            }
            console.log("We have a response and we go past the error check - cool!")
            console.log("Inside mutation...DocumentReference created with ID:", response.id);
            return response;
        },
        onSuccess: (response) => {
            console.log("✅ DocumentReference created with ID:", response.id);
            setDocRefId(response.id);
        },
    });

    // user need to click button to start the mutation
    // then we use the createdDocumentReferenceId to fetch the DocumentReference - doesnt exist before mutation is done and we have the id

    // Fetch the DocumentReference after it has been created
    const {error, data, isLoading} = useQuery({
        queryKey: ['documentReferenceValidation', docRefId],
        queryFn: async () => {
            if(!docRefId) return

            console.debug('DocumentReference ID:', docRefId)
            const documentReferences = await client.request<DocumentReference>(`DocumentReference/${docRefId}`)

            console.debug('✅ DocumentReference data fetched')
            Object.entries(documentReferences).forEach(([key, value]) => {
                console.debug(`ℹ️ DocumentReference.${key}:`, value)
            })

            return documentReferences
        },
        enabled: !!docRefId,
    })

    const validations: Validation[] = data ? validateDocumentReference(data) : []

    // if mutation ikkje kalla, return knappen, etterpå evt disable knappen etc.

    // not using binary upload, using a b64 encoded string
    if (!docRefId) {
        return (
            <div className="flex flex-col">
                <div className="flex gap-4 justify-center mb-5">
                    <button
                        className="border rounded bg-blue-900 p-4 py-2 text-white"
                        onClick={() => {
                            console.log('Button clicked, mutation starting...')
                            mutateDocumentReference(documentReferenceWithB64Data)}
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
                <ValidationTable validationTitle={'Writable DocumentReference validation'} validations={
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
                <ValidationTable validationTitle={'Writable DocumentReference validation'} validations={
                    [new Validation(handleError('Unable to fetch Writable DocumentReference', error), Severity.ERROR)]
                }/>
            </div>
        )
    } else {
        return (
            <div className="basis-1/5">
                <ValidationTable validationTitle={'Writable DocumentReference validation'} validations={validations}/>
            </div>
        )
    }
}

// function getDocRefWithBinary(client: Client, binaryData: undefined | fhirclient.CombinedFetchResult<fhirclient.FHIR.Resource> | fhirclient.FHIR.Resource) {
//     return {
//         resourceType: "DocumentReference",
//         status: "current",
//         type: {
//             coding: [
//                 {
//                     system: "urn:oid:2.16.578.1.12.4.1.1.9602",
//                     code: "J01-2",
//                     display: "Sykmeldinger og trygdesaker",
//                 },
//             ],
//         },
//         subject: {
//             reference: `Patient/${client.patient.id}`,
//         },
// author: [
//     {
//         reference: `Practitioner/${client.user.fhirUser}`,
//     }
// ],
//         description: "My cool document description with a binary reference",
//         content: [
//             {
//                 attachment: {
//                     title: "My cool sykmelding document",
//                     language: "NO-nb",
//                     contentType: "application/pdf",
//                     url: `Binary/${binaryData}`, // Using a binary reference to a file. Prereq is that the binary resource is created already.
//                 },
//             },
//         ],
//             context: {
//                 encounter: [
//                     {
//                         reference: `Encounter/${client.encounter.id}`,
//                     },
//                 ],
//             },
//     };
// }

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
                    data: btoa("base64 PDF")
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