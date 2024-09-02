import "./App.css";
import ErrorPage from "./ErrorPage.tsx";
import {useSmartClient} from "../smart/SmartClient.ts";
import SmartConfigValidation from "../components/SmartConfigValidation.tsx";
import IdTokenValidation from "../components/IdTokenValidation.tsx";
import UserValidation from "../components/UserValidation.tsx";
import PatientValidation from "../components/PatientValidation.tsx";
import EncounterValidation from "../components/EncounterValidation.tsx";

function App() {
  const {client, error: smartError} = useSmartClient();

  const error = smartError;
  return <div>
    {error ?
      <ErrorPage error={error}/> :
      <div id="validations">
        <SmartConfigValidation client={client}/>
        <br/>
        <IdTokenValidation client={client}/>
        <br/>
        <UserValidation client={client}/>
        <br/>
        <PatientValidation client={client}/>
        <br/>
        <EncounterValidation client={client}/>
      </div>
    }
  </div>;
}

export default App;
