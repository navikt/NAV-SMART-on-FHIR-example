import Client from "fhirclient/lib/Client";
import {Severity, Validation} from "../utils/Validation.ts";
import {useEffect, useState} from "react";
import {authOptions} from "../fhir/FhirAuth.ts";
import ValidationTable from "./ValidationTable.tsx";

export interface IdTokenValidationProps {
  readonly client: Client | undefined;
}

/**
 * Validates that data received in the id_token as requested by the `openid`, `profile` and `fhirUser` scopes is
 * present and formulated correctly.
 *
 * @param client - The SMART on FHIR client instance
 */
export default function IdTokenValidation({client}: IdTokenValidationProps) {
  const [validations, setValidations] = useState<Validation[]>();

  useEffect(() => {
    if (!client) return;

    const scopes: string = authOptions.scope as string;
    const clientId: string = authOptions.clientId as string;
    const idToken = client.getIdToken();

    console.debug("ℹ️ Requested OIDC scope(s):", scopes);
    console.debug("ℹ️ ID Token as requested via openid scope:", JSON.stringify(idToken));

    const newValidations: Validation[] = [];

    if (idToken) {
      const fhirServerUrl: string = client.getState("serverUrl");
      const fhirUser = idToken["fhirUser"];
      const profile = idToken.profile;
      const issuer = idToken.iss;
      const audience = idToken.aud;

      if (!fhirUser) {
        newValidations.push(new Validation(`ID token is missing the "fhirUser" claim`, Severity.ERROR));
      }

      if (!profile) {
        newValidations.push(new Validation(`ID token is missing the "profile" claim`, Severity.ERROR));
      }

      if (issuer) {
        if (issuer !== fhirServerUrl) {
          newValidations.push(new Validation(`ID token issuer should be the same as the FHIR server URL (${fhirServerUrl}), but was ${idToken.iss}`, Severity.WARNING));
        }
      } else {
        newValidations.push(new Validation(`ID token is missing the "issuer" claim`, Severity.ERROR));
      }

      if (audience) {
        if (audience !== clientId) {
          newValidations.push(new Validation(`ID token audience incorrect, it should be ${clientId}, but was ${idToken.aud}`, Severity.ERROR));
        }
      } else {
        newValidations.push(new Validation(`ID token is missing the "aud" claim`, Severity.ERROR));
      }

      if (client.user) {
        const loggedInUser = client.user;

        // Use .endsWith() since the fhirUser scope _MAY_ be absolute (e.g. https://epj.eksempel.no/Practitioner/{uuid}
        if (!loggedInUser.fhirUser?.endsWith(`${loggedInUser.resourceType}/${loggedInUser.id}`)) {
          newValidations.push(new Validation("The fhirUser scope must follow the format (optional){fhirAPI}/{resourceType}/{resourceId}", Severity.ERROR));
        }
      }
    } else {
      newValidations.push(new Validation(`Missing ID token which was requested by the openid scope.`, Severity.ERROR));
    }

    setValidations(newValidations);
  }, [client]);

  return (<ValidationTable validationTitle={"Results of validating id_token"}
                           validations={validations}/>);
}