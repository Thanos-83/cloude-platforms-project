import { signIn } from "@/auth"
import { Button } from "../ui/button"

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn()
      }}
    >
      <Button variant="outline" className="cursor-pointer" type="submit">Sign in</Button>
    </form>
  )
}