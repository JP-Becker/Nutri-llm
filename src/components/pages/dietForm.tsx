"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface DietFormData {
  weight: string
  height: string
  goal: string
  dietaryRestrictions: string
  workoutsPerWeek: string
  mealsPerDay: string
}

interface DietFormProps {
  formData: DietFormData
  onFormChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isGenerating: boolean
}

export function DietForm({ formData, onFormChange, onSubmit, isGenerating }: DietFormProps) {
  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle>Informações para Dieta</CardTitle>
        <CardDescription className="text-zinc-400">
          Preencha os dados abaixo para gerar sua dieta personalizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Peso */}
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Ex: 70"
                className="bg-zinc-950 border-zinc-700"
                value={formData.weight}
                onChange={(e) => onFormChange("weight", e.target.value)}
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
                value={formData.height}
                onChange={(e) => onFormChange("height", e.target.value)}
                required
                min={100}
                max={220}
              />
            </div>
          </div>

          {/* Objetivo */}
          <div className="space-y-2">
            <Label htmlFor="goal">Objetivo</Label>
            <Select onValueChange={(value) => onFormChange("goal", value)} required>
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
              value={formData.dietaryRestrictions}
              onChange={(e) => onFormChange("dietaryRestrictions", e.target.value)}
            />
          </div>

          {/* Número de Treinos por Semana */}
          <div className="space-y-2">
            <Label htmlFor="workoutsPerWeek">Número de Treinos por Semana</Label>
            <Select onValueChange={(value) => onFormChange("workoutsPerWeek", value)} required>
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
            <Select onValueChange={(value) => onFormChange("mealsPerDay", value)} required>
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

          <Button type="submit" className="w-full" disabled={isGenerating}>
            {isGenerating ? "Gerando Dieta..." : "Gerar Dieta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}