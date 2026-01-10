"use client";

import { Archive, ArchiveIcon, ArrowBigLeft, ArrowLeft, ArrowUp, AudioLines, AudioWaveform, CheckCircle, ChevronDown, ClosedCaption, Copy, Cross, Delete, DoorClosed, Download, DownloadIcon, FileAudio, Flag, FolderClosed, GalleryVertical, Hamburger, Home, Info, LucideDelete, LucideMenu, LucideMenuSquare, LucideMessageCircleCode, Mail, Menu, MessageCircle, MessageCircleDashed, MessageCircleX, Mic, Microchip, NotebookPen, Plus, Settings, Share, Square, SquareArrowDown, Star, Stars, Stethoscope, ThumbsDown, ThumbsUp, Trash, Trash2, Voicemail, Webcam, X } from "lucide-react";
import { Input } from "@/app/Components/lightswind/input";
import { useEffect, useRef, useState } from "react";
import Logo from "../../public/assets/logo.jpg";
import Image from "next/image";
import RevealBar from "@/app/Components/RevealBar";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/app/Components/lightswind/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/app/Components/lightswind/hover-card";
import TextType from "@/app/Components/TextType";
import { data, useLocation } from "react-router-dom";
import { rules, Rule } from "@/app/rules";
import { downloadConversation } from "@/app/Components/DownloadConversation";

import { RevealCard, RevealCardContent, RevealCardTrigger } from "@/app/Components/reveal-card";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/app/Components/lightswind/collapsible";
import SpotlightCard from "@/app/Components/Spotlight";
import { DotBackground } from "@/app/Components/lightswind/grid-dot-background";
import DivlabSpaceLogin from "@/app/Components/DivlabSpaceLogin";
import DivlabSpaceSignUp from "@/app/Components/DivlabSpaceSignUp";
import PageLoader from "@/app/Components/pageLoader";
import PageLoader1 from "@/app/Components/pageLoader1";
import { TopLoader } from "@/app/Components/lightswind/top-loader";
import AnimatedBubbleParticles from "@/app/Components/lightswind/animated-bubble-particles";
import { AuroraBackground } from "@/app/Components/lightswind/aurora-background";
import AuroraShader from "@/app/Components/lightswind/aurora-shader";
import ChatConversation from "@/app/Components/ChatConversation";
import { copyConversation } from "@/app/Components/CopyConversation";
import { Span } from "next/dist/trace";
import CallUI from "@/app/Components/CallUI";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

type Request = {
    id: number;
    user: string;
    receiver: String;
    message: string;
    answer?: string;
    files: File[];
    score: number;
};

type Requests = {
    id: number;
    input: string;
    request: Request[];
    reqScore: number;
    archived: boolean;
    deleted: boolean;
    warned: boolean;
    ephemeral: boolean;
    convId: number;
};

type NewFile = {
    id: number;
    file: File;
}

type Gallery = {
    message: NewFile[];
    answer: NewFile[];

};

type ImageGroup = {
    id: number;
    value: boolean;

};

type UpdateType = {
    value?: string;
    Data?: boolean;
    val?: number
}

type Props = {
    session: Session | null;
}
interface Context {
    lastRule?: string;
    [key: string]: any;
}

// export default function DivlabAi({ session }: Props) {
export default function DivlabAi( { session }: Props) {

    const nextGroupId = useRef(0);
    const [instance, setInstance] = useState<number | null>(null);
    const [value, setValue] = useState("");
    const [zommImage, setZoomImage] = useState<boolean>(false);
    const [selected, setSelected] = useState("");
    const [message, setMessage] = useState<string>("");
    const [waiting, setWaiting] = useState(false);
    const [answer, setAnswer] = useState<string>("");
    const [side, setSide] = useState("close");
    const [messaging, setMessaging] = useState(false);
    const [thinking, setThinking] = useState(false);
    const [request, setRequest] = useState<Request[]>([]);
    const [requests, setRequests] = useState<Requests[]>([]);
    const [galleryAble, setGalleryAble] = useState<boolean>();
    const [gallery, setGallery] = useState<Gallery>({ message: [], answer: [] });
    const [recording, setRecording] = useState(false);
    const [listening, setListening] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [chat, setChat] = useState<string[]>([]);
    const [context, setContext] = useState<Context>({});
    const [files, setFiles] = useState<File[]>([]);
    const [score, setScore] = useState<number>(0)
    const [reqScore, setReqScore] = useState<number>(0)
    const [group, setGroup] = useState<ImageGroup[]>([{ id: nextGroupId.current, value: true }])
    const [createNewDivlabSpace, setCreateNewDivlabSpace] = useState<boolean>(false)
    const [sign, setSign] = useState<boolean>(true)
    const [archived, setArchived] = useState<boolean>(false)
    const [deleted, setDeleted] = useState<boolean>(false)
    const [warned, setWarned] = useState<boolean>(false)
    const [signValid, setSignValid] = useState<boolean>(false)
    const [currentConv, setCurrentConv] = useState<string>("");
    const [showArchive, setShowArchive] = useState<boolean>(false);
    const [ephemeral, setEphemeral] = useState<boolean>(false);
    const [camera, setCamera] = useState<boolean>(false);
    const nextId = useRef(0);
    const [groupedImages, setGroupedImages] = useState<File[][]>([]); // Store images grouped in sets of four
    // 👈 compteur auto-incrément

    let instanceId: number = 0;

    if (instance == null) {
        instanceId = 0;
    } else {
        instanceId = instance;
    }

    const text = [
        "Ques-ce qui vous interesse aujourdh'ui ?",
        "Comment puis-je vous aider",
        "De quoi allons nous parler ?",
        "A vous la parole"
    ]
    const textId = useRef(0)

    const MAX_FILES = 7;

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 5 MB

    const [isLoading, setIsLoading] = useState(false);


    // Charger les messages au démarrage
    useEffect(() => {
        fetch("/api/handledata")
            .then(res => res.json())

            .then(data => setRequests(data));

    }, []);

    // Envoyer un message
    const sendMessage = async (Data: Requests) => {
        const res = await fetch("/api/handledata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Data),
        });

        const newMsg = await res.json();

    };

    const updateMessage = async (Data: Request) => {
        const res = await fetch("/api/handledata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request: Data, index: requests[instanceId].id }),
        });

        const newMsg = await res.json();

    };



    const UpdateSetting = async ({ value, Data, val }: UpdateType) => {
        const res = await fetch("/api/handledata", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: value, Data: Data, val: val, index: requests[instanceId].id }),
        });

        const newMsg = await res.json();

    };

    // const location = useLocation();

    // useEffect(() => {
    //     setIsLoading(true);
    //     // Hide loader after route change completes
    //     const timer = setTimeout(() => {
    //         setIsLoading(false);
    //     }, 500);

    //     return () => clearTimeout(timer);
    // }, [location.pathname]);

    const normalize = (txt: string) => txt.trim().toLowerCase();

    const matchRule = (rule: Rule, input: string): boolean => {
        const txt = normalize(input);
        if (rule.match.type === "regex") {
            return new RegExp(rule.match.pattern, "i").test(txt);
        }
        if (rule.match.type === "contains") {
            return txt.includes(rule.match.pattern.toLowerCase());
        }
        return false;
    };


    const chooseRule = (input: string, ctx: Context): Rule | null => {
        const sorted = [...rules].sort((a, b) => b.priority - a.priority);
        for (const r of sorted) {
            if (matchRule(r, input)) return r;
        }
        return null;
    };

    const Model = (message: string) => {
        let NewAnswer = ""
        if (message.includes("bonjour")) {
            NewAnswer = "Merci, bonjour j'espere que tu vas bien ?"
            setAnswer(NewAnswer);
        } else if (message.includes("prix")) {
            NewAnswer = "Nos prix sont tres varies"
            setAnswer(NewAnswer);
        } else if (message.includes("Divlab")) {
            NewAnswer = "Divlab est une agence de dev web "
            setAnswer(NewAnswer);
        } else {
            NewAnswer = "Desole, votre reponse ne figure pas dans notre catalogue"
            setAnswer(NewAnswer);
        }

        return NewAnswer
    }

    const handleGallery = () => {
        setGalleryAble(true);
        setValue("");
        setMessage("");
        setRequest([]);
        setMessaging(false);
        setInstance(null);
        setSide("close");
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && value.trim() !== "" && thinking == false) {
            handleMessage(value)
            setValue(""); // vide l'input après envoi
        }
    };

    const handleNewNote = () => {
        setGalleryAble(false);
        setValue("");
        setMessage("");
        setRequest([]);
        setMessaging(false);
        setInstance(null);
        setSide("close")
        setArchived(false)
        setDeleted(false)
        setWarned(false)
        setReqScore(0)
        setEphemeral(false)
    }

    const handleNewEphemeralNote = (eph: string) => {
        setGalleryAble(false);
        setInstance(null);
        setValue("");
        setMessage("");
        setRequest([]);
        setSide("close");
        setMessaging(false);
        if (eph == "on") {
            setEphemeral(true)
        } else {
            setEphemeral(false)
        }

    }

    // ref pour lire la liste de messages actuelle depuis les callbacks asynchrones
    const messagesRef = useRef(request);
    useEffect(() => {
        messagesRef.current = request;
    }, [request]);

    // appelé par TextType quand une animation de message se termine.
    // on vérifie si ce message fini est bien le dernier message actuel avant d'arrêter thinking.
    const handleBotFinished = (messageId?: number) => {
        const list = messagesRef.current;
        const last = list[list.length - 1];
        if (last && String(last.id) === String(messageId)) {
            setThinking(false);
        }
    };

    function handleMessage(val: string) {
        // let id: number = i;

        // setThinking(true);
        let instanceId: number = 0;
        let user = session?.user?.name

        if (user == null) {
            user = "Invité"
        }
        const NewFiles: File[] = files
        const receiver: String = "ngananongni@gmail.com"

        if (instance == null || instance == -1) {

            nextId.current = 0;
            let instanceVal = requests.length;

            let inputValue: string = val
            if (inputValue == "") {
                inputValue = "Image traitment"
            }



            const newMessage = val;

            setMessage(newMessage);
            const newAnswer = Model(newMessage);
            setValue("");

            const eph: boolean = (ephemeral == true ? true : false)

            const rule = chooseRule(newMessage, context);

            setInstance(instanceVal);

            const index = requests[requests.length - 1].id;


            if (receiver == "ngananongni@gmail.com") {
                let ans = "null"
                let mess = newMessage
                if (session?.user?.email == "ngananongni@gmail.com") {

                    ans = newMessage
                    mess = "null"

                }

                const newRequest: Request = { id: nextId.current, user: user, receiver: "ngananongni@gmail.com", message: mess, answer: ans, files: NewFiles, score: score };
                const newRequestsArray: Requests = { id: index + 1, input: inputValue, request: [newRequest], reqScore: reqScore, warned: warned, deleted: deleted, archived: archived, ephemeral: eph, convId: instanceVal };

                sendMessage(newRequestsArray);

                setRequests([...requests, newRequestsArray]);
                setRequest([...request, newRequest]);

            } else {
                if (rule) {

                    const newRequest: Request = { id: nextId.current, user: user, receiver: "ngananongni@gmail.com", message: newMessage, answer: rule.action.text, files: NewFiles, score: score };
                    const newRequestsArray: Requests = { id: index + 1, input: inputValue, request: [newRequest], reqScore: reqScore, warned: warned, deleted: deleted, archived: archived, ephemeral: eph, convId: instanceVal };

                    sendMessage(newRequestsArray)

                    setRequests([...requests, newRequestsArray]);
                    setRequest([...request, newRequest]);

                    setContext((prev) => ({ ...prev, lastRule: rule.id }));
                } else {
                    const newRequest: Request = { id: nextId.current, user: user, receiver: "chatbot", message: newMessage, answer: newAnswer, files: NewFiles, score: score };
                    const newRequestsArray: Requests = { id: instanceVal, input: val, request: [newRequest], reqScore, warned: warned, deleted: deleted, archived: archived, ephemeral: eph, convId: instanceVal };
                    // sendMessage(newRequestsArray)

                    setRequests([...requests, newRequestsArray]);
                    setRequest([...request, newRequest]);
                }
            }




        } else {
            const newMessage = val;
            setMessage(newMessage);
            const newAnswer = Model(newMessage);
            setValue("");

            if (receiver == "ngananongni@gmail.com") {
                const rule = chooseRule(newMessage, context);
                instanceId = instance;
                //modifier le state avec le setter
                const AddRequest: Request = { id: nextId.current, user: user, receiver: "ngananongni@gmail.com", message: newMessage, answer: "null", files: NewFiles, score: score };

                updateMessage(AddRequest)
                setRequests(prev =>
                    prev.map(conv =>
                        conv.convId === instance
                            ? { ...conv, request: [...conv.request, AddRequest] }
                            : conv
                    )
                );

                setRequest([...request, AddRequest]);

            } else {

                const rule = chooseRule(newMessage, context);
                instanceId = instance;
                if (rule) {
                    //modifier le state avec le setter
                    const AddRequest: Request = { id: nextId.current, user: user, receiver: "chatbot", message: newMessage, answer: rule.action.text, files: NewFiles, score: score };



                    updateMessage(AddRequest)
                    setRequests(prev =>
                        prev.map(conv =>
                            conv.convId === instance
                                ? { ...conv, request: [...conv.request, AddRequest] }
                                : conv
                        )
                    );

                    setRequest([...request, AddRequest]);
                } else {
                    //modifier le state avec le setter
                    const AddRequest: Request = { id: nextId.current, user: user, receiver: "chatbot", message: newMessage, answer: newAnswer, files: NewFiles, score: score };

                    setRequests(prev =>
                        prev.map(conv =>
                            conv.id === instance
                                ? { ...conv, request: [...conv.request, AddRequest] }
                                : conv
                        )
                    );

                    setRequest([...request, AddRequest]);
                }
            }




        }


        const galleryMessageCopy = [...gallery.message]
        const galleryAnswerCopy = [...gallery.answer]

        files.forEach(file => {


            const message: NewFile = { id: instanceId, file: file }

            galleryMessageCopy.push(message)



            const answer: NewFile = { id: instanceId, file: file }

            galleryAnswerCopy.push(message)

            const galleryCopy: Gallery = { message: galleryMessageCopy, answer: galleryAnswerCopy }

            setGallery(galleryCopy)
        });


        // if (files.length > 0) {
        //         if (file.type.startsWith("image/")) {
        //             const ImageFile: File[] = [file]
        //             const src = URL.createObjectURL(file)
        //             const message = { id: instanceId, src: src, file: ImageFile }
        //             // const answer = { id: instanceId, src: src, file: ImageFile }

        //             const newImage:Images = { message: [message], answer: [] }

        //             setImages([...prev, newImage])
        //         }
        // }

        setMessaging(true);
        setFiles([]);

        nextId.current += 1; // 👈 incrémente pour la prochaine fois
    }

    const handleInstance = (ins: number) => {

        setInstance(ins)
        //copy du state
        const requestCopy = requests[ins].request;
        //manipulation de la copy du state et mis a jour avec le setter
        setRequest(requestCopy);
        setMessaging(true);
        setSide("close")
        setValue("")
        setMessage("InstanceOpen");
        setArchived(requests[instanceId].archived)
        setDeleted(requests[instanceId].deleted)
        setWarned(requests[instanceId].warned)
        setReqScore(requests[instanceId].reqScore)
        setEphemeral(requests[instanceId].ephemeral)

        if (textId.current == text.length - 1) {
            textId.current = 0
        } else {
            textId.current += 1
        }

        console.log(requests)
        console.log(ins)

    }

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [request]); // Se déclenche à chaque ajout dans requests

    const topRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [gallery]); // Se déclenche à chaque ajout dans requests


    const handleRequestImage = (id: number) => {
        const requestCopy = requests[id].request;

        setGalleryAble(false);
        setInstance(id)
        setRequest(requestCopy);
        setMessaging(true);
        setSide("close")
        setValue("")
        setMessage("InstanceOpen");

    }

    // 📂 Ajout fichiers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        // Convertir en tableau de File[]
        const newFiles = Array.from<File>(selectedFiles);

        const validFiles: File[] = [];


        Array.from(selectedFiles).forEach((file) => {
            if (file.size <= MAX_FILE_SIZE) {
                validFiles.push(file);

            } else {
                alert(`❌ Le fichier ${file.name} dépasse la taille maximale (5 Mo).`);
            }
        });




        // Fusionner + limiter à MAX_FILES
        setFiles((prev) => {
            const combined = [...prev, ...validFiles];
            if (combined.length > MAX_FILES) {
                alert(`❌ Vous ne pouvez pas télécharger plus de ${MAX_FILES} fichiers.`);
            }
            return combined.slice(0, MAX_FILES);
        });

        const Group: ImageGroup = { id: nextGroupId.current, value: true }

        setGroup([...group, Group])


        // Réinitialiser input (sinon tu ne peux pas rechoisir le même fichier)
        e.target.value = "";
        nextGroupId.current += 1
    };

    // 🎙️ Message vocal (enregistrement audio)
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                console.log("🎧 Audio enregistré :", blob);
                // envoie blob au backend
            };

            recorder.start();
            setRecording(true);
        } catch (err) {
            console.error("Erreur accès micro :", err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const renderImages = (images: File[]) => {
        const previewImages = images.slice(0, 4);
        const extraCount = images.length - 4;
        let test;

        const groupImages = () => {
            const newGroups = [];
            for (let i = 0; i < images.length; i += 4) {
                newGroups.push(images.slice(i, i + 4));
            }
            setGroupedImages(newGroups);
            // setImages([]); // Clear selected images after grouping
        };

        // if (nextGroupId.current == 0) {
        //      test = true
        // } else {
        //     test = group[request.id].value 
        // }

        return (
            <div className={`${previewImages.length == 1 ? "w-24" : "w-48 "} mt-2  `}>

                {true == true ? (
                    <div className={`grid grid-cols-2  gap-2  w-full`}>
                        {groupedImages.map((group, index) => (
                            <div key={index} className="flex space-x-4">
                                {group.map((url) => (
                                    <img key={URL.createObjectURL(url)} src={URL.createObjectURL(url)} alt="" className="w-24 h-24 object-cover" />
                                ))}
                            </div>
                        ))}
                        <button onClick={groupImages} className="mt-4 p-2 bg-blue-500 text-white rounded">
                            Group Images
                        </button>

                        {/* {previewImages.map((file, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-md shadow-lg">

                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover rounded"
                                />
                                {i === 3 && extraCount > 0 && (
                                    <button onClick={() => setGroup(prev => prev.map(gr =>  gr.id === nextGroupId.current ? { ...gr, value: false } : gr ) )} 
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold rounded">
                                        +{extraCount}
                                    </button>
                                )}
                            </div>
                        ))} */}
                    </div>
                ) : (
                    <div className={`grid grid-cols-2 gap-2  w-full `}>
                        {images.map((file, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-md shadow-lg">

                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>
                        ))}
                    </div>
                )}


            </div>
        );
    };


    type handleScoreprops = {
        index?: number;
        archivedIndex?: boolean;
        reqindex?: number;
        deletedIndex?: boolean;
        Index?: boolean;
        warnedIndex?: boolean
    };

    const handleScore = ({ index, archivedIndex, reqindex, deletedIndex, warnedIndex }: handleScoreprops) => {

        let value: number;
        let archive: boolean;
        let del: boolean;
        let warn: boolean



        if (reqindex) {
            setRequests(prev =>
                prev.map(req =>
                    req.convId === instance
                        ? {
                            ...req,
                            request: req.request.map(pref =>
                                pref.id === reqindex ? { ...pref, score: score } : pref
                            )
                        }
                        : req
                )
            );
        } else if (index) {

            if (index == 1) {

                if (requests[instanceId].reqScore == 1) {
                    value = 0
                } else {
                    value = 1
                }
                setReqScore(value);

                UpdateSetting({ value: "score", val: value });
            } else if (index == -1) {

                if (requests[instanceId].reqScore == -1) {
                    value = 0
                } else {
                    value = -1
                }
                setReqScore(value);

                UpdateSetting({ value: "score", val: value });
            } else {
                value = 0

                UpdateSetting({ value: "score", val: value });
            }

            setRequests(prev =>
                prev.map(req =>
                    req.convId === instance ? { ...req, reqScore: value } : req
                )
            );
        }

        if (archivedIndex) {

            if (archivedIndex == true) {
                if (requests[instanceId].archived == true) {
                    archive = false
                } else {
                    archive = true
                }
                setArchived(archive);

                UpdateSetting({ value: "archived", Data: archive });

            } else if (archivedIndex == false) {

                if (requests[instanceId].archived == false) {
                    archive = true
                } else {
                    archive = false
                }
                setArchived(archive);

                UpdateSetting({ value: "archived", Data: archive });
            }

            setRequests(prev =>
                prev.map(req =>
                    req.convId === instance ? { ...req, archived: archive } : req
                )
            );
        }

        if (deletedIndex) {
            if (deletedIndex == true) {
                del = true
                setDeleted(del);
                UpdateSetting({ value: "deleted", Data: del });

            } else if (deletedIndex == false) {

                if (requests[instanceId].deleted == false) {
                    del = true
                } else {
                    del = false
                }
                setDeleted(del);
                UpdateSetting({ value: "deleted", Data: del });
            }


            setRequests(prev =>
                prev.map(req =>
                    req.convId === instance ? { ...req, deleted: del } : req
                )
            );

            setMessaging(false)
            setInstance(null)
            setRequest([]);
        }

        if (warnedIndex) {
            if (warnedIndex == true) {
                if (requests[instanceId].warned == true) {
                    warn = false
                } else {
                    warn = true
                }
                setWarned(warn);

                UpdateSetting({ value: "warned", Data: warn });

            } else if (warnedIndex == false) {

                if (requests[instanceId].warned == false) {
                    warn = true
                } else {
                    warn = false
                }
                setWarned(warn);

                UpdateSetting({ value: "warned", Data: warn });
            }

            setRequests(prev =>
                prev.map(req =>
                    req.convId === instance ? { ...req, warned: warn } : req
                )
            );
        }

    }


    return (
        <div className="flex flex-col justify-between min-h-screen h-screen w-full ">

            <div className=" w-full h-1/15 bg-gray-200 flex flex-row items-center justify-center p-4 gap-1">
                <Image width={500} height={500} alt="logo" src={Logo} className="object-cover rounded-full w-6 h-6" />
                <span className="text-xl text-gray-700 font-bold ">{instance == null || instance == -1 ? "Divlab" : requests[instance].input} </span>
                <AnimatePresence >
                    {ephemeral == true && (
                        <motion.span
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -30, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="text-red-500 border-l border-l-black text-sm italic pl-2"> ( Conversation ephemere )</motion.span>
                    )}</AnimatePresence>
            </div>

            <div className="relative w-full h-14/15 flex flex-row gap-2 p-2 bg-white" >
                <AnimatePresence >
                    {side == "open" && (
                        <div className="isolate z-2 top-0 left-0 w-full h-full absolute flex flex-row">
                            <motion.div
                                initial={{ opacity: 0, x: "-100%" }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ x: "-100%", opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="z-1 w-[40%] h-full bg-black flex flex-col gap-2 px-1 justify-between items-center overflow-hidden">
                                <button onClick={() => { setSide("close") }} className="w-full h-fit flex flex-row justify-between p-2">
                                    <Image width={500} height={500} alt="logo" src={Logo} className="object-cover rounded-full w-6 h-6" />
                                    <span className="text-xl text-gray-900 font-bold">{instance == null || instance == -1 ? "Divlab" : requests[instance].input}</span>
                                    <div onClick={() => { setSide("close") }} className="rounded-md p-1 hover:bg-gray-100/40"><ArrowLeft /></div>
                                </button>
                                {session ? (
                                    <div className="h-fit flex flex-row justify-between p-5 bg-slate-900 rounded-md w-full">
                                        <div className="flex flex-row items-center justify-center gap-4">
                                            <div className="rounded-full w-10 h-10 bg-gray-500"></div>
                                            <div className="flex flex-col">

                                                <span>{session.user?.name}</span>

                                                <span>Gratuit</span>
                                            </div>
                                        </div>
                                        <Button className="bg-black/40 text-white rounded-3xl border w-fit h-fit text-center p-2">
                                            Passer a premium
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="h-fit flex flex-row justify-center p-5 bg-slate-900 rounded-md w-full">
                                        <button>Connectez vous...</button>
                                    </div>
                                )}

                                <hr />
                                <div className="h-full w-full p-2 flex flex-col relative">


                                    <div className="w-full h-fit flex flex-col  border-gray-500/50 items-start">
                                        <button onClick={() => { handleNewNote() }} className={`flex flex-row gap-2 hover:bg-gray-700/80 p-2 rounded-xl w-full`}> <NotebookPen /> Nouveau chat</button>
                                        <button onClick={() => { handleNewEphemeralNote("on") }} className={`flex flex-row gap-2 hover:bg-gray-700/80 p-2 rounded-xl w-full`}> <MessageCircleDashed /> Nouveau chat ephemere</button>
                                        <button onClick={() => { handleGallery() }} className={`flex flex-row gap-2 hover:bg-gray-700/80 p-2 rounded-xl w-full`}> <GalleryVertical />  Bibliotheque</button>
                                        <button onClick={() => { setShowArchive((prev) => prev == true ? false : true) }} className={`flex flex-row gap-2 hover:bg-gray-700/80 p-2 rounded-xl w-full`}> <ArchiveIcon />  Conversations archivées</button>

                                    </div>
                                    <AnimatePresence >
                                        {showArchive && (
                                            <motion.div
                                                initial={{ y: "-50%", opacity: 0, height: "0%" }}
                                                animate={{ y: "0%", opacity: 1, height: "auto" }}
                                                exit={{ y: "50%", opacity: 0, height: "0%" }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="w-full  h-fit items-end flex flex-col mt-2 px-4 oveflow-hidden">
                                                {/* {requests[instanceId].archived ==  ? (

                                                ) : ()} */}
                                                {
                                                    requests.map(req => (
                                                        <div key={req.id} className="w-full h-full items-end">
                                                            {req.deleted == false && req.archived == true && (
                                                                <button
                                                                    onClick={() => { handleInstance(req.convId) }}
                                                                    className=" mb-4 p-2 w-[95%] rounded-xl bg-gray-500/50 hover:bg-gray-600/40 transition-all duraion-500 hover:w-[85%] flex flex-col items-start">
                                                                    <span className="text-md text-bold">
                                                                        {req.input}
                                                                    </span>
                                                                </button>
                                                            )
                                                            }
                                                        </div>
                                                    ))
                                                }
                                            </motion.div>
                                        )}
                                    </AnimatePresence >

                                    <hr className="mt-2" />
                                    <div className="h-full w-full flex flex-col gap-3 p-2  ">
                                        <span>Chats</span>
                                        <div className="h-100 w-full px-2 overflow-auto  ">
                                            {requests.length !== 0 ? (
                                                <div className="w-full h-fit items-end flex flex-col ">
                                                    {
                                                        requests.map((req, index) => (
                                                            <div key={req.id} className="w-full h-full">
                                                                {req.deleted == false && req.archived == false && req.ephemeral == false && (
                                                                    <button
                                                                        onClick={() => { handleInstance(index) }}
                                                                        className=" mb-4 p-2 w-full rounded-xl bg-gray-500/50 hover:bg-gray-600/40 transition-all duraion-500 hover:w-[95%] flex flex-col items-start">
                                                                        <span className="text-md text-bold">
                                                                            {req.input}
                                                                        </span>
                                                                    </button>
                                                                )
                                                                }
                                                            </div>
                                                        ))
                                                    }
                                                </div>


                                            ) : (
                                                <div className="text-gray-300 flex flex-col gap-4 items-center italic">
                                                    <span>Aucune conversation </span>
                                                    <button className="p-2 bg-gray-300/60 w-fit h-fit rounded-3xl text-black">Reesayer</button>
                                                </div>
                                            )}
                                        </div>



                                    </div>
                                    <div className="flex flex-row items-center justify-center absolute bottom-0 left-0 w-full h-fit bg-slate-500 py-2">
                                        <button onClick={() => signOut()} className="cursor-pointer p-3 rounded-lg bg-black text-white font-bold text-md">
                                            Se Deconnecter
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.button
                                onClick={() => { setSide("close") }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="z-0 bg-black/40 w-full  h-full absolute top-0">

                            </motion.button>
                        </div>


                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {!createNewDivlabSpace && (
                        <motion.div
                            initial={{ opacity: 0, width: "0%" }}
                            animate={{ opacity: 1, width: "100%" }}
                            exit={{ opacity: 0, width: "0%" }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="relative w-full h-full bg-zinc-800 rounded-t-3xl items-end flex flex-col justify-end">

                            <div className="z-1 top-0 left-0 w-full h-20 flex flex-row justify-between items-center p-4 bg-linear-to-b from-zinc-800 via-zinc-800 to-transparent absolute  rounded-t-3xl">
                                <div className="flex flex-row gap-5 items-center ">
                                    <button onClick={() => { setSide("open") }} className="hover:bg-white/20 rounded-lg p-2">
                                        <Menu />
                                    </button>

                                    {messaging == true ? (
                                        <div className="w-fit h-fit">
                                            {session ?
                                                (
                                                    <div>{session.user?.name}</div>
                                                ) : (
                                                    <Collapsible className="" >
                                                        <CollapsibleTrigger asChild>
                                                            <div className="flex flex-row gap-1 items-center text-xl font-medium cursor-pointer hover:-translate-x-px hover:translate-y-px transition-all  p-2 hover:bg-white/30 rounded-xl"><span>Divlab AI</span> <ChevronDown className="w-5 h-5 hover:-translate-y-1 transition-all " /> </div>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="absolute">
                                                            <div className="p-2 w-fit bg-slate-950/40 rounded-md space-y-2">
                                                                <div className=" border rounded-md pr-10 flex flex-col gap-1 p-2 bg-black">
                                                                    <span className="flex flex-row gap-2">DivlabAi premium <Stars fill="yellow" /> </span>
                                                                    <span className="flex flex-row gap-2 items-center text-sm">Obtenez toutes les fonctionnalites qu'offre Divlab Ai</span>
                                                                </div>
                                                                <div className=" border rounded-md pr-10 flex flex-col gap-1 p-2 bg-black">
                                                                    <span>DivlabAi gratuit </span>
                                                                    <div className="flex flex-row gap-2 items-center text-sm"> <CheckCircle className="w-4 h-4" /> <span>Utilise actuellement</span></div>
                                                                </div>
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                )

                                            }
                                        </div>

                                    ) : (
                                        <Button className="flex flex-row gap-1 items-center text-md justify-center bg-yellow-700 rounded-full p-3 font-semibold"> <Star color="yellow" fill="yellow" /> <span>Passer au premium</span>  </Button>
                                    )}
                                </div>

                                <div>
                                    {messaging == true && ephemeral == false && (
                                        <HoverCard
                                            openDelay={90}
                                            closeDelay={0}
                                        >
                                            <HoverCardTrigger asChild  >
                                                <button className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row " onClick={() => { handleNewNote() }}>
                                                    <NotebookPen />
                                                </button>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="-translate-x-[100%] text-sm">
                                                <h4 className="font-semibold whitespace-nowrap ">Demarrer une nouvelle conversation </h4>
                                            </HoverCardContent>
                                        </HoverCard>


                                    )}

                                    {messaging == false && ephemeral == false && (
                                        <HoverCard
                                            openDelay={90}
                                            closeDelay={0}

                                        >
                                            <HoverCardTrigger asChild  >
                                                <button className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row " onClick={() => { handleNewEphemeralNote("on") }}>
                                                    <MessageCircleDashed />
                                                </button>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="-translate-x-[100%] text-sm">
                                                <h4 className="font-semibold whitespace-nowrap p-[2px]  ">Demarrer une nouvelle conversation ephemere </h4>
                                            </HoverCardContent>
                                        </HoverCard>


                                    )}


                                    {ephemeral == true && (
                                        <HoverCard openDelay={90} closeDelay={0} >
                                            <HoverCardTrigger asChild  >
                                                <button className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row " onClick={() => { handleNewEphemeralNote("off") }}>

                                                    <MessageCircleX />
                                                </button>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="-translate-x-full text-sm">
                                                <h4 className="font-semibold whitespace-nowrap">Arreter la conversation ephemere</h4>
                                            </HoverCardContent>
                                        </HoverCard>
                                    )}



                                </div>
                            </div>
                            <div className={`w-full  ${messaging == true || camera == true || galleryAble == true || files.length > 0 ? "  h-full" : " h-1/2"} transition-all duration-500 ease-in-out relative overflow-auto pt-2 flex flex-col  rounded-t-xl px-15`} >
                                {/* <DotBackground className="w-full  absolute left-0" /> */}
                                <PageLoader />
                                {/* {request.map((req, i) => (<div key={i}>{req.id} + {i}</div>))} */}
                                {((message.trim() !== "" && messaging == true) || (request.length > 0 && messaging == true)) && (

                                    <ChatConversation
                                        conversationId={requests[instanceId].input}
                                        requ={requests[instanceId].request}
                                        renderImages={renderImages}
                                        bottomRef={bottomRef}
                                        setThinking={setThinking}
                                        thinking={thinking}
                                        onBotFinished={handleBotFinished}
                                    />
                                )}
                                <div ref={bottomRef} />
                                {messaging === false && galleryAble == true && (

                                    <div className={`  w-full min-h-full flex flex-row  absolute  left-0 p-2 pt-22 pb-10`}>


                                        {/* Marqueur de fin */}
                                        <div ref={topRef} />
                                        <div className="w-1/2 h-full flex flex-wrap gap-2 pr-2 border-r border-gray-500/50  ">
                                            {gallery.message.map((img, i) => (
                                                <div key={i} className="w-fit h-fit  relative flex-wrap">
                                                    <Image src={URL.createObjectURL(img.file)} height={500} width={500} alt={`img${i}`} className=" w-55 h-55  rounded-md  " />

                                                    <RevealBar setZoomImage={setZoomImage} handleRequestImage={handleRequestImage} id={img.id} src={URL.createObjectURL(img.file)} />

                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-1/2 h-full flex flex-wrap gap-2 pl-2 border-l border-gray-500/50   ">
                                            {gallery.answer.map((img, i) => (
                                                <div key={i} className="w-fit h-fit flex flex-col relative ">
                                                    <Image src={URL.createObjectURL(img.file)} height={500} width={500} alt={`img${i}`} className=" w-55 h-55  rounded-xl  " />

                                                    <RevealBar setZoomImage={setZoomImage} handleRequestImage={handleRequestImage} id={img.id} src={URL.createObjectURL(img.file)} />

                                                </div>
                                            ))}
                                        </div>


                                    </div>
                                )}
                                {camera == true && (
                                    <div className={`  w-full min-h-full flex flex-row  absolute  left-0 p-2 pt-22 pb-10`}>
                                        <CallUI />
                                    </div>
                                )}
                            </div>
                            {messaging == true && ephemeral == false && (
                                <div className=" relative flex flex-row gap-2 w-full pr-3 justify-end bg-transparent">
                                    {/* <Dock
                                        items={dockItems}
                                        position="bottom"
                                        magnification={70}
                                        baseItemSize={50}
                                    /> */}

                                    <HoverCard
                                        openDelay={90}
                                        closeDelay={0}
                                    >
                                        <HoverCardTrigger asChild  >
                                            <button title="Download" className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row hover:-translate-y-1 transition-all duration-300" onClick={() => downloadConversation(request, "ma_conversation.txt")}>
                                                <Download />
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="-translate-x-[100%] text-sm">
                                            <h4 className="font-semibold whitespace-nowrap">Telecharger la conversation </h4>
                                        </HoverCardContent>
                                    </HoverCard>

                                    <HoverCard
                                        openDelay={90}
                                        closeDelay={0}
                                    >
                                        <HoverCardTrigger asChild  >
                                            <button title="Copy" className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row hover:-translate-y-1 transition-all duration-300" onClick={() => copyConversation(request)}>
                                                <Copy />
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="-translate-x-[100%] text-sm">
                                            <h4 className="font-semibold whitespace-nowrap">Copier la conversation dans le presse papier </h4>
                                        </HoverCardContent>
                                    </HoverCard>

                                    <HoverCard
                                        openDelay={90}
                                        closeDelay={0}
                                    >
                                        <HoverCardTrigger asChild  >
                                            <button title="Avis positif" className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row hover:-translate-y-1 transition-all duration-300" onClick={() => { handleScore({ index: 1 }) }}>
                                                <ThumbsUp fill={`${requests[instanceId].reqScore == 1 ? "rgba(255,255,255,0.9)" : "none"}`} />
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="-translate-x-full text-sm">
                                            <h4 className={`font-semibold whitespace-nowrap `}>Avis positif </h4>
                                        </HoverCardContent>
                                    </HoverCard>

                                    <HoverCard
                                        openDelay={90}
                                        closeDelay={0}
                                    >
                                        <HoverCardTrigger asChild  >
                                            <button title="Avis negatif" className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row hover:-translate-y-1 transition-all duration-300" onClick={() => { handleScore({ index: -1 }) }}>
                                                <ThumbsDown fill={`${requests[instanceId].reqScore == -1 ? "red" : "none"}`} color={`${requests[instanceId].reqScore == -1 ? "red-800" : "white"}`} />
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="-translate-x-[100%] text-sm">
                                            <h4 className="font-semibold whitespace-nowrap">Avis negatif </h4>
                                        </HoverCardContent>
                                    </HoverCard>


                                    <HoverCard
                                        openDelay={90}
                                        closeDelay={0}
                                    >
                                        <HoverCardTrigger asChild  >
                                            <button title="Archiver la conversation" className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row hover:-translate-y-1 transition-all duration-300" onClick={() => { handleScore({ archivedIndex: true }) }}>
                                                <Archive fill={`${requests[instanceId].archived ? "gray" : "none"}`} />
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="-translate-x-[100%] text-sm">
                                            <h4 className="font-semibold whitespace-nowrap">Archiver la conversation </h4>
                                        </HoverCardContent>
                                    </HoverCard>


                                    <HoverCard
                                        openDelay={90}
                                        closeDelay={0}
                                    >
                                        <HoverCardTrigger asChild  >
                                            <button title="Supprimer la conversation" className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row hover:-translate-y-1 transition-all duration-300" onClick={() => { handleScore({ deletedIndex: true }) }}>
                                                <Trash2 />
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="-translate-x-[100%] text-sm">
                                            <h4 className="font-semibold whitespace-nowrap">Supprimer la conversation </h4>
                                        </HoverCardContent>
                                    </HoverCard>


                                    <HoverCard
                                        openDelay={90}
                                        closeDelay={0}
                                    >
                                        <HoverCardTrigger asChild  >
                                            <button title="Signaler/ Avertir" className="hover:bg-white/20 rounded-lg p-2 items-center flex flex-row hover:-translate-y-1 transition-all duration-300" onClick={() => { handleScore({ warnedIndex: true }) }}>
                                                <Flag fill={`${requests[instanceId].warned == true ? "red" : "none"}`} />
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="-translate-x-[100%] text-sm">
                                            <h4 className="font-semibold whitespace-nowrap">{warned}Signaler/ Avertir</h4>
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                            )}


                            <div
                                // initial={{ height: "1/2" }}
                                // animate={{ height: "fit" }}
                                // transition={{ duration: 0.4, ease: "easeInOut" }}
                                className={` w-full py-10 grow  p-4 px-50 flex flex-col justify-start items-center gap-5`}>

                                {ephemeral == true && messaging == false ? (<div className="flex flex-col items-center gap-5"><span className="text-4xl font-semibold">Conversation ephemere</span><p className="text-md text-gray-500">Vous etes actuellement dans une conversation ephemere, elle sera effacee lorsque vous y sortirez.</p></div>)
                                    : (<span className="text-4xl font-semibold">{messaging == false && text[textId.current]} </span>)}
                                {ephemeral == true && messaging == true && (<span className="text-md text-gray-500">Conversation ephemere</span>)}
                                <div className={`isolate w-full h-auto ${files.length == 0 ? "rounded-full " : "rounded-xl"} backdrop-blur-xl bg-white/15 text-sm relative flex flex-col items-center`}>

                                    <div className="flex flex-row gap-2 w-full  rounded-md h-auto  items-center  overflow-auto " >
                                        {files.map((file, index) => (
                                            <div key={index} className="relative  border h-fit flex items-center m-2 p-2 rounded-xl">
                                                {/* Bouton pour supprimer l'image */}
                                                <button
                                                    title="Supprimer le fichier"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>

                                                {/* Si c’est une image */}
                                                {file.type.startsWith("image/") ? (
                                                    <div className="w-32 h-32 ">
                                                        <Image
                                                            width={500}
                                                            height={500}
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="w-32 h-32 object-cover rounded-xl"
                                                        />
                                                    </div>

                                                ) : (
                                                    <a
                                                        href={URL.createObjectURL(file)}
                                                        download={file.name}
                                                        className="text-blue-500 underline "
                                                    >
                                                        📄 {file.name}
                                                    </a>
                                                )}

                                            </div>
                                        ))}


                                    </div>
                                    {files.length > 0 && (
                                        <p className="text-sm text-gray-700 m-[1px]">
                                            {files.length}/{MAX_FILES} fichiers sélectionnés
                                        </p>
                                    )}

                                    <div className=" w-full h-auto rounded-full  relative flex flex-row items-center justify-center text-sm">
                                        <div className="z-1 absolute left-3 top-1/2 -translate-y-1/2 items-center flex flex-row">
                                            <HoverCard
                                                openDelay={90}
                                                closeDelay={0}
                                            >

                                                <HoverCardTrigger asChild  >
                                                    <label htmlFor="file-upload" className="rounded-full hover:bg-black/20 p-2 cursor-pointer flex flex-row items-center justify-center" title="Add files">
                                                        <Plus className="" />
                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            multiple
                                                            className="hidden"
                                                            onChange={handleFileUpload}
                                                            aria-label="Upload files"
                                                        />
                                                    </label>

                                                </HoverCardTrigger>


                                                <HoverCardContent className="">
                                                    <h4 className="font-semibold whitespace-nowrap">Ajoutez plus de fichiers ( images, video, documents ...)</h4>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                        {value.trim() === "" && thinking == false && files.length == 0 ? (
                                            <div className="z-1 absolute right-4 top-1/2 -translate-y-1/2 flex  flex-row items-center gap-2 ">

                                                <HoverCard
                                                    openDelay={90}
                                                    closeDelay={0}
                                                >

                                                    <HoverCardTrigger asChild  >

                                                        <button
                                                            onMouseDown={startRecording}
                                                            onMouseUp={stopRecording}
                                                            className={`p-2 rounded-full ${recording ? "bg-red-500 text-white" : "text-gray-300"
                                                                } cursor-pointer`}
                                                        >
                                                            <Mic />
                                                        </button>


                                                    </HoverCardTrigger>


                                                    <HoverCardContent className="">
                                                        <h4 className="font-semibold whitespace-nowrap">Vocal</h4>
                                                    </HoverCardContent>
                                                </HoverCard>



                                                <HoverCard
                                                    openDelay={90}
                                                    closeDelay={0}
                                                >

                                                    <HoverCardTrigger asChild  >
                                                        <button title="Mode vocal" className=" rounded-full bg-black/20 p-2 cursor-pointer">
                                                            <AudioWaveform />
                                                        </button>

                                                    </HoverCardTrigger>


                                                    <HoverCardContent className="">
                                                        <h4 className="font-semibold whitespace-nowrap">Mode vocal</h4>
                                                    </HoverCardContent>
                                                </HoverCard>

                                                <HoverCard
                                                    openDelay={90}
                                                    closeDelay={0}
                                                >

                                                    <HoverCardTrigger asChild  >
                                                        <button title="Mode visuel" className=" rounded-full bg-black/20 p-2 cursor-pointer" onClick={() => setCamera(prev => (prev == true ? false : true))}>
                                                            <Webcam />
                                                        </button>

                                                    </HoverCardTrigger>


                                                    <HoverCardContent className="">
                                                        <h4 className="font-semibold whitespace-nowrap">Mode visuel</h4>
                                                    </HoverCardContent>
                                                </HoverCard>

                                            </div>
                                        ) : (
                                            <div className="z-1 absolute right-4 top-1/2 -translate-y-1/2 flex  flex-row items-center gap-2 ">


                                                <HoverCard
                                                    openDelay={90}
                                                    closeDelay={0}
                                                >

                                                    <HoverCardTrigger asChild  >
                                                        <button className=" rounded-full hover:bg-black/20 p-2 cursor-pointer" title="Microphone">
                                                            <Mic />
                                                        </button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="">
                                                        <h4 className="font-semibold whitespace-nowrap">Vocal</h4>
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {thinking !== true && (value !== "" || files.length !== 0) ? (
                                                    <button title="Envoyer" onClick={() => { handleMessage(value) }} className=" rounded-full bg-white/80 p-2 cursor-pointer text-black">
                                                        <ArrowUp className="" />
                                                    </button>
                                                ) : (
                                                    <button title="Arrêter" type="submit" onClick={() => { setThinking(false) }} className=" rounded-full bg-white/80 p-2 cursor-pointer text-black">
                                                        <Square fill="black" className="rounded-md" />
                                                    </button>
                                                )}


                                            </div>
                                        )}


                                        <Input type="text" value={value} onKeyDown={handleKeyDown} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)} className="z-0   w-full h-full rounded-full pl-15 border-none h-15" placeholder="Poser une question " />

                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            {/* 
                <div className="w-2/11 relative h-full rounded-t-3xl flex flex-col gap-2">
                    <div className=" w-full h-20 flex flex-row justify-center items-center p-4 bg-blue-500   rounded-t-3xl">
                        <div className="text-xl text-gray-800 font-semibold">Divlab space</div>

                    </div>
                    <div className="isolate relative h-100 w-full border bg-gray-600 flex items-center justify-center rounded-xl overflow-hidden ">
                        <DotBackground className="w-full h-full z-0 " />
                        <button className="btn btn-accent rounded-lg z-1" onClick={() => setCreateNewDivlabSpace(true)}>Creer votre Divlab space</button>
                        <span className="z-1 absolute text-center bottom-1 text-sm text-gray-500 flex flex-row gap-1 items-center cursor-pointer " ><Info className="w-4 h-4" />C'est quoi un Divlab ?</span>
                    </div>
                    <div className="h-full w-full border bg-gray-300 rounded-xl flex flex-col items-center justify-center p-2 gap-2">

                    </div>
                </div>

                {createNewDivlabSpace && (
                    <div className="overflow-hidden w-9/11 relative h-full rounded-t-3xl  flex-col gap-2 flex items-center justify-center">

                        <AnimatePresence  >

                            {sign ? (
                                <motion.div
                                    initial={{ width: "0%", height: "0%", borderRadius: "100%", opacity: 0 }}
                                    animate={{ width: "100%", height: "100%", borderRadius: "100%", opacity: 1 }}
                                    exit={{ width: "0%", borderRadius: "100%", opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeIn" }}
                                    className="w-9/11 relative h-full rounded-t-3xl flex flex-col gap-2">

                                    <DivlabSpaceSignUp setSign={setSign} setSignValid={setSignValid} />

                                </motion.div>
                            ) :
                                (
                                    <motion.div
                                        initial={{ width: "0%", height: "0%", borderRadius: "100%", opacity: 0 }}
                                        animate={{ width: "100%", height: "100%", borderRadius: "100%", opacity: 1 }}
                                        exit={{ width: "0%", borderRadius: "100%", opacity: 0 }}
                                        transition={{ duration: 0.9, ease: "easeIn" }}
                                        className="w-9/11 relative h-full rounded-full flex flex-col gap-2">

                                        <DivlabSpaceLogin setSign={setSign} setSignValid={setSignValid} setIsLoading={setIsLoading} />
                                    </motion.div>
                                )}

                        </AnimatePresence  >
                    </div>
                )} */}
            </div >
            
        </div >);
}
