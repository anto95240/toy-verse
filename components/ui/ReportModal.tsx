"use client";

import { useState } from "react";
import { sendReport } from "@/app/actions/report";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug, faLightbulb, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function ReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [type, setType] = useState<"bug" | "amelioration">("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setStatus("loading");
    const res = await sendReport({ type, message });
    
    if (res.success) {
      setStatus("success");
      setTimeout(() => { onClose(); setStatus("idle"); setMessage(""); }, 2000);
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border relative">
        <button aria-label="ferme la popup" onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Laisser un avis / Signaler</h2>
        
        {status === "success" ? (
          <div className="p-4 bg-green-500/10 text-green-600 rounded-lg text-center font-medium">
            Merci pour ton retour ! Le message a bien été envoyé.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setType("bug")} className={`flex-1 py-2 rounded-lg font-medium border flex items-center justify-center gap-2 transition ${type === "bug" ? "bg-destructive/10 border-destructive text-destructive" : "bg-background border-border text-muted-foreground"}`}>
                <FontAwesomeIcon icon={faBug} /> Bug
              </button>
              <button type="button" onClick={() => setType("amelioration")} className={`flex-1 py-2 rounded-lg font-medium border flex items-center justify-center gap-2 transition ${type === "amelioration" ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-muted-foreground"}`}>
                <FontAwesomeIcon icon={faLightbulb} /> Idée
              </button>
            </div>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décris le problème ou ton idée d'amélioration ici..."
              className="w-full h-32 p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
              required
            />
            
            {status === "error" && <p className="text-destructive text-sm">Une erreur est survenue.</p>}
            
            <button type="submit" disabled={status === "loading" || !message.trim()} className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50">
              {status === "loading" ? "Envoi en cours..." : "Envoyer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}