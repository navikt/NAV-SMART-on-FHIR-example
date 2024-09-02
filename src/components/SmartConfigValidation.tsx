import Client from "fhirclient/lib/Client";
import {Severity, Validation} from "../utils/Validation.ts";
import {SmartConfiguration} from "../smart/SmartConfiguration.ts";
import ValidationTable from "./ValidationTable.tsx";
import {useEffect, useState} from "react";

export interface SmartConfigValidationProps {
  readonly client: Client | undefined;
}

/**
 * Validates that the smart-configuration metadata follows the requirements as defined by the [SMART
 * framework](https://hl7.org/fhir/smart-app-launch/conformance.html#metadata).
 *
 * This will NOT validate the contents, only that required, recommended or optional fields are present.
 *
 * @param client - The SMART on FHIR client instance
 */
export default function SmartConfigValidation({client}: SmartConfigValidationProps) {
  const [validations, setValidations] = useState<Validation[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!client) return;

    const fhirServerUrl: string = client.getState("serverUrl");
    console.debug("ℹ️ FHIR server URL:", fhirServerUrl);

    const urlHasSlashSuffix = fhirServerUrl.endsWith("/");
    let wellKnownSmartConfigURL: string;

    if (urlHasSlashSuffix) {
      wellKnownSmartConfigURL = `${fhirServerUrl}.well-known/smart-configuration`;
    } else {
      wellKnownSmartConfigURL = `${fhirServerUrl}/.well-known/smart-configuration`;
    }
    console.debug("ℹ️ SMART configuration URL:", wellKnownSmartConfigURL);

    const newValidations: Validation[] = [];

    fetch(wellKnownSmartConfigURL).then(response => {
      if (!response.ok) {
        setError(`Received ${response.status} when fetching .well-known/smart-configuration.`);
      }
      return response.json();
    }).then((config: SmartConfiguration) => {
      console.debug("ℹ️ .well-known/smart-configuration:", config);

      // REQUIRED fields
      if (!config.issuer) {
        newValidations.push(new Validation(`Missing REQUIRED field issuer in ${wellKnownSmartConfigURL}`, Severity.ERROR));
      }
      if (!config.jwks_uri) {
        newValidations.push(new Validation(`Missing REQUIRED field jwks_uri in ${wellKnownSmartConfigURL}`, Severity.ERROR));
      }
      if (!config.authorization_endpoint) {
        newValidations.push(new Validation(`Missing REQUIRED field authorization_endpoint in ${wellKnownSmartConfigURL}`, Severity.ERROR));
      }
      if (!config.grant_types_supported) {
        newValidations.push(new Validation(`Missing REQUIRED field grant_types_supported in ${wellKnownSmartConfigURL}`, Severity.ERROR));
      }
      if (!config.token_endpoint) {
        newValidations.push(new Validation(`Missing REQUIRED field token_endpoint in ${wellKnownSmartConfigURL}`, Severity.ERROR));
      }
      if (!config.capabilities) {
        newValidations.push(new Validation(`Missing REQUIRED field capabilities in ${wellKnownSmartConfigURL}`, Severity.ERROR));
      }
      if (!config.code_challenge_methods_supported) {
        newValidations.push(new Validation(`Missing REQUIRED field code_challenge_methods_supported in ${wellKnownSmartConfigURL}`, Severity.ERROR));
      }

      // RECOMMENDED fields
      if (!config.user_access_brand_bundle) {
        newValidations.push(new Validation(`Missing RECOMMENDED field user_access_brand_bundle in ${wellKnownSmartConfigURL}`, Severity.WARNING));
      }
      if (!config.user_access_brand_identifier) {
        newValidations.push(new Validation(`Missing RECOMMENDED field user_access_brand_identifier in ${wellKnownSmartConfigURL}`, Severity.WARNING));
      }
      if (!config.scopes_supported) {
        newValidations.push(new Validation(`Missing RECOMMENDED field scopes_supported in ${wellKnownSmartConfigURL}`, Severity.WARNING));
      }
      if (!config.response_types_supported) {
        newValidations.push(new Validation(`Missing RECOMMENDED field response_types_supported in ${wellKnownSmartConfigURL}`, Severity.WARNING));
      }
      if (!config.management_endpoint) {
        newValidations.push(new Validation(`Missing RECOMMENDED field management_endpoint in ${wellKnownSmartConfigURL}`, Severity.WARNING));
      }
      if (!config.introspection_endpoint) {
        newValidations.push(new Validation(`Missing RECOMMENDED field introspection_endpoint in ${wellKnownSmartConfigURL}`, Severity.WARNING));
      }
      if (!config.revocation_endpoint) {
        newValidations.push(new Validation(`Missing RECOMMENDED field revocation_endpoint in ${wellKnownSmartConfigURL}`, Severity.WARNING));
      }

      // OPTIONAL fields
      if (!config.token_endpoint_auth_methods_supported) {
        newValidations.push(new Validation(`token_endpoint_auth_methods_supported not found in ${wellKnownSmartConfigURL}`, Severity.INFO));
      }
      if (!config.registration_endpoint) {
        newValidations.push(new Validation(`registration_endpoint not found in ${wellKnownSmartConfigURL}`, Severity.INFO));
      }
      if (!config.associated_endpoints) {
        newValidations.push(new Validation(`associated_endpoints not found in ${wellKnownSmartConfigURL}`, Severity.INFO));
      }

      setValidations(newValidations);
    });
  }, [client]);

  return (
    <div>
      {error ?
        <div>
          <h4>An error occurred while fetching .well-known/smart-configuration</h4>
          <p>{error}</p>
        </div>
        :
        <ValidationTable validationTitle={"SMART configuration validation"}
                         validations={validations}/>
      }
    </div>
  );
}