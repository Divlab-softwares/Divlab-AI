import { prisma } from "@/app/Components/lib/prisma";
import {hash} from "bcryptjs"
import { NextResponse } from "next/server";


// GET → liste tous les messages
export async function GET() {
    try {
        const messages = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
        });

        console.log("📥 GET messages:", messages);

        return NextResponse.json(messages, { status: 200 });
    } catch (error: any) {
        console.error("❌ Erreur GET /api/message:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}


// POST → ajoute un message
export async function POST(req: Request) {
   
    try {
        const body = await req.json();
        console.log("📤 POST reçu:", body);
        const hashedPassword = await hash(body.password, 10)

        // Vérif champs obligatoires
        if (!body.name || !body.email) {
            return NextResponse.json(
                { error: "email et mot de passe sont requis" },
                { status: 400 }
            );
        }

        const newMsg = await prisma.user.create({
            data: { name: body.name, email: body.email, password: hashedPassword },
        });

        console.log("✅ Message inséré:", newMsg);

        return NextResponse.json(newMsg, { status: 201 });
    } catch (error: any) {
        console.error("❌ Erreur POST /api/message:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
