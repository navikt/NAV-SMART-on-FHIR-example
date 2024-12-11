import Client from "fhirclient/lib/Client";
import {Severity, Validation} from "../utils/Validation.ts";
import {useEffect, useState} from "react";
import ValidationTable from "./ValidationTable.tsx";
import {Patient} from "fhir/r4";
import {handleError} from "../utils/ErrorHandler.ts";

export interface PatientValidationProps {
  readonly client: Client | undefined;
}

export default function PatientValidation({client}: PatientValidationProps) {
  const [validations, setValidations] = useState<Validation[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!client) return;

    client.request<Patient>(`Patient/${client.patient.id}`).then(fhirPatient => {
      console.debug("✅ Patient data fetched");
      Object.entries(fhirPatient).forEach(([key, value]) => {
        console.debug(`ℹ️ Patient.${key}:`, JSON.stringify(value));
      });

      const newValidations: Validation[] = [];

      /**
       * @see https://www.ehelse.no/teknisk-dokumentasjon/oid-identifikatorserier-i-helse-og-omsorgstjenesten#nasjonale-identifikatorserier-for-personer
       */
      const personalIdentifierSystem = "urn:oid:2.16.578.1.12.4.1.4.1";
      const dNumberSystem = "urn:oid:2.16.578.1.12.4.1.4.2";

      const norwegianNationalIdentifierSystem = fhirPatient.identifier?.find(id => id.system === personalIdentifierSystem);
      const norwegianDNumberSystem = fhirPatient.identifier?.find(id => id.system === dNumberSystem);

      // If FNR is not present, a D-number is expected. If D-number is present the patient has a valid Norwegian identifier
      if (!norwegianNationalIdentifierSystem) {
        if (!norwegianDNumberSystem) {
          newValidations.push(new Validation(`The Patient does not have a Norwegian national identity number (FNR) from OID "urn:oid:${personalIdentifierSystem}"`, Severity.ERROR));
          newValidations.push(new Validation(`The Patient does not have a Norwegian D-number from OID "urn:oid:${dNumberSystem}"`, Severity.ERROR));
        }
      }

      setValidations(newValidations);
    }).catch(err => setError(handleError("Unable to fetch Patient", err)));
  }, [client]);

  return (
    <div className="basis-1/5">
      {error ?
        <div>
          <h4>An error occurred when fetching Patient information.</h4>
          <p>{error}</p>
        </div>
        :
        <ValidationTable validationTitle={"Patient validation"}
                         validations={validations}/>
      }
    </div>
  );
}