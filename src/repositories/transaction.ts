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

/* eslint-disable @typescript-eslint/no-explicit-any */

import firebase from '~/lib/firebase'
import { logger } from '~/shared/logger'

export interface ITransactionRepository {
  /**
   * Updates a transaction document based on a unique identifier.
   *
   * @param id    Id for the transaction document that needs to be updated.
   * @param data  Document fields that are about to be updated.
   */
  updateById(id: string, data: Record<string, any>): Promise<void>

  /**
   * Updates one or more transaction documents based on the given conditions.
   *
   * @param conditions  Conditions for the documents that need to be updated.
   * @param data        Document fields that are about to be updated.
   */
  update(
    conditions: Record<string, any>,
    data: Record<string, any>
  ): Promise<void>
}

export class FirebaseTransactionRepository implements ITransactionRepository {
  async updateById(id: string, data: Record<string, any>): Promise<void> {
    await firebase.firestore().collection('transactions').doc(id).update(data)
  }

  async update(
    conditions: Record<string, any>,
    data: Record<string, any>
  ): Promise<void> {
    let firestoreQuery: FirebaseFirestore.Query = firebase
      .firestore()
      .collection('transactions')

    // Chain all of the given conditions to the query
    for (const key in conditions) {
      firestoreQuery = firestoreQuery.where(key, '==', conditions[key])
    }

    // Find and update all matching documents in Firebase that match the given conditions.
    await firestoreQuery
      .get()
      .then((response) => {
        // Create a batch to perform all of the updates using a single request.
        // Firebase will also execute the updates atomically according to the
        // API specification.
        const batch = firebase.firestore().batch()

        // Iterate through all matching documents add them to the processing batch.
        response.docs.forEach((doc) => {
          batch.update(
            // Put a reference to the document.
            firebase.firestore().collection('transactions').doc(doc.id),
            // Specify the updated fields and their new values.
            data
          )
        })

        // Commit the updates.
        return batch.commit()
      })
      .catch((err) => {
        logger.error(err)
      })
  }
}

export const transactionRepository: ITransactionRepository = new FirebaseTransactionRepository()
