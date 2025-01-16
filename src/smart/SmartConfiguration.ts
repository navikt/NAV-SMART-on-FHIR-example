export type SmartConfiguration = {
  /* CONDITIONALS REQUIRED BY NAV */
  issuer?: string // Required if the server’s capabilities include sso-openid-connect; otherwise, omitted.
  jwks_uri?: string // Required if the server’s capabilities include sso-openid-connect; otherwise, optional.
  authorization_endpoint?: string // Required if server supports the launch-ehr or launch-standalone capability; otherwise, optional.

  /* REQUIRED */
  grant_types_supported?: string
  token_endpoint?: string
  capabilities?: string
  code_challenge_methods_supported?: string

  /* RECOMMENDED */
  user_access_brand_bundle?: string
  user_access_brand_identifier?: string
  scopes_supported?: string
  response_types_supported?: string
  management_endpoint?: string
  introspection_endpoint?: string
  revocation_endpoint?: string

  /* OPTIONAL */
  token_endpoint_auth_methods_supported?: string
  registration_endpoint?: string
  associated_endpoints?: string
}
