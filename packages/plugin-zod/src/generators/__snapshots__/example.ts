/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */
import { z } from 'zod'

export const example = z.object({
  nestedExamples: z.lazy(() => example).optional(),
})
