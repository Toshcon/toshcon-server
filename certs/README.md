# Supabase database CA

`supabase-ca.crt` is Supabase's public Root 2021 CA certificate, downloaded from:

https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

SHA-256 fingerprint:

`807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA`

This is a public certificate, not a private key. Keep this directory alongside
`package.json` when deploying. Run commands from the server root so the shared
database connection configuration can resolve the certificate path.

The certificate expires on 26 April 2031. Obtain an updated certificate from
Supabase's Database Settings when the CA is rotated. Database connections
continue to verify both the certificate chain and the hostname.
