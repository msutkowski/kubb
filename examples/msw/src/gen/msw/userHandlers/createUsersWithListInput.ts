import { rest } from 'msw'
import {
  createCreateUsersWithListInputMutationResponse,
  createCreateUsersWithListInputMutationRequest,
} from '../../mocks/userMocks/createCreateUsersWithListInput'

export const createUsersWithListInputHandler = rest.get('*/user/createWithList', function handler(req, res, ctx) {
  return res(ctx.json(createCreateUsersWithListInputMutationResponse()))
})