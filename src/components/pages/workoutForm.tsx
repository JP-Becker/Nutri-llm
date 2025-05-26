"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface WorkoutFormData {
  mainGoal: string
  experienceLevel: string
  trainingFrequency: string
  trainingLocation: string
  physicalRestrictions: string
  focusMuscleGroups: string
  otherObservations: string
}

interface WorkoutFormProps {
  formData: WorkoutFormData
  onFormChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isGenerating: boolean
}

export function WorkoutForm({ formData, onFormChange, onSubmit, isGenerating }: WorkoutFormProps) {
  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle>Informações para Treino</CardTitle>
        <CardDescription className="text-zinc-400">
          Preencha os dados abaixo para gerar seu treino personalizado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Objetivo Principal */}
          <div className="space-y-2">
            <Label htmlFor="mainGoal">Objetivo Principal</Label>
            <Select onValueChange={(value) => onFormChange("mainGoal", value)} required>
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
            <Select onValueChange={(value) => onFormChange("experienceLevel", value)} required>
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
            <Select onValueChange={(value) => onFormChange("trainingFrequency", value)} required>
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
            <Select onValueChange={(value) => onFormChange("trainingLocation", value)} required>
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
            <Label htmlFor="physicalRestrictions">Restrições Físicas ou Lesões (Opcional)</Label>
            <Textarea
              id="physicalRestrictions"
              placeholder="Ex: Dor no joelho, hérnia de disco, etc."
              className="bg-zinc-950 border-zinc-700"
              value={formData.physicalRestrictions}
              onChange={(e) => onFormChange("physicalRestrictions", e.target.value)}
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
              value={formData.focusMuscleGroups}
              onChange={(e) => onFormChange("focusMuscleGroups", e.target.value)}
            />
          </div>

          {/* Outras Observações (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="otherObservations">Outras Observações (Opcional)</Label>
            <Textarea
              id="otherObservations"
              placeholder="Ex: Preferência por treinos mais curtos, equipamentos disponíveis em casa, etc."
              className="bg-zinc-950 border-zinc-700"
              value={formData.otherObservations}
              onChange={(e) => onFormChange("otherObservations", e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isGenerating}>
            {isGenerating ? "Gerando Treino..." : "Gerar Treino"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}