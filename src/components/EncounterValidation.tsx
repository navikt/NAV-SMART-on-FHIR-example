import Client from "fhirclient/lib/Client";
import {Validation} from "../utils/Validation.ts";
import ValidationTable from "./ValidationTable.tsx";
import {Encounter} from "fhir/r4";
import {handleError} from "../utils/ErrorHandler.ts";
import {useQuery} from "@tanstack/react-query";

export interface EncounterValidationProps {
  readonly client: Client;
}

export default function EncounterValidation({client}: EncounterValidationProps) {
  const { error, isLoading } = useQuery({
    queryKey: ["encounterValidation", client.encounter.id],
    queryFn: async () => {
      const encounter = await client.request<Encounter>(`Encounter/${client.encounter.id}`);

      console.debug("✅ Encounter data fetched");
      Object.entries(encounter).forEach(([key, value]) => {
        console.debug(`ℹ️ Encounter.${key}:`, value);
      });

      return encounter;
    }
  })

  // TODO: Encounter validations
  const validations: Validation[] = [];

  return (
    <div className="basis-1/5">
      {isLoading && <p>Loading Encounter data...</p>}
      {error ?
        <div>
          <h4>An error occurred when fetching Encounter information.</h4>
          <p>{handleError("Unable to fetch Encounter", error)}</p>
        </div>
        :
        <ValidationTable validationTitle={"Encounter validation"}
                         validations={validations}/>
      }
    </div>
  );
}