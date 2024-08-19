import {Practitioner} from "fhir/r4";
import {Severity, SoFValidation} from "../utils/Validation.ts";

export function validateFhirPractitionerInformation(practitioner: Practitioner): SoFValidation | undefined {
  const norwegianHealthcareProfessionalSystem = practitioner.identifier?.find(id => id.system === "urn:oid:2.16.578.1.12.4.1.4.4");

  if (!norwegianHealthcareProfessionalSystem) {
    return new SoFValidation(`The Practitioner does not have a norwegian healthcare professional ID number (HPR-number) with URN OID "urn:oid:2.16.578.1.12.4.1.4.4"`, Severity.ERROR);
  }
}