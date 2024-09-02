import Client from "fhirclient/lib/Client";
import {Severity, Validation} from "../utils/Validation.ts";
import {useEffect, useState} from "react";
import ValidationTable from "./ValidationTable.tsx";
import {Practitioner} from "fhir/r4";
import {handleError} from "../utils/ErrorHandler.ts";

export interface UserValidationProps {
  readonly client: Client | undefined;
}

export default function UserValidation({client}: UserValidationProps) {
  const [validations, setValidations] = useState<Validation[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!client) return;

    if (client.user.fhirUser && client.user.resourceType === "Practitioner") {
      client.request<Practitioner>(client.user.fhirUser).then(fhirPractitioner => {
        console.debug("✅ Practitioner data fetched");
        Object.entries(fhirPractitioner).forEach(([key, value]) => {
          console.debug(`ℹ️ Practitioner.${key}: ${value}`);
        });

        const newValidations: Validation[] = [];

        const norwegianHealthcareProfessionalSystem = fhirPractitioner.identifier?.find(id => id.system === "urn:oid:2.16.578.1.12.4.1.4.4");

        if (!norwegianHealthcareProfessionalSystem) {
          newValidations.push(new Validation(`The Practitioner does not have a norwegian healthcare professional ID number (HPR-number) with URN OID "urn:oid:2.16.578.1.12.4.1.4.4"`, Severity.ERROR));
        }

        setValidations(newValidations);
      }).catch(err => setError(handleError("Unable to fetch Practitioner", err)));
    } else {
      setError(`Logged in user is not set or not the correct type "Practitioner". FhirUser claim: ${client.user.fhirUser}. ResourceType: ${client.user.resourceType}`);
    }
  }, [client]);

  return (
    <div>
      {error ?
        <div>
          <h4>An error occurred when fetching User information.</h4>
          <p>{error}</p>
        </div>
        :
        <ValidationTable validationTitle={"User validation"}
                         validations={validations}/>
      }
    </div>
  );
}