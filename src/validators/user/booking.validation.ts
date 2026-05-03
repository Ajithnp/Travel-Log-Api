import { z } from "zod";

/**
 * Mongo ObjectId validator
 */
export const objectIdSchema = z
  .string({
    required_error: "Field is required",
    invalid_type_error: "Must be a string",
  })
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

/**
 * Traveler Schema
 */
export const travelerSchema = z.object({
  fullName: z
    .string({
      required_error: "fullName is required",
    })
    .trim()
    .min(2, "fullName must be at least 2 characters")
    .max(100, "fullName must not exceed 100 characters"),

  idType: z
    .string({
      required_error: "idType is required",
    })
    .trim()
    .min(2, "idType is required")
    .max(50, "idType is too long"),

  idNumber: z
    .string({
      required_error: "idNumber is required",
    })
    .trim()
    .min(3, "idNumber is required")
    .max(50, "idNumber is too long"),

  isLead: z.boolean({
    required_error: "isLead is required",
  }),

  phoneNumber: z
    .string()
    .trim()
    .min(7, "Invalid phoneNumber")
    .max(20, "Invalid phoneNumber")
    .optional(),

  
    emailAddress:
        z.string().email("Valid email required")
        .optional().or(z.literal("")),

  emergencyContact: z
    .string()
    .optional(),

  relation: z
    .string()
    .trim()
    .min(2, "relation is too short")
    .max(50, "relation is too long")
    .optional(),
});


export const initiateBookingSchema = z
  .object({
    packageId: objectIdSchema.refine(Boolean, {
      message: "packageId is required",
    }),

    scheduleId: objectIdSchema.refine(Boolean, {
      message: "scheduleId is required",
    }),

    tierType: z.enum(["SOLO", "DUO", "GROUP"], {
      required_error: "tierType is required",
      invalid_type_error: "tierType must be SOLO, DUO, or GROUP",
    }),

    seatsCount: z
      .number({
        required_error: "seatsCount is required",
        invalid_type_error: "seatsCount must be a number",
      })
      .int("seatsCount must be an integer")
      .min(1, "Minimum seatsCount is 1")
      .max(20, "Maximum seatsCount exceeded"),

    travelers: z
      .array(travelerSchema, {
        required_error: "travelers is required",
      })
      .min(1, "At least one traveler is required"),

    amountInPaise: z
      .number({
        required_error: "amountInPaise is required",
        invalid_type_error: "amountInPaise must be a number",
      })
      .int("amountInPaise must be an integer")
      .positive("amountInPaise must be greater than 0"),
  })

  /**
   * Cross-field validations
   */
  .superRefine((data, ctx) => {
    /**
     * seatsCount === travelers.length
     */
    if (data.seatsCount !== data.travelers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["travelers"],
        message: "travelers count must match seatsCount",
      });
    }

    /**
     * Only one lead traveler allowed
     */
    const leadCount = data.travelers.filter((t) => t.isLead).length;

    if (leadCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["travelers"],
        message: "Exactly one lead traveler is required",
      });
    }

    /**
     * Lead traveler should have phone + email
     */
    data.travelers.forEach((traveler, index) => {
      if (traveler.isLead) {
        if (!traveler.phoneNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", index, "phoneNumber"],
            message: "Lead traveler phoneNumber is required",
          });
        }

        if (!traveler.emailAddress) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", index, "emailAddress"],
            message: "Lead traveler emailAddress is required",
          });
        }
      }
    });

    /**
     * Tier rules
     */
    if (data.tierType === "SOLO" && data.seatsCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seatsCount"],
        message: "SOLO booking must have 1 seat",
      });
    }

    if (data.tierType === "DUO" && data.seatsCount !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seatsCount"],
        message: "DUO booking must have 2 seats",
      });
    }

    if (data.tierType === "GROUP" && data.seatsCount !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seatsCount"],
        message: "GROUP booking must have 4 seats",
      });
    }
  });

  export const InitiateBookingRequestSchema = z.object({
   body: initiateBookingSchema,
  });

export type InitiateBookingInput = z.infer<typeof initiateBookingSchema>;