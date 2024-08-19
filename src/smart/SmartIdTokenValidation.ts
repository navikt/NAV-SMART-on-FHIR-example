import {Severity, SoFValidation} from "../utils/Validation.ts";
import {authOptions} from "../fhir/FhirAuth.ts";
import Client from "fhirclient/lib/Client";

/**
 * Validates that data received in the id_token as requested by the `openid`, `profile` and `fhirUser` scopes is
 * present and formulated correctly.
 *
 * @param client - The SMART on FHIR client instance
 */
export function validateIdTokenInformation(client: Client): Array<SoFValidation> {
  const scopes: string = authOptions.scope as string;
  console.debug("ℹ️ Requested OIDC scope(s)", scopes);

  const validations = Array<SoFValidation>();

  if (!client.user) {
    validations.push(new SoFValidation(`ID token is missing information about the logged in user. This should be present as the scopes requested include "profile" and "fhirUser"`, Severity.ERROR));
  } else {
    const loggedInUser = client.user;

    if (!loggedInUser.fhirUser) {
      validations.push(new SoFValidation("Missing the FHIR resource representation as requested by the OIDC scopes.", Severity.ERROR));
    }

    if (!loggedInUser.resourceType) {
      validations.push(new SoFValidation("Missing the FHIR resource type. This should be Practitioner | Patient | RelatedPerson", Severity.ERROR));
    } else {
      if (loggedInUser.resourceType !== "Practitioner") {
        validations.push(new SoFValidation(`Resource type must be of type Practitioner, not ${loggedInUser.resourceType}. The resource type can be Practitioner | Patient | RelatedPerson, but for a NAV application it must always be Practitioner.`, Severity.WARNING));
      }
    }

    // Use .endsWith() since the fhirUser scope _MAY_ be absolute (e.g. https://epj.eksempel.no/Practitioner/{uuid}
    if (!loggedInUser.fhirUser?.endsWith(`${loggedInUser.resourceType}/${loggedInUser.id}`)) {
      validations.push(new SoFValidation("The fhirUser scope must follow the format (optional){fhirAPI}/{resourceType}/{resourceId}", Severity.ERROR));
    }
  }

  return validations;
}