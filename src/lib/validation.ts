import { z } from "zod";
import { normalizeKzPhone } from "./phone";

export { normalizeKzPhone, formatKzPhone, maskKzPhone } from "./phone";

export const INTENTS = ["start", "price", "consult", "schedule"] as const;
export const FORMATS = ["unspecified", "group", "individual", "online"] as const;
export const WINDOWS = ["morning", "afternoon", "evening", "any"] as const;
export const METHODS = ["phone", "whatsapp", "telegram"] as const;
export const STATUSES = ["new", "contacted", "scheduled", "enrolled", "done", "spam"] as const;

export type Intent = (typeof INTENTS)[number];
export type LeadStatus = (typeof STATUSES)[number];

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "name_too_short")
    .max(80, "name_too_long"),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeKzPhone(v) !== null, "phone_invalid"),
  intent: z.enum(INTENTS),
  programSlug: z.string().trim().max(60).optional().nullable(),
  format: z.enum(FORMATS).optional().default("unspecified"),
  contactMethod: z.enum(METHODS).optional().default("phone"),
  contactWindow: z.enum(WINDOWS).optional().default("any"),
  comment: z.string().trim().max(1000).optional().nullable(),
  consent: z.literal(true, { errorMap: () => ({ message: "consent_required" }) }),
  locale: z.enum(["ru", "kz"]).default("ru"),
  source: z.string().trim().max(40).optional().default("direct"),
  utm: z
    .object({
      source: z.string().max(80).optional(),
      medium: z.string().max(80).optional(),
      campaign: z.string().max(120).optional(),
      content: z.string().max(120).optional(),
    })
    .optional(),
  referrer: z.string().max(400).optional().nullable(),
  pagePath: z.string().max(200).optional().nullable(),
  /** Honeypot — must stay empty. */
  company: z.string().max(0).optional(),
  /** Milliseconds spent on the form, used to reject instant bot submissions. */
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export const chatSchema = z.object({
  sessionId: z.string().min(8).max(64),
  locale: z.enum(["ru", "kz"]).default("ru"),
  message: z.string().trim().min(1).max(1200),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(24)
    .optional()
    .default([]),
});

export type ChatInput = z.infer<typeof chatSchema>;
