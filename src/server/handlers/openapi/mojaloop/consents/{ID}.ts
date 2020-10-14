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
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
 --------------
 ******/

import { Request, ResponseToolkit } from '@hapi/hapi'
import { Handler, Context } from 'openapi-backend'
import { consentRepository } from '~/repositories/consent'

export const put: Handler = async (
  context: Context,
  _request: Request,
  h: ResponseToolkit
) => {
  // Updates consent fields
  // Not await-ing promise to resolve - code is executed asynchronously
  consentRepository.updateConsentById(
    context.request.params.ID as string,
    context.request.body
  )
  return h.response().code(200)
}

export const patch: Handler = async (
  context: Context,
  _request: Request,
  h: ResponseToolkit
) => {
  // Updates consent fields patched
  // Not await-ing promise to resolve - code is executed asynchronously
  consentRepository.updateConsentById(
    context.request.params.ID as string,
    context.request.body
  )
  return h.response().code(200)
}
