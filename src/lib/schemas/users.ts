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
  first_name: zod.string().max(32),
  last_name: zod.string().max(32),
  email: zod.email().max(256),
  password: zod.string().min(8),
  birth_date: zod.coerce.date(),
  phone: zod.string().max(32).nullable().optional(),
})

export type createUserInput = zod.infer<typeof createUserInput>