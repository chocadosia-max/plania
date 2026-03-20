"use client";

import React, { useState, useRef } from 'react';
import { User, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function ProfileSettings() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => localStorage.getItem("plania-user-photo"));
  const [name, setName] = useState(() => localStorage.getItem("plania-user-name") || "Mariana");
  const [email, setEmail] = useState(() => localStorage.getItem("plania-user-email") || "mariana@exemplo.com");
  const [profession, setProfession] = useState(() => localStorage.getItem("plania-user-profession") || "Designer");
  const [profileType, setProfileType] = useState(() => localStorage.getItem("plania-user-type") || "pessoal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setProfilePhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem("plania-user-name", name);
    localStorage.setItem("plania-user-email", email);
    localStorage.setItem("plania-user-profession", profession);
    localStorage.setItem("plania-user-type", profileType);
    if (profilePhoto) {
      localStorage.setItem("plania-user-photo", profilePhoto);
    }
    window.dispatchEvent(new Event("profile-updated"));
    toast.success("Perfil atualizado com sucesso! ✨");
  };

  return (
    <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "160ms" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden group"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/30">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="w-4 h-4 text-white" />
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Foto de perfil</p>
            <p className="text-xs text-muted-foreground">Clique para alterar</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div className="space-y-2">
            <Label>Profissão</Label>
            <Input value={profession} onChange={(e) => setProfession(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de perfil</Label>
            <Select value={profileType} onValueChange={setProfileType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoal">👤 Pessoal</SelectItem>
                <SelectItem value="freelancer">💻 Freelancer</SelectItem>
                <SelectItem value="empresario">🏢 Empresário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSaveProfile} className="gap-2">
            <Save className="w-4 h-4" /> Salvar perfil
          </Button>
        </div>
      </div>
    </section>
  );
}