import zod from "zod";

export const signatureRowSchema = zod.object({
  id: zod.number().int(),
  checksum: zod.string().max(64),
  signer_id: zod.number().int(),
  campaign_id: zod.number().int(),
});

export type signatureRowSchema = zod.infer<typeof signatureRowSchema>;

export const signatureCountRowSchema = zod.object({
  count: zod.number().int().nonnegative(),
});

export type signatureCountRowSchema = zod.infer<typeof signatureCountRowSchema>;
