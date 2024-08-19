import {Patient} from "fhir/r4";
import {Severity, SoFValidation} from "../utils/Validation.ts";

export function validateFhirPatientInformation(patient: Patient): SoFValidation | undefined {
  const norwegianNationalIdentifierSystem = patient.identifier?.find(id => id.system === "urn:oid:2.16.578.1.12.4.1.4.1");

  if (!norwegianNationalIdentifierSystem) {
    return new SoFValidation(`The Patient does not have a norwegian national identity number (FNR) from URN OID number "urn:oid:2.16.578.1.12.4.1.4.1"`, Severity.ERROR);
  }
}