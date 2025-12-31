import { z } from "zod";

/* ---------- Reusable Enums ---------- */

const PackageCategoryEnum = z.enum([
  "weekend",
  "adventure",
  "family",
  "honeymoon",
]);

const DifficultyLevelEnum = z.enum([
  "easy",
  "moderate",
  "hard",
]);

const ActivityTypeEnum = z.enum([
  "travel",
  "meal",
  "stay",
  "sightseeing",
  "activity",
  "free",
]);

/* ---------- Helpers ---------- */

// HH:MM (24-hour)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
/* ---------- Sub DTOs ---------- */

const FileDTO = z.object({
  key: z.string().min(1, "File key is required"),
  fieldName: z.string().min(1, "Field name is required"),
}).strict();

const ActivityDTO = z.object({
  startTime: z.string().regex(timeRegex, "Invalid startTime format (HH:MM)"),
  endTime: z.string().regex(timeRegex, "Invalid endTime format (HH:MM)"),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  type: ActivityTypeEnum,
  included: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        path: ["endTime"],
        message: "endTime must be after startTime",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const DayItineraryDTO = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(1),
  activities: z.array(ActivityDTO).default([]),
})

/* ---------- Main Create DTO ---------- */

export const CreateBasePackage = z.object({

  title: z.string().min(3).max(150),
  location: z.string().min(3).max(100),

  category: PackageCategoryEnum,

  images: z.array(FileDTO).default([]),

  duration: z.object({
    days: z.number().int().min(1),
    nights: z.number().int().min(0),
  }),

  basePrice: z.number().int().min(0),

  description: z.string().min(20),

  itinerary: z.array(DayItineraryDTO).default([]),

  inclusions: z.array(z.string().min(1)).default([]),
  exclusions: z.array(z.string().min(1)).default([]),

  difficultyLevel: DifficultyLevelEnum,
})
.superRefine((data, ctx) => {
  if (data.duration.nights > data.duration.days - 1) {
    ctx.addIssue({
      path: ["duration", "nights"],
      message: "Nights cannot exceed days - 1",
      code: z.ZodIssueCode.custom,
    });
  }
});

export const CreateBasePackageSchema = z.object({
  body: CreateBasePackage,
});

export type CreateBasePackageDTO = z.infer<typeof CreateBasePackage>;

