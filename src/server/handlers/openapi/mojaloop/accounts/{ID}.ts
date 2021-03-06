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

import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Handler, Context } from 'openapi-backend'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import config from '~/lib/config'
import { consentRepository } from '~/repositories/consent'
import { ConsentStatus } from '~/models/consent'
import { logger } from '~/shared/logger'

/**
 * Handles callback from Mojaloop that specifies detailed info about a requested party.
 *
 * @param context   an object that contains detailed information about the incoming request.
 * @param request   original request object as defined by the hapi library.
 * @param h         original request toolkit as defined by the hapi libary.
 */
export const put: Handler = async (
  context: Context,
  _: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  // Retrieve the data that have been validated by the openapi-backend library.
  const body = context.request.body as tpAPI.Schemas.AccountsIDPutResponse
  const partyIdentifier = context.request.params.ID

  // Find all matching documents in Firebase that are waiting for the result of
  // party lookup with the specified type and identifier. The execution of this
  // function is expected to run asynchronously, so the server could quickly
  // give a response to Mojaloop.

  console.log("handling inbound put accounts")

  // Update Consents as  OPAQUE is the type during linking when we're fetching the accounts
  // available for linking from a pre-determined DFSP

  // Not await-ing promise to resolve - code is executed asynchronously
  consentRepository.updateConsent(
    // Conditions for the documents that need to be updated
    {
      // not strictly needed... but let's leave it in for now
      'party.partyIdInfo.partyIdType': 'OPAQUE',
      'party.partyIdInfo.partyIdentifier': partyIdentifier,
      status: ConsentStatus.PENDING_PARTY_LOOKUP,
    },
    // Update the given field by their new values
    {
      initiatorId: config.get('participantId'),
      accounts: body.accounts,
      status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
    }
  )


  // Return "200 OK" as defined by the Mojaloop API for successful request.
  return h.response().code(200)
}

export const putError: Handler = async (
  context: Context,
  _: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  // Retrieve the data that have been validated by the openapi-backend library.
  const body = context.request.body
  const partyIdentifier = context.request.params.ID

  // Find all matching documents in Firebase that are waiting for the result of
  // party lookup with the specified type and identifier. The execution of this
  // function is expected to run asynchronously, so the server could quickly
  // give a response to Mojaloop.
  logger.info("handling inbound PUT /accounts/{ID/error")
  logger.info(JSON.stringify(body, null, 2))
  logger.info(`${partyIdentifier}`)

  // Update Consents as  OPAQUE is the type during linking when we're fetching the accounts
  // available for linking from a pre-determined DFSP


  // Return "200 OK" as defined by the Mojaloop API for successful request.
  return h.response().code(200)
}
