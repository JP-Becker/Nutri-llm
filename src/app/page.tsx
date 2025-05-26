"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { chatService } from "./services/chatService"
import { LoadingOverlay } from "@/components/ui/loadingSpinner"
import { WelcomePage } from "@/components/pages/welcomePage"
import { DietForm } from "@/components/pages/dietForm"
import { WorkoutForm } from "@/components/pages/workoutForm"
import { ChatPage } from "@/components/pages/chatPage"

type Screen = 'welcome' | 'dietForm' | 'workoutForm' | 'chat'
type UserChoice = 'diet' | 'workout' | null

export default function FitnessApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome')
  const [userChoice, setUserChoice] = useState<UserChoice>(null)
  const [isGenerating, setIsGenerating] = useState(false)


  const [formDataDiet, setFormDataDiet] = useState({
    weight: "",
    height: "",
    goal: "",
    dietaryRestrictions: "",
    workoutsPerWeek: "",
    mealsPerDay: "",
  })

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
    setIsGenerating(true)

    try {
      const initialPrompt = `Por favor, crie uma dieta personalizada com base nas seguintes informações:
      - Peso: ${formDataDiet.weight} kg
      - Altura: ${formDataDiet.height} cm
      - Objetivo: ${formDataDiet.goal}
      - Observações ou Restrições alimentares: ${formDataDiet.dietaryRestrictions || "Nenhuma"}
      - Número de treinos por semana: ${formDataDiet.workoutsPerWeek}
      - Número de refeições desejadas na dieta por dia: ${formDataDiet.mealsPerDay}
      
      Por favor, forneça uma dieta detalhada com refeições para cada dia da semana, incluindo quantidades e horários.`
  
      const data = await chatService(messages, initialPrompt, userChoice)
      setMessages([
        { id: "user-1", role: "user", content: initialPrompt}, 
        { id: "assistant-1", role: "assistant", content: data.response }
      ])
      setCurrentScreen('chat')
    } catch (error) {
      console.error('Erro ao gerar dieta:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWorkoutFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

  try {
    const initialPrompt = `Por favor, crie um plano de treino personalizado com base nas seguintes informações:
    - Objetivo principal: ${formDataWorkout.mainGoal}
    - Nível de experiência: ${formDataWorkout.experienceLevel}
    - Frequência semanal de treinos: ${formDataWorkout.trainingFrequency}
    - Local de treino: ${formDataWorkout.trainingLocation}
    - Restrições físicas ou lesões: ${formDataWorkout.physicalRestrictions || "Nenhuma"}
    - Grupos musculares que deseja focar: ${formDataWorkout.focusMuscleGroups || "Nenhum específico"}
    - Outras observações: ${formDataWorkout.otherObservations || "Nenhuma"}

    Por favor, forneça um plano de treino detalhado.`

    const data = await chatService(messages, initialPrompt, userChoice)
    setMessages([
      { id: "user-initial-workout", role: "user", content: initialPrompt },
      { id: "assistant-initial-workout", role: "assistant", content: data.response }
    ])
    setCurrentScreen('chat')
  } catch (error) {
    console.error('Erro ao gerar treino:', error)
  } finally {
    setIsGenerating(false)
  }
};


  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevenir o comportamento padrão do formulário
    // Usar o input atual para a nova mensagem do usuário
    const userMessageContent = input; 
    if (!userMessageContent.trim()) return; 

    const newUserMessage = { 
      id: `user-${messages.length + 1}`, 
      role: 'user' as const, 
      content: userMessageContent 
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput(''); 

    const data = await chatService(updatedMessages, userMessageContent, userChoice);

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
         <WelcomePage
         userChoice={userChoice}
         onUserChoiceChange={setUserChoice}
         onSubmit={handleWelcomeSubmit}
       />
        )}

        {currentScreen === 'dietForm' && (
          <DietForm
            formData={formDataDiet}
            onFormChange={handleFormChangeDiet}
            onSubmit={handleDietFormSubmit}
            isGenerating={isGenerating}
          />
        )}

        {currentScreen === 'workoutForm' && (
         <WorkoutForm
         formData={formDataWorkout}
         onFormChange={handleFormChangeWorkout}
         onSubmit={handleWorkoutFormSubmit}
         isGenerating={isGenerating}
       />
        )}

        {currentScreen === 'chat' && (
          <ChatPage
          messages={messages}
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleChatSubmit}
          isLoading={isLoading}
        />
        )}
      </main>
      <LoadingOverlay 
        isVisible={isGenerating} 
        message={userChoice === 'diet' ? "Criando sua dieta personalizada..." : "Criando seu treino personalizado..."}
      />
    </div>
  )
}
