import Client from "fhirclient/lib/Client";
import {DocumentReference} from "fhir/r4";
import {useMutation} from "@tanstack/react-query";
import ValidationTable from "./ValidationTable.tsx";
import {Severity, Validation} from "../utils/Validation.ts";
import {handleError} from "../utils/ErrorHandler.ts";
import {pdf} from "../mocks/base64pdf.ts";
import {validateDocumentReference} from "./validateDocRef.ts";
import {useState} from "react";
import {useDocumentReferenceQuery} from "./useDocumentReferenceQuery.ts";

export interface BinaryUploadWritableDocumentReferenceProps {
    readonly client: Client
}

export default function BinaryUploadWritableDocumentReference({client}: BinaryUploadWritableDocumentReferenceProps) {
    const [docRefId, setDocRefId] = useState<string | undefined>(undefined);
    const validationTitle = 'Writable (binary) DocumentReference validation'
    const {
        mutate,
        isPending,
        error,
        data,
        isSuccess,
    } = useMutation({
        mutationFn: async ({file}: { file: File }) => {
            const binaryCreationResponse = await client.create({
                resourceType: "Binary",
                contentType: file.type,
                data: file,
            });
            if (!binaryCreationResponse.id) {
                console.log("Failed to create Binary, ", binaryCreationResponse);
                throw new Error(`Failed to create Binary: ${binaryCreationResponse.statusText}`);
            }

            const docRefCreationResponse = await client.create({
                resourceType: "DocumentReference",
                body: JSON.stringify(getDocRefWithBinary(client, binaryCreationResponse.id)),
                headers: {
                    "Content-Type": "application/fhir+json",
                },

            });

            if (!docRefCreationResponse.id) {
                console.log("Failed to create DocumentReference:", docRefCreationResponse);
                throw new Error(`Failed to create DocumentReference: ${docRefCreationResponse.statusText}`);
            }

            return docRefCreationResponse;
        },
        onSuccess(response) {
            console.log("✅ Binary uploaded and documentReference created with ID:", response.id);
            setDocRefId(response.id);
        }
    });

    const {
        error: fetchedDocRefError,
        data: fetchedDocRefData,
        isLoading: fetchedDocRefIsLoading
    } = useDocumentReferenceQuery(client, docRefId)

    if (isPending) {
        return <p>Uploading binary file and creating DocumentReference...</p>
    }

    if (error) {
        return (
            <ValidationTable validationTitle={validationTitle} validations={
                [new Validation(handleError('Error while creating new DocumentReference with a binary file reference', error), Severity.ERROR)]
            }/>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col">
                <div className="flex gap-4 justify-center mb-5">
                    <div>
                        <button
                            className="border rounded bg-blue-900 p-4 py-2 text-white"
                            onClick={() => {
                                mutate({file: base64ToFile(pdf, 'sykmelding.pdf')})}
                            }
                            disabled={isPending || isSuccess}
                        >
                            {isPending ? "Uploading..." : "Upload DocumentReference with a binary file reference"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data.id) {
        return (
            <ValidationTable validationTitle={validationTitle} validations={
                [new Validation(handleError('Error while creating new DocumentReference with a binary file reference, the binary id appears to be missing', error), Severity.ERROR)]
            }/>
        )
    }

    if (!fetchedDocRefData) {
        return (
            <div className="basis-1/5">
                <p>Loading DocumentReference data...</p>
            </div>
        )
    }
    if (fetchedDocRefIsLoading) {
        return (
            <div className="basis-1/5">
                <p>Loading DocumentReference data...</p>
            </div>
        )
    } else if (fetchedDocRefError) {
        return (
            <div className="basis-1/5">
                <ValidationTable validationTitle={validationTitle} validations={
                    [new Validation(handleError('Unable to fetch Writable DocumentReference', error), Severity.ERROR)]
                }/>
            </div>
        )
    } else {
        const validations: Validation[] = data ? validateDocumentReference(fetchedDocRefData) : []
        return (
            <div className="basis-1/5">
                <div>
                    <ValidationTable validationTitle={validationTitle}
                                     validations={validations}/>
                </div>
            </div>
        );

    }

}

function getDocRefWithBinary(client: Client, id: string): DocumentReference {
    return {
        resourceType: "DocumentReference",
        status: "current",
        id: 'aa66036d-b63c-4c5a-b3d5-b1d1f871337c',
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
        description: "My cool document description with a binary reference",
        content: [
            {
                attachment: {
                    title: "My cool sykmelding document",
                    language: "NO-nb",
                    url: `Binary/${id}`, // Using a binary reference to a file. Prereq is that the binary resource is created already.
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

function base64ToFile(base64String: string, fileName: string): File {
    // Remove the Base64 metadata (if present)
    const base64WithoutPrefix = base64String.split(",").pop() || "";

    const byteCharacters = atob(base64WithoutPrefix);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {type: "application/pdf"});
    return new File([blob], fileName, {type: "application/pdf"});
}