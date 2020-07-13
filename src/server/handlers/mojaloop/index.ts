/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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

import * as Health from '../health'

import * as MojaloopAuthorizations from './authorizations'
import * as MojaloopConsents from './consents'
import * as MojaloopConsentsById from './consents/{ID}'
import * as MojaloopConsentRequestsById from './consentRequests/{ID}'
import * as MojaloopParticipants from './participants'
import * as MojaloopParticipantsError from './participants/error'
import * as MojaloopPartiesByTypeAndId from './parties/{Type}/{ID}'
import * as MojaloopPartiesByTypeAndIdError from './parties/{Type}/{ID}/error'
import * as MojaloopThirdpartyRequestsTransactionsById from './thirdpartyRequests/transactions/{ID}'

export const apiHandlers = {
  getHealth: Health.get,

  postAuthorizations: MojaloopAuthorizations.post,
  postConsents: MojaloopConsents.post,
  putConsentsById: MojaloopConsentsById.put,
  deleteConsentsById: MojaloopConsentsById.remove,
  putConsentRequestsById: MojaloopConsentRequestsById.put,
  putParticipants: MojaloopParticipants.put,
  putParticipantsError: MojaloopParticipantsError.put,
  putPartiesByTypeAndId: MojaloopPartiesByTypeAndId.put,
  putPartiesByTypeAndIdError: MojaloopPartiesByTypeAndIdError.put,
  putThirdpartyRequestsTransactionsById: MojaloopThirdpartyRequestsTransactionsById.put,
}