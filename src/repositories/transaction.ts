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

/* istanbul ignore file */

import firebase from '~/lib/firebase'
import { logger } from '~/shared/logger'

export interface ITransactionRepository {
  // TD: Lewis hacky
  insert(data: Record<string, unknown>): Promise<string>

  /**
   * Updates a transaction document based on a unique identifier.
   *
   * @param id    Id for the transaction document that needs to be updated.
   * @param data  Document fields that are about to be updated.
   */
  updateById(id: string, data: Record<string, unknown>): Promise<void>

  /**
   * Updates one or more transaction documents based on the given conditions.
   *
   * @param conditions  Conditions for the documents that need to be updated.
   * @param data        Document fields that are about to be updated.
   */
  update(
    conditions: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<void>
}

export class FirebaseTransactionRepository implements ITransactionRepository {
  // TD: Lewis hacky to get some tests working
  async insert(data: Record<string, unknown>): Promise<string> {
    const ref = await firebase.firestore().collection('transactions').doc()
    // Make sure we set the id correctly
    data.id = ref.id
    await ref.set(data)
    return (data.id as unknown) as string
  }

  async updateById(id: string, data: Record<string, unknown>): Promise<void> {
    // await firebase.firestore().collection('transactions').doc(id).update(data)
    // TD - LD hack - just so we can merge things easier
    const options: FirebaseFirestore.SetOptions = {
      merge: true,
    }
    await firebase
      .firestore()
      .collection('transactions')
      .doc(id)
      .set(data, options)
  }

  async update(
    conditions: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      let firestoreQuery: FirebaseFirestore.Query = firebase
        .firestore()
        .collection('transactions')

      // Chain all of the given conditions to the query
      for (const key in conditions) {
        firestoreQuery = firestoreQuery.where(key, '==', conditions[key])
      }

      // Find and update all matching documents in Firebase that match the given conditions.
      const response = await firestoreQuery.get()
      console.log(
        'transaction::update, found docs for conditions',
        response.docs,
        conditions
      )

      if (response.docs.length === 0) {
        console.log(
          'transaction::update - WARNING: found no docs for conditions',
          conditions
        )
      }
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
      await batch.commit()
    } catch (error) {
      logger.error(error)
    }
  }
}

export const transactionRepository: ITransactionRepository = new FirebaseTransactionRepository()
