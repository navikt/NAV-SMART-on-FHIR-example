import {Severity, SoFValidation} from "../utils/Validation.ts";
import {SmartConfiguration} from "./SmartConfiguration.ts";
import Client from "fhirclient/lib/Client";

/**
 * Validates that the smart-configuration metadata follows the requirements as defined by the [SMART
 * framework](https://hl7.org/fhir/smart-app-launch/conformance.html#metadata).
 *
 * This will NOT validate the contents, only that required, recommended or optional fields are present.
 *
 * @param client - The SMART on FHIR client instance
 */
export function validateWellKnownSmartConfiguration(client: Client): Array<SoFValidation> {
  const fhirServerUrl: string = client.getState("serverUrl");
  console.debug("ℹ️ FHIR server URL:", fhirServerUrl);

  const urlHasSlashSuffix = fhirServerUrl.endsWith("/");
  let wellKnownSmartConfigURL: string;

  if(urlHasSlashSuffix) {
    wellKnownSmartConfigURL = `${fhirServerUrl}.well-known/smart-configuration`;
  } else {
    wellKnownSmartConfigURL = `${fhirServerUrl}/.well-known/smart-configuration`;
  }
  console.debug("ℹ️ SMART configuration URL:", wellKnownSmartConfigURL);

  const validations = new Array<SoFValidation>();

  fetch(wellKnownSmartConfigURL).then(response => {
    if (!response.ok) {
      throw new Error(`Received ${response.status} when fetching .well-known/smart-configuration.`);
    }
    return response.json();
  }).then((config: SmartConfiguration) => {
    console.debug("ℹ️ .well-known/smart-configuration:", config);

    // REQUIRED fields
    if (!config.issuer) {
      validations.push(new SoFValidation(`Missing REQUIRED field issuer in ${wellKnownSmartConfigURL}`, Severity.ERROR));
    }
    if (!config.jwks_uri) {
      validations.push(new SoFValidation(`Missing REQUIRED field jwks_uri in ${wellKnownSmartConfigURL}`, Severity.ERROR));
    }
    if (!config.authorization_endpoint) {
      validations.push(new SoFValidation(`Missing REQUIRED field authorization_endpoint in ${wellKnownSmartConfigURL}`, Severity.ERROR));
    }
    if (!config.grant_types_supported) {
      validations.push(new SoFValidation(`Missing REQUIRED field grant_types_supported in ${wellKnownSmartConfigURL}`, Severity.ERROR));
    }
    if (!config.token_endpoint) {
      validations.push(new SoFValidation(`Missing REQUIRED field token_endpoint in ${wellKnownSmartConfigURL}`, Severity.ERROR));
    }
    if (!config.capabilities) {
      validations.push(new SoFValidation(`Missing REQUIRED field capabilities in ${wellKnownSmartConfigURL}`, Severity.ERROR));
    }
    if (!config.code_challenge_methods_supported) {
      validations.push(new SoFValidation(`Missing REQUIRED field code_challenge_methods_supported in ${wellKnownSmartConfigURL}`, Severity.ERROR));
    }

    // RECOMMENDED fields
    if (!config.user_access_brand_bundle) {
      validations.push(new SoFValidation(`Missing RECOMMENDED field user_access_brand_bundle in ${wellKnownSmartConfigURL}`, Severity.WARNING));
    }
    if (!config.user_access_brand_identifier) {
      validations.push(new SoFValidation(`Missing RECOMMENDED field user_access_brand_identifier in ${wellKnownSmartConfigURL}`, Severity.WARNING));
    }
    if (!config.scopes_supported) {
      validations.push(new SoFValidation(`Missing RECOMMENDED field scopes_supported in ${wellKnownSmartConfigURL}`, Severity.WARNING));
    }
    if (!config.response_types_supported) {
      validations.push(new SoFValidation(`Missing RECOMMENDED field response_types_supported in ${wellKnownSmartConfigURL}`, Severity.WARNING));
    }
    if (!config.management_endpoint) {
      validations.push(new SoFValidation(`Missing RECOMMENDED field management_endpoint in ${wellKnownSmartConfigURL}`, Severity.WARNING));
    }
    if (!config.introspection_endpoint) {
      validations.push(new SoFValidation(`Missing RECOMMENDED field introspection_endpoint in ${wellKnownSmartConfigURL}`, Severity.WARNING));
    }
    if (!config.revocation_endpoint) {
      validations.push(new SoFValidation(`Missing RECOMMENDED field revocation_endpoint in ${wellKnownSmartConfigURL}`, Severity.WARNING));
    }

    // OPTIONAL fields
    if (!config.token_endpoint_auth_methods_supported) {
      validations.push(new SoFValidation(`token_endpoint_auth_methods_supported not found in ${wellKnownSmartConfigURL}`, Severity.INFO));
    }
    if (!config.registration_endpoint) {
      validations.push(new SoFValidation(`registration_endpoint not found in ${wellKnownSmartConfigURL}`, Severity.INFO));
    }
    if (!config.associated_endpoints) {
      validations.push(new SoFValidation(`associated_endpoints not found in ${wellKnownSmartConfigURL}`, Severity.INFO));
    }
  });

  return validations;
}