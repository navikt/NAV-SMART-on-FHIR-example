import {Encounter, Patient, Practitioner} from "fhir/r4";
import PractitionerInformation from "./PractitionerInformation.tsx";
import PatientInformation from "./PatientInformation.tsx";
import EncounterInformation from "./EncounterInformation.tsx";

export interface FhirInformationProps {
  readonly practitioner?: Practitioner;
  readonly patient?: Patient;
  readonly encounter?: Encounter;
}

export default function FhirInformation({
                                          practitioner,
                                          patient,
                                          encounter
                                        }: FhirInformationProps) {


  return <>
    <PractitionerInformation practitioner={practitioner}/>
    <PatientInformation patient={patient}/>
    <EncounterInformation encounter={encounter}/>
  </>;
}