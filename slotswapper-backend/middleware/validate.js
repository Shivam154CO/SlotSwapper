import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationCode: z.string().optional()
});

export const createSwapSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Event ID format"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  preferredDate: z.string(),
  preferredTime: z.string(),
  contactEmail: z.string().email("Invalid contact email"),
  type: z.enum(["direct", "auction", "chain"]).optional(),
  conditions: z.record(z.any()).optional()
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};
