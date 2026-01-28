import NextAuth from "next-auth"
import Keycloak from "next-auth/providers/keycloak"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Keycloak({
    clientId: process.env.KEYCLOAK_ID,
    clientSecret: process.env.KEYCLOAK_SECRET,
    issuer: process.env.KEYCLOAK_ISSUER,
    authorization: {
      url: "http://localhost:8080/realms/invoice-realm/protocol/openid-connect/auth",
      params: { scope: 'openid profile email', prompt: 'login' },
    },    
  })],
  callbacks: {
    // 1. Capture id_token from Keycloak
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token; 
      }
      return token;
    },
    // 2. Pass id_token to the client session
    async session({ session, token }) {
      session.id_token = token.id_token as string; 
      console.log('Session', session);
      return session;
    },
  },
})