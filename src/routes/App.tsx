import ErrorPage from "./ErrorPage.tsx";
import SmartConfigValidation from "../components/SmartConfigValidation.tsx";
import IdTokenValidation from "../components/IdTokenValidation.tsx";
import UserValidation from "../components/UserValidation.tsx";
import PatientValidation from "../components/PatientValidation.tsx";
import EncounterValidation from "../components/EncounterValidation.tsx";
import {useQuery} from "@tanstack/react-query";
import {oauth2 as SMART} from "fhirclient";

function App() {
  const {data: client, error, isLoading} = useQuery({
    queryKey: ["smartClient"],
    queryFn: () => {
      return SMART.ready();
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false
  });

  return <div>
    <p className="text-3xl text-center pb-5">NAV SMART on FHIR compliance test</p>
    { isLoading && <p>Initializing SMART client...</p> }
    {client && <div className="flex flex-col">
        <SmartConfigValidation client={client}/>
        <br/>
        <IdTokenValidation client={client}/>
        <br/>
        <UserValidation client={client}/>
        <br/>
        <PatientValidation client={client}/>
        <br/>
        <EncounterValidation client={client}/>
    </div>}
    {error && <ErrorPage error={error.message}/>}
  </div>;
}

export default App;
