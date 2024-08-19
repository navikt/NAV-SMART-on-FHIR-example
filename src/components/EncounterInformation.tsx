import {Encounter} from "fhir/r4";

interface EncounterInformationProps {
  readonly encounter?: Encounter;
}

export default function EncounterInformation({encounter}: EncounterInformationProps) {
  if (!encounter) {
    return (<div>
      <h3>Encounter is not present on the FHIR API</h3>
    </div>);
  } else {
    return (<div>
      <h3>TODO Encounter Information</h3>
    </div>);
  }
}