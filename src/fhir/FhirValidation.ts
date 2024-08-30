import {useEffect} from "react";
import {validateFhirPractitionerInformation} from "./FhirPractitionerValidation.ts";
import {Encounter, Patient, Practitioner} from "fhir/r4";
import {validateFhirPatientInformation} from "./FhirPatientValidation.ts";
import {validateFhirEncounterInformation} from "./FhirEncounterValidation.ts";
import {SoFValidation} from "../utils/Validation.ts";

export function useValidation(loggedInUser: Practitioner | undefined, patient: Patient | undefined, encounter: Encounter | undefined, setValResults: Function) {
  useEffect(() => {
    if (loggedInUser) {
      const practitionerValidation = validateFhirPractitionerInformation(loggedInUser);
      if (practitionerValidation) {
        setValResults((prevResults: Array<SoFValidation>) => [...prevResults, practitionerValidation]);
      }
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (patient) {
      const patientValidation = validateFhirPatientInformation(patient);
      if (patientValidation) {
        setValResults((prevResults: Array<SoFValidation>) => [...prevResults, patientValidation]);
      }
    }
  }, [patient]);

  useEffect(() => {
    if (encounter) {
      const encounterValidation = validateFhirEncounterInformation(encounter);
      if (encounterValidation) {
        setValResults((prevResults: Array<SoFValidation>) => [...prevResults, encounterValidation]);
      }
    }
  }, [encounter]);
}