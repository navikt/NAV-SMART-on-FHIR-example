import Client from "fhirclient/lib/Client";
import {DocumentReference} from "fhir/r4";
import DocumentReferenceWriteValidation from "./DocumentReferenceWriteValidation.tsx";
import {pdf} from "../mocks/base64pdf.ts";


export interface B64WritableDocumentReferenceProps {
    readonly client: Client
}

export default function B64WritableDocumentReference({client}: B64WritableDocumentReferenceProps) {

    return (
        <div className="flex flex-col">
            <div className="flex gap-4 justify-center mb-5">
                <div>
                    <DocumentReferenceWriteValidation client={client} documentReference={getDocRefWithB64Data(client)}/>
                </div>
            </div>
        </div>
    )
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