import {useEffect, useState} from "react";
import {SoFValidation} from "../utils/Validation.ts";
import {oauth2 as SMART} from "fhirclient";
import Client from "fhirclient/lib/Client";
import {validateWellKnownSmartConfiguration} from "./SmartWellKnownConfigValidation.ts";
import {validateIdTokenInformation} from "./SmartIdTokenValidation.ts";

export function useSmartClient() {
  const [client, setClient] = useState<Client>();
  const [valResults, setValResults] = useState<Array<SoFValidation>>([]);
  const [error, setError] = useState<Error>();

  /**
   * STEP 2 - SMART on FHIR readiness
   *
   * After launch is triggered, the app will test the required fields in .well-known/smart-configuration
   * as defined in the .env file.
   *
   * Then the fhirClient will ensure that the SMART framework is READY for use. Once it is ready, the expected
   * id_token fields are validated.
   *
   * The useEffect dependencies should remain empty as it is only required to run once.
   */
  useEffect(() => {
    SMART.ready().then((client: Client) => {
      console.debug("✅ The client is initialized and ready to fetch from the FHIR server:", client);
      setClient(client);

      client.getFhirRelease().then(release => {
        if (release !== 4) {
          setError(new Error(`The FHIR server must be version R4 to be compliant. Detected version is ${release}.`));
        }
        console.debug(`✅ FHIR server version is R${release}`);
      }).catch(err => {
        setError(new Error(`Unable to get the FHIR version. ${err.message}`));
      });

      const smartConfigValidationResults = validateWellKnownSmartConfiguration(client);
      setValResults(prevResults => [...prevResults, ...smartConfigValidationResults]);

      console.debug(`✅ SMART configuration validation step complete with a total of ${smartConfigValidationResults.length} issues.`);

      const idTokenValidationResults = validateIdTokenInformation(client);
      setValResults(prevResults => [...prevResults, ...idTokenValidationResults]);

      console.debug(`✅ ID Token validation step complete with a total of ${idTokenValidationResults.length} issues.`);
    }).catch((err: Error) => {
      setError(new Error(err.message));
    });
  }, []); // This needs to be left empty to ensure the effect is run once

  return { client, valResults, setValResults, error }
}