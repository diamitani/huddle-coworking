import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  ConfirmSignUpCommand,
  type SignUpCommandInput,
  type InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider"
import { cookies } from "next/headers"

const REGION = process.env.AWS_REGION || "us-east-2"
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!
export const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!

export const cognitoClient = new CognitoIdentityProviderClient({ region: REGION })

export async function signUp(email: string, password: string, name: string) {
  const params: SignUpCommandInput = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
  }
  const res = await cognitoClient.send(new SignUpCommand(params))
  return { userSub: res.UserSub, userConfirmed: res.UserConfirmed ?? false }
}

export async function confirmSignUp(email: string, code: string) {
  await cognitoClient.send(
    new ConfirmSignUpCommand({ ClientId: CLIENT_ID, Username: email, ConfirmationCode: code })
  )
}

export async function signIn(email: string, password: string) {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  }
  const res = await cognitoClient.send(new InitiateAuthCommand(params))
  return {
    idToken: res.AuthenticationResult?.IdToken,
    accessToken: res.AuthenticationResult?.AccessToken,
    refreshToken: res.AuthenticationResult?.RefreshToken,
    expiresIn: res.AuthenticationResult?.ExpiresIn,
  }
}

export async function refreshTokens(refreshToken: string) {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  }
  const res = await cognitoClient.send(new InitiateAuthCommand(params))
  return {
    idToken: res.AuthenticationResult?.IdToken,
    accessToken: res.AuthenticationResult?.AccessToken,
    expiresIn: res.AuthenticationResult?.ExpiresIn,
  }
}

export async function getCognitoUser(accessToken: string) {
  const res = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }))
  const attrs: Record<string, string> = {}
  res.UserAttributes?.forEach((a) => { if (a.Name && a.Value) attrs[a.Name] = a.Value })
  return { sub: attrs.sub, email: attrs.email, name: attrs.name || "" }
}

// Server-side helper: read access_token from cookie and get user
export async function getCurrentUser() {
  try {
    const jar = await cookies()
    const accessToken = jar.get("access_token")?.value
    if (!accessToken) return null
    return await getCognitoUser(accessToken)
  } catch {
    return null
  }
}
