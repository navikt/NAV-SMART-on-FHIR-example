import Client from "fhirclient/lib/Client";
import {useEffect, useState} from "react";
import {Encounter, Patient, Practitioner} from "fhir/r4";

export function useFhirData(client: Client | undefined) {
  const [loggedInUser, setLoggedInUser] = useState<Practitioner>();
  const [patient, setPatient] = useState<Patient>();
  const [encounter, setEncounter] = useState<Encounter>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!client) {
      return;
    }

    if (client.user.fhirUser) {
      if(client.user.resourceType === "Practitioner") {
        client.request<Practitioner>(client.user.fhirUser).then((fhirPractitioner: Practitioner) => {
          console.debug("✅ Successfully polled the FHIR API for information about the logged in user:", fhirPractitioner);
          setLoggedInUser(fhirPractitioner);
        }).catch((err: Error) => setError(new Error(`Unable to fetch data about the logged in user from the FHIR API. ${err.message}`)));
      } else {
        console.warn(`⚠️ Logged in user is not of required type Practitioner, is instead "${client.user.fhirUser}". Will not ask the FHIR server for data about the logged in user.`);
      }
    } else {
      console.warn(`⚠️ Launch context contains no information about the logged in user via a fhirUser claim. Will not ask ask the FHIR server for data about the logged in user.`);
    }

    client.request<Patient>(`Patient/${client.patient.id}`).then((fhirPatient: Patient) => {
      console.debug("ℹ️ TODO Patient info:", fhirPatient);
      setPatient(fhirPatient);
    }).catch((err: Error) => {
      setError(new Error(`Unable to fetch data about the Patient from the FHIR API. ${err.message}`));
    });

    client.request<Encounter>(`Encounter/${client.encounter.id}`).then((fhirEncounter: Encounter) => {
      console.debug("ℹ️ TODO Encounter info:", fhirEncounter);
      setEncounter(fhirEncounter);
    }).catch((err: Error) => {
      setError(new Error(`Unable to fetch data about the Encounter from the FHIR API. ${err.message}`));
    });
  }, [client]);

  return { loggedInUser, patient, encounter, error }
}