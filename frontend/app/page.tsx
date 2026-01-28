import { UploadFile } from "@/components/FileUpload";
import { InvoiceList } from "@/components/InvoiceList";
import { getInvoices } from "@/lib/actions/invoiceActions";
import { SignIn } from "@/components/auth/signin-button";
import { SignOut } from "@/components/auth/signout-button";
import { auth } from "@/auth";

export default async function Home() {
  // Fetch initial data on server side
  const invoices = await getInvoices();

  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="py-32 px-16 dark:bg-black ">
        <header className="flex justify-between items-center mb-4 border-b pb-2 border-zinc-200 dark:border-zinc-800 dark:text-white">
          <h1 className="text-3xl font-bold ">Invoice Scanner App</h1>
          {session ?
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold flex-1">{session.user?.name}</p>
              <p className="text-lg font-semibold flex-1">{session.user?.email}</p>
            </div>
            <SignOut/>
          </div> 
          : <SignIn/>}
        </header>
        {session ? <>
        <UploadFile/>
        <InvoiceList initialInvoices={invoices} />
        </> : <p className="text-center text-lg">Please sign in to upload invoices</p>}
      </main>
    </div>
  );
}


