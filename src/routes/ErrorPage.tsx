interface ErrorPageProps {
  error: string;
}

export default function ErrorPage({error}: ErrorPageProps) {
  console.error(error);

  return (
    <div id="error-page">
      <h2>An unrecoverable error has occurred</h2>
      <p><b>Please ensure you comply with these requirements:</b></p>
      <ul>
        <li>The app has been launched from the <b>/launch</b> URL</li>
        <li>You are allowed to request the scopes defined</li>
        <li>The .well-known/smart-configuration endpoint is available</li>
        <li>The client_id is registered with the EHR</li>
        <li>The FHIR server supports FHIR version R4</li>
      </ul>
      <br/>
      <p>Error:<br/><i>{error}</i></p>
      <p>
      </p>
    </div>
  );
}