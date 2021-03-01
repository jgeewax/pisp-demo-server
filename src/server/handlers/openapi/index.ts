/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import { ExtHandlers } from '../../plugins/internal/openapi'
import { Context } from 'openapi-backend'
import { Request, ResponseToolkit } from '@hapi/hapi'

import { apiHandlers as appApiHandlers } from './app'
import { apiHandlers as mojaloopApiHandlers } from './mojaloop'

export { appApiHandlers, mojaloopApiHandlers }

export const apiHandlers = {
  ...appApiHandlers,
  ...mojaloopApiHandlers,
}

export const extHandlers: ExtHandlers = {
  notFound: (c: Context, __: Request, h: ResponseToolkit) => {
    console.log('returning 404 for request with path:', c.request.path)
    return h.response().code(404)
  },

  methodNotAllowed: (_: Context, __: Request, h: ResponseToolkit) => {
    return h.response().code(405)
  },

<<<<<<< HEAD
  validationFail: (c: Context, __: Request, h: ResponseToolkit) => {
    // TODO: print out error!
    console.log('validation failed!!', JSON.stringify(c.validation.errors, null, 2))
    return h.response({ status: 400, err: c.validation.errors }).code(400);
=======
  validationFail: (context: Context, __: Request, h: ResponseToolkit) => {
    const error = JSON.stringify(context.validation.errors)
    return h.response(error).code(400)
>>>>>>> d2afb43862f179608fa5b8a1633ab3460f024fa9
  },

  notImplemented: (_: Context, __: Request, h: ResponseToolkit) => {
    return h.response().code(501)
  },
}
