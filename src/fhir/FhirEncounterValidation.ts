import {Encounter} from "fhir/r4";
import {SoFValidation} from "../utils/Validation.ts";

export function validateFhirEncounterInformation(encounter: Encounter | undefined): Array<SoFValidation> {
  if(!encounter) return []

  const validations = new Array<SoFValidation>();

  console.debug(`ℹ️ TODO validate FHIR Encounter information:`, JSON.stringify(encounter));
  return validations
}