import { NextResponse } from "next/server";
import { prisma } from "@/app/Components/lib/prisma";
import { create } from "domain";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOption";



// GET /api/clients
export async function GET() {
    const session = await getServerSession(authOptions);
    // const userId = session?.user?.email;
    const userId = "divlab@gmail.com"

    if (!userId) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany(
        {
            where:{
                OR:[
                    {userId: userId},
                   { receiverId: userId}
                ] },
            include: {
                request: {
                    orderBy: { createdAt: "asc" },
                    include: { files: true }
                }
            },
            orderBy: { createdAt: "asc" }
        });
    console.log("anc conv", conversations)
    return NextResponse.json(conversations);
}

// POST /api/clients
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    try {
        const body = await req.json();
        console.log("📤 UPDATE reçu:", body);
        // const userId = session?.user?.email;
        const userId = "divlab@gmail.com"

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Ensure the user exists (create if not)
        await prisma.user.upsert({
            where: { email: userId },
            update: {},
            create: { id: 111, email: userId, name: 'Divlab User', password: 'defaultPassword' },  // Adjust fields
        });

        // Ensure the receiver exists (create if not)
        let receiverEmail = "";
        if (body.length > 2) {
            receiverEmail = body.request[0].receiver;
        } else if (body.request.receiver) {
            receiverEmail = body.request.receiver;
        }
        
        await prisma.user.upsert({
            where: { email: receiverEmail },
            update: {},
            create: { id: 123, email: receiverEmail, name: 'Receiver User', password: 'defaultPassword' },  // Adjust fields
        });


        // if (!body.index || !body.request) {
        //     return NextResponse.json(
        //         { error: "index et request sont requis" },
        //         { status: 400 }
        //     );
        // }

        if (body.index != null) {
            const updatedConv = await prisma.message.create({

                data: {
                    user: body.request.user,
                    receiver: body.request.receiver,
                    message: body.request.message,
                    answer: body.request.answer,
                    //files:  { create: [ { file: body.request[0].files}]},
                    ConversationId: body.index,
                    score: body.request.score
                }
            });

            console.log("✅ Conversation mise à jour:", updatedConv);

            return NextResponse.json(updatedConv, { status: 200 });
        } else  {
            const newConversation = await prisma.conversation.create({
                data: {
                    convId: body.convId,
                    input: body.input,
                    request: {
                        create: [{
                            //id: body.request[0].id,
                            user: body.request[0].user,
                            receiver: body.request[0].receiver,
                            message: body.request[0].message,
                            answer: body.request[0].answer,
                            //files:  { create: [ { file: body.request[0].files}]},
                            score: body.request[0].score
                        }]
                    },
                    reqScore: body.reqScore,
                    archived: body.archived,
                    deleted: body.deleted,
                    warned: body.warned,
                    ephemeral: body.ephemeral,
                    receiverId: body.request[0].receiver,
                    userId: userId,
                },
            });

            return NextResponse.json(newConversation, { status: 200 });
        } 


        console.log("Valeur du request !!!!!", body.request);

    } catch (error: any) {
        console.error("❌ Erreur Ajout /api/message:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

}

// PUT /api/clients
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    try {
        const body = await req.json();
        console.log("📤 UPDATE reçu:", body);



        if (body.value == "archived") {
            const updatedConv = await prisma.conversation.update({
                where: { id: body.index },
                data: {
                    archived: body.Data
                }
            });

            console.log("✅ Conversation mise à jour:", updatedConv);

            return NextResponse.json(updatedConv, { status: 200 });

        } else if (body.value == "deleted") {
            const updatedConv = await prisma.conversation.update({
                where: { id: body.index },
                data: {
                    deleted: body.Data
                }
            });

            console.log("✅ Conversation mise à jour:", updatedConv);

            return NextResponse.json(updatedConv, { status: 200 });

        } else if(body.value == "score") {
            const updatedConv = await prisma.conversation.update({
                where: { id: body.index },
                data: {
                    reqScore: body.val
                }
            });

            console.log("✅ Conversation mise à jour:", updatedConv);

            return NextResponse.json(updatedConv, { status: 200 });

        } else if (body.value == "warned") {
            const updatedConv = await prisma.conversation.update({
                where: { id: body.index },
                data: {
                    warned: body.Data
                }
            });

            console.log("✅ Conversation mise à jour:", updatedConv);

            return NextResponse.json(updatedConv, { status: 200 });
        }


        

        console.log("Valeur du request !!!!!", body.Data);

    } catch (error: any) {
        console.error("❌ Erreur UPDATE /api/message:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

}


