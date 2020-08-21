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

import * as faker from 'faker'

import {
  AuthorizationsPostRequest,
  ThirdPartyTransactionRequest,
} from '~/shared/ml-thirdparty-client/models/openapi'

import { AuthenticationType } from '~/shared/ml-thirdparty-client/models/core'

export class AuthorizationFactory {
  /**
   * Creates a `POST /authorizations` request body that is normally sent
   * by Mojaloop as a callback for a transaction request operation.
   * 
   * @param request  The transaction request object as defined by the Mojaloop API.
   */
  public static createPostAuthorizationsRequest(request: ThirdPartyTransactionRequest): AuthorizationsPostRequest {
    return {
      authenticationType: AuthenticationType.U2F,
      retriesLeft: '1',
      amount: request.amount,
      transactionId: faker.random.uuid(),
      transactionRequestId: request.transactionRequestId,
      quote: {
        transferAmount: request.amount,
        expiration: request.expiration,
        ilpPacket: faker.random.alphaNumeric(70),
        condition: faker.random.alphaNumeric(43),
      }
    }
  }
}
