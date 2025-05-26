import type React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Apple, Dumbbell } from "lucide-react";

type UserChoice = 'diet' | 'workout' | null;

interface WelcomePageProps {
  userChoice: UserChoice;
  onUserChoiceChange: (value: UserChoice) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function WelcomePage({ userChoice, onUserChoiceChange, onSubmit }: WelcomePageProps) {
  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Bem-vindo ao Fitness GPT!</CardTitle>
        <CardDescription className="text-zinc-400 text-center text-lg pt-2">
          Você deseja montar um treino ou uma dieta?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userChoice" className="text-md">Escolha uma opção:</Label>
            <Select onValueChange={(value) => onUserChoiceChange(value as UserChoice)} required>
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
  );
}