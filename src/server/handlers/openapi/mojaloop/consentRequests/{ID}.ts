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
import { ConsentStatus } from '~/models/consent'
import { logger } from '~/shared/logger'

export const put: Handler = async (
  context: Context,
  _request: Request,
  h: ResponseToolkit
) => {
  const { authChannels, authUri } = context.request.body
  const updatedConsent = {
    authChannels,
    authUri,
    status: ConsentStatus.AUTHENTICATION_REQUIRED,
  }
  // For OTP call, we don't get an authUri back
  if (!updatedConsent.authUri) {
    delete updatedConsent.authUri;
  }

  // Not await-ing promise to resolve - code is executed asynchronously
  consentRepository.updateConsent({consentRequestId: context.request.params.ID}, updatedConsent)
  return h.response().code(200)
}

export const putError: Handler = async (context: Context, _: Request, h: ResponseToolkit) => {
  logger.error('putConsentRequests error: ' + JSON.stringify(context.request.body, null, 2))
  // TODO: get error details...
  return h.response().code(200)
}

