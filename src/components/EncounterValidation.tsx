import Client from "fhirclient/lib/Client";
import {Validation} from "../utils/Validation.ts";
import {useEffect, useState} from "react";
import ValidationTable from "./ValidationTable.tsx";
import {Encounter} from "fhir/r4";
import {handleError} from "../utils/ErrorHandler.ts";

export interface EncounterValidationProps {
  readonly client: Client | undefined;
}

export default function EncounterValidation({client}: EncounterValidationProps) {
  const [validations, setValidations] = useState<Validation[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!client) return;

    client.request<Encounter>(`Encounter/${client.encounter.id}`).then(fhirEncounter => {
      console.debug("✅ Encounter data fetched");
      Object.entries(fhirEncounter).forEach(([key, value]) => {
        console.debug(`ℹ️ Encounter.${key}:`, value);
      });

      const newValidations: Validation[] = [];
      setValidations(newValidations);
    }).catch(err => setError(handleError("Unable to fetch Encounter", err)));
  }, [client]);

  return (
    <div className="basis-1/5">
      {error ?
        <div>
          <h4>An error occurred when fetching Encounter information.</h4>
          <p>{error}</p>
        </div>
        :
        <ValidationTable validationTitle={"Encounter validation"}
                         validations={validations}/>
      }
    </div>
  );
}