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
    readonly documentReference: DocumentReference
}

export default function DocumentReferenceWriteValidation({client, documentReference}: DocumentReferenceWriteValidationProps) {
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

    // create document reference if it does not exist
    if (!docRefId) {
        return (
            <div className="flex flex-col">
                <div className="flex gap-4 justify-center mb-5">
                    <button
                        className="border rounded bg-blue-900 p-4 py-2 text-white"
                        onClick={() => {
                            console.log('Button clicked, mutation starting...')
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