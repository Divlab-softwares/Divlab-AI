import DivlabAi from "./DivlabAi/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {authOptions} from "@/app/lib/authOption"
// import { Providers } from "/Components/Providers";

 export default async function Home() {

     const session = await getServerSession(authOptions);
    
    
        if (!session) {
            console.log(session)
        //    redirect("/SignIn");
        
        }


    return (
            <DivlabAi session={session} />
    );
}
