import Client from "fhirclient/lib/Client";
import {useEffect, useState} from "react";
import {Encounter, Patient, Practitioner} from "fhir/r4";
import {handleError} from "../utils/ErrorHandler.ts";

export function useFhirData(client: Client | undefined) {
  const [loggedInUser, setLoggedInUser] = useState<Practitioner | undefined>(undefined);
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [encounter, setEncounter] = useState<Encounter | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!client) return;

    const fetchData = async () => {
      try {
        if (client.user.fhirUser && client.user.resourceType === "Practitioner") {
          const fhirPractitioner = await client.request<Practitioner>(client.user.fhirUser);
          console.debug("✅ Practitioner data fetched:", fhirPractitioner);
          setLoggedInUser(fhirPractitioner);
        } else {
          console.warn(`⚠️ Logged in user is not set or not the correct type "Practitioner". FhirUser claim: ${client.user.fhirUser}. ResourceType: ${client.user.resourceType}`);
        }

        const fhirPatient = await client.request<Patient>(`Patient/${client.patient.id}`);
        console.debug("✅ Patient data fetched:", fhirPatient);
        setPatient(fhirPatient);

        const fhirEncounter = await client.request<Encounter>(`Encounter/${client.encounter.id}`);
        console.debug("✅ Encounter data fetched:", fhirEncounter);
        setEncounter(fhirEncounter);
      } catch (err) {
        setError(handleError("Unable to fetch FHIR data", err));
      }
    };

    fetchData();
  }, [client]);

  return {loggedInUser, patient, encounter, error};
}