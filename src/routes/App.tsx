import "./App.css";
import {useEffect, useState} from "react";
import {oauth2 as SMART} from "fhirclient";
import {SoFValidation} from "../utils/Validation.ts";
import ValidationInfo from "../components/ValidationInfo.tsx";
import Client from "fhirclient/lib/Client";
import {Encounter, Patient, Practitioner} from "fhir/r4";
import FhirInformation from "../components/FhirInformation.tsx";
import {validateWellKnownSmartConfiguration} from "../smart/SmartWellKnownConfigValidation.ts";
import {validateIdTokenInformation} from "../smart/SmartIdTokenValidation.ts";
import {validateFhirPractitionerInformation} from "../fhir/FhirPractitionerValidation.ts";
import {validateFhirPatientInformation} from "../fhir/FhirPatientValidation.ts";
import ErrorPage from "./ErrorPage.tsx";

function App() {
  const [loggedInUser, setLoggedInUser] = useState<Practitioner>();
  const [patient, setPatient] = useState<Patient>();
  const [encounter, setEncounter] = useState<Encounter>();
  const [valResults, setValResults] = useState<Array<SoFValidation>>([]);
  const [client, setClient] = useState<Client>();
  const [error, setError] = useState<Error>();

  /**
   * STEP 2 - SMART on FHIR readiness
   *
   * After launch is triggered, the app will test the required fields in .well-known/smart-configuration
   * as defined in the .env file.
   *
   * Then the fhirClient will ensure that the SMART framework is READY for use. Once it is ready, the expected
   * id_token fields are validated.
   *
   * The useEffect dependencies should remain empty as it is only required to run once.
   */
  useEffect(() => {
    SMART.ready().then(client => {
      const smartConfigValidationResults = validateWellKnownSmartConfiguration(client);
      setValResults(smartConfigValidationResults);

      console.debug(`✅ SMART configuration validation step complete with a total of ${smartConfigValidationResults.length} issues.`);

      setClient(client);

      client.getFhirRelease().then(release => {
        if (release !== 4) {
          setError(new Error(`The FHIR server must be version R4 to be compliant. Detected version is ${release}.`));
        }
      }).catch(err => {
        setError(new Error(`Unable to get the FHIR version. ${err.message}`));
      });

      console.debug("✅ SMART client is ready and initialized.", client);

      const idTokenValidationResults = validateIdTokenInformation(client);
      valResults.concat(idTokenValidationResults);

      console.debug(`✅ ID Token validation step complete with a total of ${idTokenValidationResults.length} issues.`);
    }).catch((err: Error) => {
      setError(new Error(err.message));
    });
    // eslint-disable-next-line
  }, []); // This needs to be left empty to ensure the effect is run once

  /**
   * STEP 3 - FHIR API data fetching
   *
   * Upon successful fhirClient initialization, this step will begin fetching data from the FHIR API based on the
   * information it has received from the id_token and access_token.
   *
   * First it will get data about the logged-in user, then the Patient, and finally the Encounter.
   *
   * Errors will not be thrown, but instead listed as a validation [error | warning | info] and shown to the
   * user.
   */
  useEffect(() => {
    if (client) {
      console.debug("✅ The client is initialized and ready to fetch from the FHIR server.", client);

      if (client.user.fhirUser) {
        switch (client.user.resourceType) {
          case "Practitioner":
            client.request<Practitioner>(client.user.fhirUser).then((fhirPractitioner: Practitioner) => {
              const practitionerValidation = validateFhirPractitionerInformation(fhirPractitioner);
              if (practitionerValidation) {
                valResults.push(practitionerValidation);
              }

              setLoggedInUser(fhirPractitioner);

              console.debug("✅ Successfully polled the FHIR API for information about the logged in user.", fhirPractitioner);
            }).catch((err: Error) => {
              setError(new Error(`Unable to fetch data about the logged in user from the FHIR API. ${err.message}`));
            });
            break;
          default:
            console.warn(`Logged in user is not of required type Practitioner, is instead "${client.user.fhirUser}". Will not ask the FHIR server for data about the logged in user.`);
        }
      }

      client.request<Patient>(`Patient/${client.patient.id}`).then((fhirPatient: Patient) => {
        const patientValidation = validateFhirPatientInformation(fhirPatient);
        if (patientValidation) {
          valResults.push(patientValidation);
        }

        setPatient(fhirPatient);

        console.debug("TODO Patient information", fhirPatient);
      }).catch((err: Error) => {
        setError(new Error(`Unable to fetch data about the Patient from the FHIR API. ${err.message}`));
      });

      client.request<Encounter>(`Encounter/${client.encounter.id}`).then((fhirEncounter: Encounter) => {
        setEncounter(fhirEncounter);

        console.debug("TODO Encounter info", fhirEncounter);
      }).catch((err: Error) => {
        setError(new Error(`Unable to fetch data about the Encounter from the FHIR API. ${err.message}`));
      });
    }
  }, [client, valResults]);

  return <div>
    {error ?
      <ErrorPage error={error}/> :
      <div id="information">
        <ValidationInfo results={valResults}/>
        <br />
        <FhirInformation practitioner={loggedInUser as Practitioner} patient={patient} encounter={encounter}/>
      </div>
    }
  </div>;
}

export default App;
