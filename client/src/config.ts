// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '3iyrz28qt0'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-mkfpq56i.us.auth0.com',            // Auth0 domain
  clientId: 'zhIvzMhFP8R2pge00g4p69pLrFCOvDnQ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
