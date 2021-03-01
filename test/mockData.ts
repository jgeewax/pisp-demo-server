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
 - Kenneth Zeng <kkzeng@google.com>
 --------------
 ******/
// TODO: Interface wrongly defines request
// accountId in scopes does not have to be CorrelationId
// Will be fixed in #1768
const exampleScopeArray = [
  {
    accountId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
    actions: ['withdraw', 'viewbalance'],
  },
  {
    accountId: 'a51ec534-ee48-4575-b6a9-ead2955b8069',
    actions: ['viewbalance'],
  },
]

export const putConsentRequestsByIdBody = {
  initiatorId: '1234',
  authChannels: ['web', 'OTP'],
  scopes: exampleScopeArray,
  callbackUri: 'pisp://callback',
  authUri: 'www.auth.com',
}

export const putConsentsByIdBody = {
  requestId: 'a71ec534-ee48-4575-b6a9-ead2955b8069',
  initiatorId: 'pisp-2342-2233',
  participantId: 'pisp-2342-2233',
  scopes: exampleScopeArray,
  credential: {
    id: 'credId',
    credentialType: 'FIDO',
    status: 'VERIFIED',
    challenge: {
      payload: 'payload_str',
      signature: 'signature_str',
    },
    payload: 'credential_str',
  },
}

export const putParticipantsBody = {
  participants: [
    { fspId: 'example_bank', name: 'Example Bank' },
    { fspId: 'example_bank2', name: 'Example Bank 2' },
  ],
}

export const putParticipantsErrorBody = {
  errorInformation: {
    errorCode: '1234',
    errorDescription: 'Error fetching participants',
  },
}

export const putPartiesByTypeAndIdBody = {
  party: {
    partyIdInfo: {
      partyIdType: 'MSISDN',
      partyIdentifier: 'party_identifier',
    },
  },
  accounts: [
    { id: 'fspA', currency: 'USD' },
    { id: 'fspB', currency: 'SGD' },
  ],
}

export const putPartiesByTypeAndIdErrorBody = {
  errorInformation: {
    errorCode: '1234',
    errorDescription: 'Generic error',
  },
}

export const headers = {
  host: 'mojaloop.pisp-demo-server.local',
  'fspiop-source': 'pisp-2342-2233',
  'fspiop-destination': 'dfsp-3333-2123',
  date: 'Thu, 23 Jan 2020 10:22:12 GMT',
  accept: 'application/json',
  'content-type': 'application/json',
}

export const postConsentBody = {
  id: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
  requestId: 'a71ec534-ee48-4575-b6a9-ead2955b8069',
  initiatorId: 'pisp-2342-2233',
  participantId: 'pisp-2342-2233',
  scopes: exampleScopeArray,
  credential: {
    id: '9876',
    type: 'FIDO',
    status: 'PENDING',
  },
}

export const putTransfersByIdBody = {
  transactionId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
  fulfilment: 'WLctttbu2HvTsa1XWvUoGRcQozHsqeu9Ahl2JW9Bsu8',
  completedTimestamp: '2016-05-24T08:38:08.699-04:00',
  transferState: 'RECEIVED',
  extensionList: {
    extension: [{ key: 'k1', value: 'v1' }],
  },
}

// TODO: Regex pattern for Amount type
// is wrong - cannot match 1.00 etc.
// Will be fixed in #1769
export const authorizationsBody = {
  amount: {
    currency: 'USD',
    amount: '123.45',
  },
  authenticationType: 'U2F',
  quote: {
    transferAmount: {
      currency: 'USD',
      amount: '123.45',
    },
    payeeReceiveAmount: {
      currency: 'USD',
      amount: '122.45',
    },
    payeeFspFee: {
      currency: 'USD',
      amount: '0',
    },
    expiration: '2016-05-24T08:38:08.699-04:00',
    ilpPacket: 'AYIBgQAAAAAAAqUUIjpcIjkyODA2MzkxXCJ9IgA',
    condition: 'f5sqb7tBTWPd5Y8BDFdMm9BJR_MNI4isf8p8n4D5pHA',
  },
  retriesLeft: '2',
  transactionRequestId: 'a51ed534-ee48-4575-b6a9-aad2955b8099',
  transactionId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
}
