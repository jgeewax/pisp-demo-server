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


import config from '~/lib/config'
import { transactionRepository } from '~/repositories/transaction'

import createServer from '~/server/create'
import * as transactionsHandler from '~/server/handlers/firestore/transactions'

import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import { Status } from '~/models/transaction'

// Mock firebase to prevent server from listening to the changes.
jest.mock('~/lib/firebase')

// Mock uuid to consistently return the provided value.
jest.mock('uuid', () => ({
  v4: jest.fn().mockImplementation(() => '12345')
}))

describe('Handlers for transaction documents in Firebase', () => {
  let server: Server

  beforeAll(async () => {
    server = await createServer(config)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('Should set status and transactionRequestId for new transaction', () => {
    const transactionRepositorySpy = jest.spyOn(transactionRepository, 'updateById')
    const documentId = '111'

    transactionsHandler.onCreate(server, {
      id: documentId,
      userId: 'bob123',
      payee: {
        partyIdInfo: {
          partyIdType: PartyIdType.MSISDN,
          partyIdentifier: "+1-111-111-1111",
        }
      }
    })

    expect(transactionRepositorySpy).toBeCalledWith(documentId, {
      transactionRequestId: '12345',
      status: Status.PENDING_PARTY_LOOKUP,
    })
  })

  it('Should perform party lookup when all necessary fields are set', () => {
    const documentId = '111'
    let mojaloopClientSpy = jest.spyOn(server.app.mojaloopClient, 'getParties').mockImplementation()

    transactionsHandler.onUpdate(server, {
      id: documentId,
      userId: 'bob123',
      payee: {
        partyIdInfo: {
          partyIdType: PartyIdType.MSISDN,
          partyIdentifier: "+1-111-111-1111",
        }
      },
      transactionRequestId: '12345',
      status: Status.PENDING_PARTY_LOOKUP,
    })

    expect(mojaloopClientSpy).toBeCalledWith(PartyIdType.MSISDN, "+1-111-111-1111")
  })
})
