"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Bot, Send } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: string
  content: string
}

interface ChatPageProps {
  messages: Message[]
  input: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

export function ChatPage({ messages, input, onInputChange, onSubmit, isLoading }: ChatPageProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`p-1 rounded-full ${message.role === "user" ? "bg-green-600" : "bg-zinc-700"}`}>
                {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-3 rounded-lg ${message.role === "user" ? "bg-green-700" : "bg-zinc-800"}`}>
                <div className="whitespace-pre-wrap">
                  {message.role === "assistant" ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={onInputChange}
          placeholder="Faça perguntas ou solicite ajustes..."
          className="flex-1 bg-zinc-800 border-zinc-700"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send size={18} />
        </Button>
      </form>
    </>
  )
}