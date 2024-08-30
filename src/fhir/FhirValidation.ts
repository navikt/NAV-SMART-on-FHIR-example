import {useEffect} from "react";
import {validateFhirPractitionerInformation} from "./FhirPractitionerValidation.ts";
import {Encounter, Patient, Practitioner} from "fhir/r4";
import {validateFhirPatientInformation} from "./FhirPatientValidation.ts";
import {validateFhirEncounterInformation} from "./FhirEncounterValidation.ts";
import {SoFValidation} from "../utils/Validation.ts";

export function useValidation(
  loggedInUser: Practitioner | undefined,
  patient: Patient | undefined,
  encounter: Encounter | undefined,
  setValResults: (results: (prevResults: Array<SoFValidation>) => SoFValidation[]) => void) {

  useEffect(() => {
    if (patient) {
      const practitionerVal = validateFhirPractitionerInformation(loggedInUser);
      const patientVal = validateFhirPatientInformation(patient);
      const encounterVal = validateFhirEncounterInformation(encounter);

      setValResults((prevResults: Array<SoFValidation>) => [
        ...prevResults,
        ...practitionerVal,
        ...patientVal,
        ...encounterVal
      ]);
    }
  }, []);
}