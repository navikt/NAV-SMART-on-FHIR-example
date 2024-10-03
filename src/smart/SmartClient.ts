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

  return {client, error};
}