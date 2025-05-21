"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Send, User, Bot, Dumbbell, Apple } from "lucide-react"
import { chatService } from "./services/chatService"
import ReactMarkdown from 'react-markdown'

type Screen = 'welcome' | 'dietForm' | 'workoutForm' | 'chat'
type UserChoice = 'diet' | 'workout' | null

export default function FitnessApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome')
  const [userChoice, setUserChoice] = useState<UserChoice>(null)

  const [formDataDiet, setFormDataDiet] = useState({
    weight: "",
    height: "",
    goal: "",
    dietaryRestrictions: "",
    workoutsPerWeek: "",
    mealsPerDay: "",
  })

  // Estado para o formulário de treino (será definido depois)
  const [formDataWorkout, setFormDataWorkout] = useState({
    mainGoal: "",
    experienceLevel: "",
    trainingFrequency: "",
    trainingLocation: "",
    physicalRestrictions: "",
    focusMuscleGroups: "",
    otherObservations: "",
  })

  const { messages, input, handleInputChange, setInput, handleSubmit: handleChatSubmitHook, setMessages, isLoading } = useChat({
    // A API route do useChat será configurada posteriormente se necessário para interações contínuas.
    // Por agora, a chamada inicial é feita via chatService.
  })

  const handleFormChangeDiet = (field: string, value: string) => {
    setFormDataDiet((prev) => ({ ...prev, [field]: value }))
  }

  const handleFormChangeWorkout = (field: string, value: string) => {
    setFormDataWorkout((prev) => ({ ...prev, [field]: value }))
  }

  const handleWelcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userChoice === 'diet') {
      setCurrentScreen('dietForm')
    } else if (userChoice === 'workout') {
      setCurrentScreen('workoutForm')
    }
  }

  const handleDietFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const initialPrompt = `Por favor, crie uma dieta personalizada com base nas seguintes informações:
    - Peso: ${formDataDiet.weight} kg
    - Altura: ${formDataDiet.height} cm
    - Objetivo: ${formDataDiet.goal}
    - Observações ou Restrições alimentares: ${formDataDiet.dietaryRestrictions || "Nenhuma"}
    - Número de treinos por semana: ${formDataDiet.workoutsPerWeek}
    - Número de refeições desejadas na dieta por dia: ${formDataDiet.mealsPerDay}
    
    Por favor, forneça uma dieta detalhada com refeições para cada dia da semana, incluindo quantidades e horários.`

    const data = await chatService(messages, initialPrompt) // Passando messages vazio na primeira chamada
    setMessages([{ id: "user-1", role: "user", content: initialPrompt}, 
      { id: "assistant-1", role: "assistant", content: data.response }])
    setCurrentScreen('chat')
  }

  const handleWorkoutFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Prompt para treino será construído aqui
    const initialPrompt = `Por favor, crie um plano de treino personalizado com base nas seguintes informações:
    - Objetivo principal: ${formDataWorkout.mainGoal}
    - Nível de experiência: ${formDataWorkout.experienceLevel}
    - Frequência semanal de treinos: ${formDataWorkout.trainingFrequency}
    - Local de treino: ${formDataWorkout.trainingLocation}
    - Restrições físicas ou lesões: ${formDataWorkout.physicalRestrictions || "Nenhuma"}
    - Grupos musculares que deseja focar: ${formDataWorkout.focusMuscleGroups || "Nenhum específico"}
    - Outras observações: ${formDataWorkout.otherObservations || "Nenhuma"}

    Por favor, forneça um plano de treino detalhado.`;

    const data = await chatService(messages, initialPrompt); // Passando messages vazio na primeira chamada
    setMessages([{ id: "user-initial-workout", role: "user", content: initialPrompt },
                 { id: "assistant-initial-workout", role: "assistant", content: data.response }]);
    setCurrentScreen('chat');
};


  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevenir o comportamento padrão do formulário
    // Usar o input atual para a nova mensagem do usuário
    const userMessageContent = input; 
    if (!userMessageContent.trim()) return; // Não enviar mensagens vazias

    // Adiciona a mensagem do usuário otimisticamente
    const newUserMessage = { 
      id: `user-${messages.length + 1}`, 
      role: 'user' as const, 
      content: userMessageContent 
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput(''); // Limpa o input após o envio

    // Chama o serviço de chat com todas as mensagens, incluindo a nova do usuário
    const data = await chatService(updatedMessages, userMessageContent);

    // Adiciona a resposta do assistente
    setMessages(prevMessages => [
      ...prevMessages, 
      { 
        id: `assistant-${prevMessages.length + 1}`, 
        role: 'assistant' as const, 
        content: data.response 
      }
    ]);
  }


  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-center">Fitness GPT</h1>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
        {currentScreen === 'welcome' && (
          <Card className="w-full bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Bem-vindo ao Fitness GPT!</CardTitle>
              <CardDescription className="text-zinc-400 text-center text-lg pt-2">
                Você deseja montar um treino ou uma dieta?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWelcomeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userChoice" className="text-md">Escolha uma opção:</Label>
                  <Select onValueChange={(value) => setUserChoice(value as UserChoice)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700 text-lg py-6">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700 text-zinc-100">
                      <SelectItem value="diet" className="text-lg py-3">
                        <div className="flex items-center gap-2">
                          <Apple size={20} /> <span>Montar Dieta</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="workout" className="text-lg py-3">
                        <div className="flex items-center gap-2">
                          <Dumbbell size={20} /> <span>Montar Treino</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full text-lg py-6" disabled={!userChoice}>
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentScreen === 'dietForm' && (
        // Formulário de dieta
          <Card className="w-full bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle>Informações para Dieta</CardTitle>
              <CardDescription className="text-zinc-400">
                Preencha os dados abaixo para gerar sua dieta personalizada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDietFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Peso */}
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Ex: 70"
                      className="bg-zinc-950 border-zinc-700"
                      value={formDataDiet.weight}
                      onChange={(e) => handleFormChangeDiet("weight", e.target.value)}
                      required
                      min={40}
                      max={200}
                    />
                  </div>

                  {/* Altura */}
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Ex: 175"
                      className="bg-zinc-950 border-zinc-700"
                      value={formDataDiet.height}
                      onChange={(e) => handleFormChangeDiet("height", e.target.value)}
                      required
                      min={100}
                      max={220}
                    />
                  </div>
                </div>

                {/* Objetivo */}
                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Select onValueChange={(value) => handleFormChangeDiet("goal", value)} required>
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

                {/* Observações sobre rotina/estilo de vida ou Restrições Alimentares */}
                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Observações sobre rotina/estilo de vida ou Restrições Alimentares</Label>
                  <Textarea
                    id="dietaryRestrictions"
                    placeholder="Ex: Trabalha no turno da noite, ingere muito álcool, é vegetariano ou vegano, etc..."
                    className="bg-zinc-950 border-zinc-700"
                    value={formDataDiet.dietaryRestrictions}
                    onChange={(e) => handleFormChangeDiet("dietaryRestrictions", e.target.value)}
                  />
                </div>

                {/* Número de Treinos por Semana */}
                <div className="space-y-2">
                  <Label htmlFor="workoutsPerWeek">Número de Treinos por Semana</Label>
                  <Select onValueChange={(value) => handleFormChangeDiet("workoutsPerWeek", value)} required>
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

                {/* Número de Refeições Desejadas na Dieta por Dia */}
                <div className="space-y-2">
                  <Label htmlFor="mealsPerDay">Número de Refeições Desejadas na Dieta por Dia</Label>
                  <Select onValueChange={(value) => handleFormChangeDiet("mealsPerDay", value)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue placeholder="Selecione o número de refeições" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700">
                      <SelectItem value="4">4 refeições</SelectItem>
                      <SelectItem value="5">5 refeições</SelectItem>
                      <SelectItem value="6">6 refeições</SelectItem>
                      <SelectItem value="7">7 refeições</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Gerar Dieta
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentScreen === 'workoutForm' && (
          // Formulário de Treino 
          <Card className="w-full bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle>Informações para Treino</CardTitle>
              <CardDescription className="text-zinc-400">
                Preencha os dados abaixo para gerar seu treino personalizado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWorkoutFormSubmit} className="space-y-4">
                {/* Objetivo Principal */}
                <div className="space-y-2">
                  <Label htmlFor="mainGoal">Objetivo Principal</Label>
                  <Select onValueChange={(value) => handleFormChangeWorkout("mainGoal", value)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue placeholder="Selecione seu objetivo principal" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700">
                      <SelectItem value="ganhar_massa">Ganhar massa muscular</SelectItem>
                      <SelectItem value="perder_gordura">Perder gordura</SelectItem>
                      <SelectItem value="ganhar_forca">Ganhar força</SelectItem>
                      <SelectItem value="melhorar_resistencia">Melhorar resistência muscular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nível de Experiência */}
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Nível de Experiência</Label>
                  <Select onValueChange={(value) => handleFormChangeWorkout("experienceLevel", value)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue placeholder="Selecione seu nível de experiência" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700">
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequência Semanal de Treinos */}
                <div className="space-y-2">
                  <Label htmlFor="trainingFrequency">Frequência Semanal de Treinos</Label>
                  <Select onValueChange={(value) => handleFormChangeWorkout("trainingFrequency", value)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700">
                      <SelectItem value="1-2">1-2 vezes</SelectItem>
                      <SelectItem value="3-4">3-4 vezes</SelectItem>
                      <SelectItem value="5+">5 ou mais vezes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Local de Treino */}
                <div className="space-y-2">
                  <Label htmlFor="trainingLocation">Local de Treino</Label>
                  <Select onValueChange={(value) => handleFormChangeWorkout("trainingLocation", value)} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue placeholder="Selecione o local de treino" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-700">
                      <SelectItem value="academia">Academia</SelectItem>
                      <SelectItem value="em_casa">Em Casa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Restrições Físicas ou Lesões */}
                <div className="space-y-2">
                  <Label htmlFor="physicalRestrictions">Restrições Físicas ou Lesões</Label>
                  <Textarea
                    id="physicalRestrictions"
                    placeholder="Ex: Dor no joelho, hérnia de disco, etc."
                    className="bg-zinc-950 border-zinc-700"
                    value={formDataWorkout.physicalRestrictions}
                    onChange={(e) => handleFormChangeWorkout("physicalRestrictions", e.target.value)}
                  />
                </div>

                {/* Grupos Musculares que Deseja Focar (Opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="focusMuscleGroups">Grupos Musculares que Deseja Focar (Opcional)</Label>
                  <Input
                    id="focusMuscleGroups"
                    type="text"
                    placeholder="Ex: Peito e Tríceps, Pernas, etc."
                    className="bg-zinc-950 border-zinc-700"
                    value={formDataWorkout.focusMuscleGroups}
                    onChange={(e) => handleFormChangeWorkout("focusMuscleGroups", e.target.value)}
                  />
                </div>

                {/* Outras Observações (Opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="otherObservations">Outras Observações (Opcional)</Label>
                  <Textarea
                    id="otherObservations"
                    placeholder="Ex: Preferência por treinos mais curtos, equipamentos disponíveis em casa, etc."
                    className="bg-zinc-950 border-zinc-700"
                    value={formDataWorkout.otherObservations}
                    onChange={(e) => handleFormChangeWorkout("otherObservations", e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Gerar Treino
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentScreen === 'chat' && (
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

            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Faça perguntas ou solicite ajustes..."
                className="flex-1 bg-zinc-800 border-zinc-700"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send size={18} />
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
