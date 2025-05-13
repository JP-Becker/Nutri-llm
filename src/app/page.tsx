"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Send, User, Bot } from "lucide-react"

export default function DietPlanner() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    goal: "",
    dietaryRestrictions: "",
    workoutsPerWeek: "",
  })

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat()

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prompt inicial com as infos do usuario
    const initialPrompt = `Por favor, crie uma dieta personalizada com base nas seguintes informações:
    - Peso: ${formData.weight} kg
    - Altura: ${formData.height} cm
    - Objetivo: ${formData.goal}
    - Restrições alimentares: ${formData.dietaryRestrictions || "Nenhuma"}
    - Número de treinos por semana: ${formData.workoutsPerWeek}
    
    Por favor, forneça uma dieta detalhada com refeições para cada dia da semana, incluindo quantidades e horários.`

    // setando a mensagem inicial
    setMessages([{ id: "1", role: "user", content: initialPrompt }])

    setFormSubmitted(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-center">Planejador de Dieta IA</h1>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
        {!formSubmitted ? (
          <Card className="w-full bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription className="text-zinc-400">
                Preencha os dados abaixo para gerar sua dieta personalizada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Ex: 70"
                      className="bg-zinc-950 border-zinc-700"
                      value={formData.weight}
                      onChange={(e) => handleFormChange("weight", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Ex: 175"
                      className="bg-zinc-950 border-zinc-700"
                      value={formData.height}
                      onChange={(e) => handleFormChange("height", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Select onValueChange={(value) => handleFormChange("goal", value)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700">
                      <SelectItem value="perder_peso">Perder peso</SelectItem>
                      <SelectItem value="ganhar_massa">Ganhar massa muscular</SelectItem>
                      <SelectItem value="manter_peso">Manter peso</SelectItem>
                      <SelectItem value="melhorar_saude">Melhorar saúde geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Restrições Alimentares</Label>
                  <Textarea
                    id="dietaryRestrictions"
                    placeholder="Ex: Vegetariano, intolerância à lactose, alergia a amendoim..."
                    className="bg-zinc-950 border-zinc-700"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleFormChange("dietaryRestrictions", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workoutsPerWeek">Número de Treinos por Semana</Label>
                  <Select onValueChange={(value) => handleFormChange("workoutsPerWeek", value)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700">
                      <SelectItem value="0">0 (Sedentário)</SelectItem>
                      <SelectItem value="1-2">1-2 vezes</SelectItem>
                      <SelectItem value="3-4">3-4 vezes</SelectItem>
                      <SelectItem value="5+">5 ou mais vezes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Gerar Dieta
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
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
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Faça perguntas ou solicite ajustes na sua dieta..."
                className="flex-1 bg-zinc-800 border-zinc-700"
              />
              <Button type="submit" size="icon">
                <Send size={18} />
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
