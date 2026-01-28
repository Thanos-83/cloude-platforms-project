import { signOut } from "@/auth"
import { Button } from "../ui/button"
import { auth } from "@/auth" 
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        // 1. Get Session (server-side)
        const session = await auth();
        
        // 2. Build Logout URL
        const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
        const redirect = `${process.env.AUTH_URL}`; 
        // Standard OIDC Logout URL structure
        let logoutUrl = `${issuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(redirect)}`;

        // 3. Attach id_token_hint if available (Crucial for avoiding confirmation screen)
        if (session?.id_token) {
           logoutUrl += `&id_token_hint=${session.id_token}`;
        }

        // 4. Redirect
        await signOut({ redirectTo: logoutUrl });
      }}
    >
      <Button variant="outline" className="cursor-pointer" type="submit">Sign Out</Button>
    </form>
  )
}