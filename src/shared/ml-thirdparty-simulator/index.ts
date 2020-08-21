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
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import { Server } from '@hapi/hapi'
import * as faker from 'faker'

import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import {
  ThirdPartyTransactionRequest,
  AuthorizationsPutIdRequest,
} from '~/shared/ml-thirdparty-client/models/openapi'

import { ParticipantFactory } from './factories/participant'
import { PartyFactory } from './factories/party'
import { AuthorizationFactory } from './factories/authorization'
import { TransferFactory } from './factories/transfer'
import { Options } from './options'

/**
 * Simulator allows Mojaloop's client to mock out the communication and return
 * randomly generated replies. This is useful to aid the testing process when
 * Mojaloop is not deployed.
 */
export class Simulator {
  /**
   * A server object to be used to inject the fake Mojaloop callbacks.
   */
  private server: Server

  /**
   * An object that keeps the configuration for the simulator.
   */
  private options: Options

  /**
   * Constructor for the Mojaloop simulator.
   * 
   * @param server a server object to be used to inject the fake Mojaloop callbacks.
   * @param options a configuration object for the simulator.
   */
  constructor(server: Server, options?: Options) {
    this.server = server
    this.options = options ?? {}

    if (this.options.numOfParticipants) {
      ParticipantFactory.numOfParticipants = this.options.numOfParticipants
    }
  }

  /**
   * Simulates a party lookup operation in Mojaloop, without the need of 
   * sending `GET /parties/{Type}/{ID}` request.
   * 
   * @param type  type of the party identifier.
   * @param id    the party identifier.
   */
  async getParties(type: PartyIdType, id: string): Promise<void> {
    const targetUrl = '/parties/' + type.toString() + '/' + id
    const payload = PartyFactory.createPutPartiesRequest(type, id)

    if (this.options.delay) {
      // Delay operations to simulate network latency in real communication
      // with Mojaloop.
      await this.delay(this.options.delay)
    }

    // Inject a request to the server as if it receives an inbound request
    // from Mojaloop.
    this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
   * Simulates a transaction initiation in Mojaloop by third-party application,
   * without the need of sending `POST /thirdpartyRequests/transactions` request.
   * 
   * @param request a transaction request object as defined by the Mojaloop API.
   */
  public async postTransactions(request: ThirdPartyTransactionRequest): Promise<void> {
    const targetUrl = '/authorizations'
    const payload = AuthorizationFactory.createPostAuthorizationsRequest(request)

    if (this.options.delay) {
      // Delay operations to simulate network latency in real communication
      // with Mojaloop.
      await this.delay(this.options.delay)
    }

    this.server.inject({
      method: 'POST',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
   * Simulates a transaction authorization in Mojaloop by third-party application,
   * without the need of sending `PUT /authorizations/{ID}` request.
   * 
   * @param id            the transaction request ID that is used to identify the
   *                      authorization.
   * @param request       a transaction authorization object as defined by the Mojaloop API.
   * @param transactionId the transaction ID that is associated with the request. This
   *                      value is required by the simulator as it will be contained in the
   *                      response object.
   */
  public async putAuthorizations(id: string,
    request: AuthorizationsPutIdRequest, transactionId: string): Promise<void> {
    const targetUrl = '/transfers/' + faker.random.uuid()
    const payload = TransferFactory.createTransferIdPutRequest(id, request, transactionId)

    this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
   * Returns a promise that will be resolved after a certain duration.
   * 
   * @param ms the length of delay in milisecond.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
