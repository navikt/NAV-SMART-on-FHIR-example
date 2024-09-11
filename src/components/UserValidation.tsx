import Client from "fhirclient/lib/Client";
import {Severity, Validation} from "../utils/Validation.ts";
import {useEffect, useState} from "react";
import ValidationTable from "./ValidationTable.tsx";
import {Practitioner} from "fhir/r4";
import {handleError} from "../utils/ErrorHandler.ts";

export interface UserValidationProps {
  readonly client: Client | undefined;
}

/**
 * UserValidation will extract the logged-in user from the FHIR client
 * and validate the results accordingly. The user is set based on the
 * id_token claims fhirUser _or_ profile as requested by the scopes.
 *
 * @see https://github.com/smart-on-fhir/client-js/blob/master/src/Client.ts#L576-L593
 *
 * @param client - The FHIR client instance
 */
export default function UserValidation({client}: UserValidationProps) {
  const [validations, setValidations] = useState<Validation[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!client) return;

    function validateUser(fhirPractitioner: Practitioner) {
      console.debug("✅ Practitioner data fetched");
      Object.entries(fhirPractitioner).forEach(([key, value]) => {
        console.debug(`ℹ️ Practitioner.${key}:`, value);
      });

      const newValidations: Validation[] = [];

      /**
       * @see https://www.ehelse.no/teknisk-dokumentasjon/oid-identifikatorserier-i-helse-og-omsorgstjenesten#nasjonale-identifikatorserier-for-personer
       */
      const norwegianHealthcareProfessionalSystem = fhirPractitioner.identifier?.find(id => id.system === "urn:oid:2.16.578.1.12.4.1.4.4");

      if (!norwegianHealthcareProfessionalSystem) {
        newValidations.push(new Validation(`The Practitioner does not have a norwegian healthcare professional ID number (HPR-number) with URN OID "urn:oid:2.16.578.1.12.4.1.4.4"`, Severity.ERROR));
      }

      setValidations(newValidations);
    }

    if (client.user.fhirUser && client.getUserType() === "Practitioner") {
      client.request<Practitioner>(client.user.fhirUser).then(fhirPractitioner => {
        validateUser(fhirPractitioner);
      }).catch(err => setError(handleError("Unable to fetch Practitioner", err)));
    } else {
      setError(`Logged-in user is not set or not the correct type "Practitioner". FhirUser claim: ${client.user.fhirUser}. ResourceType: ${client.user.resourceType}`);
    }
  }, [client]);

  return (
    <div className="basis-1/5">
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