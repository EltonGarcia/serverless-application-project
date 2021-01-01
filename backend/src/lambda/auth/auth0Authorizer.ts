import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode, JwtHeader, SigningKeyCallback, VerifyOptions } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JwksClient } from 'jwks-rsa';

const logger = createLogger('auth')

const jwksUrl = 'https://dev-mkfpq56i.us.auth0.com/.well-known/jwks.json'
const jwksClient = new JwksClient({jwksUri: jwksUrl});

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  let options: VerifyOptions = { algorithms: ['RS256'] }
  verify(token, getSigningKeyForVerification, options, (err, _) => {
    if (err){
      logger.error('Token verification has failed:', err)
    }
  });
  return jwt.payload;
}

function getSigningKeyForVerification(header: JwtHeader, callback: SigningKeyCallback): void{
  return jwksClient.getSigningKey(header.kid, function(err, key) {
    if (err){
      logger.error('GetSigningKeyForVerification has failed:', err)
    }
    var signingKey = key.getPublicKey();
    callback(err, signingKey);
  });
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
