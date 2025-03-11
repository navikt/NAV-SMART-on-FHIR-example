import Client from "fhirclient/lib/Client";
import {DocumentReference} from "fhir/r4";
import {fhirclient} from "fhirclient/lib/types";
import {useMutation} from "@tanstack/react-query";
import DocumentReferenceWriteValidation from "./DocumentReferenceWriteValidation.tsx";
import ValidationTable from "./ValidationTable.tsx";
import {Severity, Validation} from "../utils/Validation.ts";
import {handleError} from "../utils/ErrorHandler.ts";
import {pdf} from "../mocks/base64pdf.ts";

export interface BinaryUploadWritableDocumentReferenceProps {
    readonly client: Client
}

export default function BinaryUploadWritableDocumentReference({client}: BinaryUploadWritableDocumentReferenceProps) {
    const {
        mutate,
        isPending,
        error,
        data,
        isSuccess,
    } = useMutation({
        mutationFn: async ({file}: { file: File }) => {
            const response = await client.create({
                resourceType: "Binary",
                contentType: file.type,
                data: file,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload binary: ${response.statusText}`);
            }

            return response;
        },
    });

    if (!data) {
        return (
            <div className="flex flex-col">
                <div className="flex gap-4 justify-center mb-5">
                    <div>
                        <button
                            className="border rounded bg-blue-900 p-4 py-2 text-white"
                            onClick={() => {
                                console.log('Button clicked, mutation starting...')
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

    if (isPending) {
        return <p>Uploading binary file and creating DocumentReference...</p>
    }

    if (error) {
        return (
            <ValidationTable validationTitle={'Writable DocumentReference validation'} validations={
                [new Validation(handleError('Error while creating new DocumentReference based on b64 encoded data', error), Severity.ERROR)]
            }/>
        )
    }

    const documentReferenceBinary = getDocRefWithBinary(client, data)

    return (
        <div className="flex flex-col">
            <div className="flex gap-4 justify-center mb-5">
                <div>
                    <DocumentReferenceWriteValidation client={client} documentReference={documentReferenceBinary}/>
                </div>
            </div>
        </div>
    );
}

function getDocRefWithBinary(client: Client, binaryData: undefined | fhirclient.CombinedFetchResult<fhirclient.FHIR.Resource> | fhirclient.FHIR.Resource): DocumentReference {
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
                    url: `Binary/${binaryData}`, // Using a binary reference to a file. Prereq is that the binary resource is created already.
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

    const blob = new Blob([byteArray], { type: "application/pdf" });
    return new File([blob], fileName, { type: "application/pdf" });
}