import zod from 'zod'

export const userRowSchema = zod.object({
  id: zod.number().int(),
  first_name: zod.string().max(32),
  last_name: zod.string().max(32),
  email: zod.string().max(256).email(),
  password_hashed: zod.string().max(64),
  registered_at: zod.date(),
  phone: zod.string().max(32).nullable().optional(),
  birth_date: zod.date(),
  is_active: zod.boolean(),
  is_admin: zod.boolean(),
})

export type userRowSchema = zod.infer<typeof userRowSchema>

export const createUserInput = zod.object({
  first_name: zod
    .string({ message: 'First name is required and must be a string' })
    .min(1, 'First name cannot be empty')
    .max(32, 'First name cannot exceed 32 characters')
    .trim(),
  last_name: zod
    .string({ message: 'Last name is required and must be a string' })
    .min(1, 'Last name cannot be empty')
    .max(32, 'Last name cannot exceed 32 characters')
    .trim(),
  email: zod
  .email('Invalid email address format')
    .max(256, 'Email cannot exceed 256 characters')
    .toLowerCase()
    .trim(),
  password: zod
    .string({ message: 'Password is required and must be a string' })
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  birth_date: zod
    .coerce.date({ message: 'Birth date is required and must be a valid date' })
    .refine(
      (date) => date < new Date(),
      'Birth date must be in the past'
    )
    .refine(
      (date) => {
        const year = date.getFullYear();
        return year >= 1900 && year <= new Date().getFullYear();
      },
      'Birth date must be between 1900 and current year'
    ),
  phone: zod
    .string()
    .max(32, 'Phone number cannot exceed 32 characters')
    .trim()
    .nullable()
    .optional()
    .transform((val) => val === '' ? null : val),
})

export type createUserInput = zod.infer<typeof createUserInput>