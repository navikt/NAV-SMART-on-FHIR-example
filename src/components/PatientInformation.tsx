import {Patient} from "fhir/r4";

interface PatientInformationProps {
  readonly patient?: Patient;
}

export default function PatientInformation({patient}: PatientInformationProps) {
  if (!patient) {
    return (<div>
      <h3>Patient is not present on the FHIR API</h3>
    </div>);
  } else {
    return (<div>
      <h3>TODO Patient Information</h3>
    </div>);
  }
}