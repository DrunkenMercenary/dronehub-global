"use client"

import { useState, useEffect, useRef } from "react"
import { sendMessage } from "@/app/actions/message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, Zap, ShieldCheck } from "lucide-react"

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: Date
    sender: {
        email: string
        role: string
    }
}

interface ChatThreadProps {
    threadId: string
    currentUserId: string
    initialMessages: Message[]
}

export function ChatThread({ threadId, currentUserId, initialMessages }: ChatThreadProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState("")
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    async function handleSend() {
        if (!input.trim() || isSending) return

        setIsSending(true)
        const content = input
        setInput("")

        try {
            const result = await sendMessage(threadId, currentUserId, content)
            if (result.success && result.message) {
                setMessages(prev => [...prev, {
                    ...result.message!,
                    createdAt: new Date(result.message!.createdAt),
                    sender: { id: currentUserId, email: "pilot@dronehub.global", role: "OPERATOR" }
                } as any])
            } else if (result.error) {
                alert(result.error)
                // Restore input on error
                setInput(content)
            }
        } catch (error) {
            console.error("Chat Error:", error)
            alert("Message failed to send.")
            setInput(content)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] rounded-2xl bg-[#18222e] border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
            {/* Chat Header */}
            <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#5BC2E7]/10 flex items-center justify-center border border-[#5BC2E7]/20">
                        <Zap className="w-5 h-5 text-[#5BC2E7]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Messages</h3>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Messages about this job</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#5BC2E7]/10 border border-[#5BC2E7]/20">
                    <ShieldCheck className="w-3 h-3 text-[#5BC2E7]" />
                    <span className="text-[8px] font-bold text-[#5BC2E7] uppercase tracking-[0.2em]">Connected</span>
                </div>
            </div>

            {/* Message Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                        <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                            <Send className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] space-y-1.5 ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${isMe
                                        ? "bg-[#5BC2E7] text-[#0f1722] rounded-tr-none shadow-lg shadow-[#5BC2E7]/10"
                                        : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-black/20 border-t border-white/5">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-4"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-[#0f1722] border-white/5 h-14 text-white font-medium placeholder:text-gray-700 focus:border-[#5BC2E7]/50 rounded-xl"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className="h-14 w-14 bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] rounded-xl shadow-xl shadow-[#5BC2E7]/10 flex items-center justify-center shrink-0 transition-transform active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
