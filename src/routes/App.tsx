import "./App.css";
import ValidationInfo from "../components/ValidationInfo.tsx";
import {Practitioner} from "fhir/r4";
import FhirInformation from "../components/FhirInformation.tsx";
import ErrorPage from "./ErrorPage.tsx";
import {useSmartClient} from "../smart/SmartClient.ts";
import {useFhirData} from "../fhir/FhirData.ts";
import {useValidation} from "../fhir/FhirValidation.ts";

function App() {
  const {client, valResults, setValResults, error: smartError} = useSmartClient();
  const {loggedInUser, patient, encounter, error: fhirError} = useFhirData(client);

  useValidation(loggedInUser, patient, encounter, setValResults);

  const error = smartError || fhirError;

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
  return <div>
    {error ?
      <ErrorPage error={error}/> :
      <div id="information">
        <ValidationInfo results={valResults}/>
        <br/>
        <FhirInformation practitioner={loggedInUser as Practitioner} patient={patient} encounter={encounter}/>
      </div>
    }
  </div>;
}

export default App;
