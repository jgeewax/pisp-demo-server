/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
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
/* istanbul ignore file */

import * as uuid from 'uuid'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import { logger } from '~/shared/logger'

import { ConsentHandler } from '~/server/plugins/internal/firestore'
import { Consent, ConsentStatus } from '~/models/consent'

import { consentRepository } from '~/repositories/consent'
import { accountRepository } from '~/repositories/account'

import * as validator from './consents.validator'
import config from '~/lib/config'
import { MissingConsentFieldsError, InvalidConsentStatusError } from '~/models/errors'
import { DemoAccount } from '~/models/demoAccount'

async function handleNewConsent(_: StateServer, consent: Consent) {
 // This operation will create an event that triggers the execution
  // of the onUpdate function.

  // If the client has already set the consentRequestId, then use it
  // instead of a random uuid.
  // 
  // that way, we allow the client to dynamically trigger rules on
  // the dfsp backend.
  let consentRequestId = uuid.v4();
  if (consent.consentRequestId) {
    consentRequestId = consent.consentRequestId
  }

  // Not await-ing promise to resolve - code is executed asynchronously
  consentRepository.updateConsentById(consent.id, {
    consentRequestId,
    // consentRequestId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
    status: ConsentStatus.PENDING_PARTY_LOOKUP,
  })
}

async function initiatePartyLookup(server: StateServer, consent: Consent) {
  // Check whether the consent document has all the necessary properties
  // to perform a party lookup.
  if (!validator.isValidPartyLookup(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  // Fields are guaranteed to be non-null by the validator.
  try {
    server.app.mojaloopClient.getAccounts(
      consent.party!.partyIdInfo.partyIdentifier,
      consent.participantId!
    )
  } catch (error) {
    logger.error(error)
  }
}

/**
 * Send a PATCH /consentRequests/{ID} to the DFSP with the authToken 
 * @param server 
 * @param consent 
 */
async function initiateAuthentication(server: StateServer, consent: Consent) {
  if (!validator.isValidAuthentication(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  // Fields are guaranteed to be non-null by the validator.
  try {
    server.app.mojaloopClient.patchConsentRequests(
      consent.consentRequestId!,
      {
        authToken: consent.authToken!,
      },
      consent.party!.partyIdInfo.fspId!
    )
  } catch (error) {
    logger.error(error)
  }
}

async function initiateConsentRequest(server: StateServer, consent: Consent) {
  // TODO: mssing some fields... maybe we need to add them to the initial thingy
  logger.info('initiateConsentRequest')
  if (!validator.isValidConsentRequest(consent)) {
    logger.error('initiateConsentRequest - invalid fields')
    throw new MissingConsentFieldsError(consent)
  }
  // If the update contains all the necessary fields, process document

  try {
    // Fields are guaranteed to be non-null by the validator.
    server.app.mojaloopClient.postConsentRequests(
      {
        consentRequestId: consent.consentRequestId!,
        //TODO: find the userId
        userId: 'user@example.com',
        scopes: consent.scopes!,
        authChannels: consent.authChannels!,
        callbackUri: config.get('mojaloop').pispCallbackUri,
      },
      consent.party!.partyIdInfo.fspId!
    )
  } catch (err) {
    logger.error(err)
  }
}


async function handleSignedChallenge(server: StateServer, consent: Consent) {
  logger.info('handleSignedChallenge')

  if (!validator.isValidConsentWithSignedCredential(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    // Fields are guaranteed to be non-null by the validator.
    server.app.mojaloopClient.putConsentId(
      consent.consentId!,
      {
        scopes: consent.scopes!,
        // Cast here as we know that the credential at this point will be a signed credential
        credential: consent.credential as tpAPI.Schemas.SignedCredential
       
      },
      consent.party!.partyIdInfo.fspId!
    )
  } catch (error) {
    logger.error(error)
  }
}

async function onConsentActivated(_server: StateServer, consent: Consent) {
  logger.info('onConsentActivated')

  // TODO: this validator is likely wrong!!!
  if (!validator.isValidConsentWithVerifiedCredential(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  // Internally, the client needs this as an array buffer
  // we could do the conversion on the client, but for now
  // this works fine.
  const keyHandleIdBuffer = Buffer.from(consent.credential?.payload?.rawId!, 'base64')
  const keyHandleId = [ ...keyHandleIdBuffer ]

  try {
    // This is a useful setting that makes demos work much more reliably
    // since users can't accidentally select a key that was registered on
    // a different device
    if (config.get('overwriteExistingAccountsForUser')) {
      //replace the existing accounts for this user
      await accountRepository.deleteForUser(consent.userId!)
    }

    if (consent.accounts!.length < 2) {
      // Create accounts for each of the linked accounts
      // TODO: revise consent to get the proper accountNickname fields
      const demoAccount: DemoAccount = {
        alias: 'Transaction Account',
        fspInfo: {
          id: consent.party?.partyIdInfo.fspId!,
          // TODO: load proper name!
          name: consent.party?.partyIdInfo.fspId!
        },
        sourceAccountId: '1234-1234-1234-1234',
        userId: consent.userId!,
        keyHandleId,
        consentId: consent.consentId!
      }
      await accountRepository.insert(demoAccount)
    } else {
      // Create accounts for each of the linked accounts
      // TODO: revise consent to get the proper accountNickname fields
      const demoAccount: DemoAccount = {
        alias: 'Transaction Account',
        fspInfo: {
          id: consent.party?.partyIdInfo.fspId!,
          // TODO: load proper name!
          name: consent.party?.partyIdInfo.fspId!
        },
        sourceAccountId: '1234-1234-1234-1234',
        userId: consent.userId!,
        keyHandleId,
        consentId: consent.consentId!
      }
      const demoAccount2: DemoAccount = {
        alias: 'Chequing Account',
        fspInfo: {
          id: consent.party?.partyIdInfo.fspId!,
          // TODO: load proper name!
          name: consent.party?.partyIdInfo.fspId!
        },
        sourceAccountId: '1234-1234-1234-1234',
        userId: consent.userId!,
        keyHandleId,
        consentId: consent.consentId!
      }
      await accountRepository.insert(demoAccount)
      await accountRepository.insert(demoAccount2)
    }

  } catch (error) {
    logger.error(error)
  }
}

async function initiateRevokingConsent(server: StateServer, consent: Consent) {
  if (!validator.isValidGenerateChallengeOrRevokeConsent(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    // Fields are guaranteed to be non-null by the validator.
    //@ts-ignore - TODO Implement
    server.app.mojaloopClient.postRevokeConsent(
      consent.consentId!,
      consent.party!.partyIdInfo.fspId!
    )
  } catch (error) {
    logger.error(error)
  }
}

export const onCreate: ConsentHandler = async (
  server: StateServer,
  consent: Consent
): Promise<void> => {
  if (consent.status) {
    // Skip transaction that has been processed previously.
    // We need this because when the server starts for the first time,
    // all existing documents in the Firebase will be treated as a new
    // document.
    return
  }

  await handleNewConsent(server, consent)
}

export const onUpdate: ConsentHandler = async (
  server: StateServer,
  consent: Consent
): Promise<void> => {
  if (!consent.status) {
    // Status is expected to be null only when the document is created for the first
    // time by the user.
    logger.error('Invalid consent, undefined status.')
    return
  }

  switch (consent.status) {
    case ConsentStatus.PENDING_PARTY_LOOKUP:
      await initiatePartyLookup(server, consent)
      break

    case ConsentStatus.PENDING_PARTY_CONFIRMATION:
      logger.info("no need to handle PENDING_PARTY_CONFIRMATION state - waiting for user input")
      break

    case ConsentStatus.PARTY_CONFIRMED:
      await initiateConsentRequest(server, consent)
      break

    case ConsentStatus.AUTHENTICATION_REQUIRED:
      logger.info("no need to handle AUTHENTICATION_REQUIRED state - waiting for user input")
      break

    case ConsentStatus.AUTHENTICATION_COMPLETE:
      await initiateAuthentication(server, consent)
      break

    case ConsentStatus.CONSENT_GRANTED:
      logger.info("no need to handle CONSENT_GRANTED state - waiting for user input")
      break

    case ConsentStatus.CHALLENGE_GENERATED:
      logger.info("no need to handle CHALLENGE_GENERATED state - waiting for user input")
      break

    case ConsentStatus.CHALLENGE_SIGNED:
      await handleSignedChallenge(server, consent)
      break

    case ConsentStatus.ACTIVE:
      await onConsentActivated(server, consent)
      break

    case ConsentStatus.REVOKE_REQUESTED:
      await initiateRevokingConsent(server, consent)
      break

    default:
      throw new InvalidConsentStatusError(consent.status, consent.id)
  }
}
