import {Severity, SoFValidation} from "../utils/Validation.ts";

export interface ValidationInfoProps {
  readonly results: Array<SoFValidation>;
}

export default function ValidationInfo({results}: ValidationInfoProps) {
  const errorVals = results.filter((filVal: SoFValidation) => filVal.severity === Severity.ERROR);
  const warnVals = results.filter((filVal: SoFValidation) => filVal.severity === Severity.WARNING);
  const infoVals = results.filter((filVal: SoFValidation) => filVal.severity === Severity.INFO);

  return (
    <div>
      {errorVals.length > 0 ?
        <div>
          <h4>🚫 Found {errorVals.length} ERROR level issues</h4>
          <p>You <b>must</b> fix and support the issues listed below as they are <b>REQUIRED</b> by the SMART framework
            or NAV.
          </p>
          {errorVals.map((mapVal: SoFValidation, index: number) => (
            <p key={index}>{mapVal.severity} <i>{mapVal.message}</i></p>))}
        </div> :
        <h4>✅ Found no errors</h4>
      }
      <br/>
      {warnVals.length > 0 ?
        <div>
          <h4>⚠️ Found {warnVals.length} WARNING level issues</h4>
          <p>You are not required to support these issues, but they are <b>RECOMMENDED</b> by the SMART framework or
            NAV.</p>
          {warnVals.map((mapVal: SoFValidation, index: number) => (
            <p key={index}>{mapVal.severity} <i>{mapVal.message}</i></p>))}
        </div> :
        <h4>✅ Found no warnings</h4>
      }
      <br/>
      {infoVals.length > 0 ?
        <div>
          <h4>ℹ️ Found {infoVals.length} INFO level issues</h4>
          <p>You are not required to fix these issues as they are <b>OPTIONAL</b>, but we do recommend to read and
            understand what they provide.</p>
          {infoVals.map((mapVal: SoFValidation, index: number) => (
            <p key={index}>{mapVal.severity} <i>{mapVal.message}</i></p>))}
        </div> :
        <h4>✅ No trivial issues to report</h4>
      }
    </div>
  );
}