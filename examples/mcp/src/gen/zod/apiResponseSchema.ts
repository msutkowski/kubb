/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const apiResponseSchema = z.object({
  code: z.number().int().optional(),
  type: z.string().optional(),
  message: z.string().optional(),
})
