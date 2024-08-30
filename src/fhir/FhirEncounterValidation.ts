import {Encounter} from "fhir/r4";
import {SoFValidation} from "../utils/Validation.ts";

export function validateFhirEncounterInformation(encounter: Encounter): SoFValidation | undefined {
  console.debug(`ℹ️ TODO validate FHIR Encounter information:`, JSON.stringify(encounter));
  return undefined;
}