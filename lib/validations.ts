import { z } from "zod";

// ICI ON EXPORTE LE SCHÉMA POUR QU'IL SOIT ACCESSIBLE PARTOUT
export const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
});