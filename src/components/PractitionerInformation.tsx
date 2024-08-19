import {
  Address,
  CodeableConcept,
  Extension,
  HumanName,
  Identifier,
  Practitioner,
  PractitionerQualification
} from "fhir/r4";

interface PractitionerInformationProps {
  readonly practitioner?: Practitioner;
}

export default function PractitionerInformation({practitioner}: PractitionerInformationProps) {
  if (!practitioner) {
    return (<div>
      <h3>Practitioner is not present on the FHIR API</h3>
    </div>);
  } else {
    return (<div>
        <h3>Practitioner Information</h3>
        <table>
          <thead>
          <tr>
            <th>Property</th>
            <th>Values</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <th>Name</th>
            {practitioner.name?.map((name: HumanName, index: number) => {
              return <td key={index}>
                {name.given} {name.family}
              </td>;
            })}
          </tr>
          <tr>
            <th>Birthdate</th>
            <td>{practitioner.birthDate}</td>
          </tr>
          {
            practitioner.identifier?.map((identifier: Identifier, index: number) => {
              return <tr key={index}>
                <th>Identifier {index + 1}</th>
                <td>{identifier.system} {identifier.value}</td>
              </tr>;
            })
          }
          <tr>
            <th>Gender</th>
            <td>{practitioner.gender}</td>
          </tr>
          {
            practitioner.address?.map((address: Address, index: number) => {
              return <tr key={index}>
                <th>Address {index + 1}</th>
                <td>{address.line} {address.city} {address.postalCode} {address.state} {address.country}</td>
              </tr>;
            })
          }
          <tr>
            <th>Organizations</th>
            <td>TODO - Find practitioner organization(s)</td>
          </tr>
          <tr>
            <th>Active</th>
            <td>{String(practitioner.active)}</td>
          </tr>
          {
            practitioner.communication?.map((communication: CodeableConcept, index: number) => {
              return <tr key={index}>
                <th>Communication {index + 1}</th>
                <td>{communication.id} {communication.text}</td>
              </tr>;
            })
          }
          {
            practitioner.telecom?.map((telecom: CodeableConcept, index: number) => {
              return <tr key={index}>
                <th>Telecom {index + 1}</th>
                <td>{telecom.id} {telecom.text}</td>
              </tr>;
            })
          }
          {
            practitioner.qualification?.map((qualification: PractitionerQualification, index: number) => {
              return <tr key={index}>
                <th>Qualification {index + 1}</th>
                <td>{qualification.identifier?.map(qualId => {
                  return `${qualId.value} ${qualId.system} `;
                })}</td>
              </tr>;
            })
          }
          {
            practitioner.extension?.map((extension: Extension, index: number) => {
              return <tr key={index}>
                <th>Extension {index + 1}</th>
                <td>{extension.id} {extension.url}</td>
              </tr>;
            })
          }
          <tr>
            <th>Last updated</th>
            <td>{practitioner.meta?.lastUpdated}</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }
}