"use server";

import nodemailer from "nodemailer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendReport(formData: { type: string; message: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté pour envoyer un retour." };
  }

  try {
    let transporter;

    // 1. CHOIX DU SERVEUR D'ENVOI SELON L'ENVIRONNEMENT
    if (process.env.NODE_ENV === "production") {
      // EN PRODUCTION : Utilisation de la vraie boîte Gmail centralisée
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD, // Le code à 16 lettres de Google
        },
      });
    } else {
      // EN DÉVELOPPEMENT : Utilisation de Mailtrap pour ne pas spammer
      transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 587,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      });
    }

    // 2. FORMATAGE DE L'EMAIL
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${formData.type === 'bug' ? '#ef4444' : '#3b82f6'}; padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">Nouveau ticket - Toy Verse</h2>
        </div>
        <div style="padding: 20px;">
          <p><strong>Utilisateur :</strong> ${user.user_metadata?.first_name || "Inconnu"} (${user.email})</p>
          <p><strong>Catégorie :</strong> <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; font-size: 12px;">${formData.type}</span></p>
          <p><strong>Environnement :</strong> <span style="font-weight: bold; color: #6b7280;">${process.env.NODE_ENV.toUpperCase()}</span></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Message :</strong></p>
          <p style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-left: 4px solid ${formData.type === 'bug' ? '#ef4444' : '#3b82f6'};">${formData.message}</p>
        </div>
      </div>
    `;

    // 3. PARAMÉTRAGE DE L'EXPÉDITEUR / DESTINATAIRE
    // L'astuce du mail centralisé : On met le nom de l'app dans le "from" pour filtrer facilement dans Gmail
    const senderName = process.env.NODE_ENV === "production" ? "Toy Verse App" : "Toy Verse (DEV)";
    
    // Si la variable EMAIL_USER n'est pas trouvée (ex: en local), on met un faux mail par défaut
    const centralEmail = process.env.EMAIL_USER || "contact@toyverse.com";

    await transporter.sendMail({
      from: `"${senderName}" <${centralEmail}>`, 
      to: centralEmail, // L'email s'envoie à toi-même
      replyTo: user.email, // Pour pouvoir faire "Répondre" directement à l'utilisateur depuis Gmail
      // Le [TOY VERSE] dans le sujet te permettra de faire un filtre automatique dans ta boîte Gmail !
      subject: `[TOY VERSE] - [${formData.type.toUpperCase()}] Nouveau retour utilisateur`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur d'envoi d'email:", error);
    return { success: false, error: "Le service est temporairement indisponible." };
  }
}