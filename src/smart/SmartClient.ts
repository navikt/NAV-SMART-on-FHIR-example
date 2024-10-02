import {useEffect, useState} from "react";
import {oauth2 as SMART} from "fhirclient";
import Client from "fhirclient/lib/Client";
import {handleError} from "../utils/ErrorHandler.ts";

export function useSmartClient() {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);



  useEffect(() => {
    SMART.ready().then((client: Client) => {
      console.debug("✅ The client is initialized and ready to fetch from the FHIR server:", client);
      setClient(client);
    }).catch(err => setError(handleError("Unable to initialise FHIR client", err)));
  }, []);

  /* TODO - FHIR validation
  client.getFhirRelease().then(release => {
    if (release !== 4) {
      setError(`The FHIR server must be version R4 to be compliant. Detected version is ${release}.`);
    }
    console.debug(`✅ FHIR server version is R${release}`);
  }).catch(err => setError(handleError("Unable to get the FHIR version", err)));
  */

  return {client, error};
}