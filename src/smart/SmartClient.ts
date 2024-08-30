import {useEffect, useState} from "react";
import {SoFValidation} from "../utils/Validation.ts";
import {oauth2 as SMART} from "fhirclient";
import Client from "fhirclient/lib/Client";
import {validateWellKnownSmartConfiguration} from "./SmartWellKnownConfigValidation.ts";
import {validateIdTokenInformation} from "./SmartIdTokenValidation.ts";
import {handleError} from "../utils/ErrorHandler.ts";

export function useSmartClient() {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [valResults, setValResults] = useState<Array<SoFValidation>>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const client = await SMART.ready();
        console.debug("✅ The client is initialized and ready to fetch from the FHIR server:", client);
        setClient(client);

        try {
          const release = await client.getFhirRelease();
          if (release !== 4) {
            setError(`The FHIR server must be version R4 to be compliant. Detected version is ${release}.`);
          }
          console.debug(`✅ FHIR server version is R${release}`);
        } catch (err) {
          setError(handleError("Unable to get the FHIR version", err));
        }

        const smartConfigValidationResults = validateWellKnownSmartConfiguration(client);
        const idTokenValidationResults = validateIdTokenInformation(client);

        setValResults((prevResults: Array<SoFValidation>) => [
          ...prevResults,
          ...smartConfigValidationResults,
          ...idTokenValidationResults
        ]);

        console.debug(`✅ Validation completed with ${smartConfigValidationResults.length + idTokenValidationResults.length} issues.`);
      } catch (err) {
        handleError("Unable to initialise FHIR client", err)
      }
    };

    initializeClient();
  }, []);

  return {client, valResults, setValResults, error};
}