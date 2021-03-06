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
 - Raman Mangla <ramanmangla@google.com>
 --------------
 ******/

import Path from 'path'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import { Server, ServerRegisterPluginObject } from '@hapi/hapi'

import config from '~/lib/config'

// Import necessary files to setup openapi
import { OpenApi, Options as OpenApiOptions } from './internal/openapi'
import {
  extHandlers,
  appApiHandlers,
  mojaloopApiHandlers,
} from '~/server/handlers/openapi'

// Import necessary files to setup firestore
import { Firestore, Options as FirestoreOptions } from './internal/firestore'
import firestoreHandlers from '~/server/handlers/firestore'

// Import necessary files to setup mojaloop client
import {
  MojaloopClient,
  Options as MojaloopClientOpts,
} from '~/shared/ml-thirdparty-client/hapi-plugin'


// Config for openapi
const openApiOpts: OpenApiOptions = {
  shared: {
    baseHost: config.get('hostname'),
    quick: false,
    strict: true,
  },
  app: {
    definition: Path.resolve(__dirname, '../../../src/interface/app.yaml'),
    basePath: 'app',
    handlers: {
      api: appApiHandlers,
      ext: extHandlers,
    },
  },
  mojaloop: {
    definition: Path.resolve(__dirname, '../../../src/interface/mojaloop.yaml'),
    basePath: 'mojaloop',
    handlers: {
      api: mojaloopApiHandlers,
      ext: extHandlers,
    },
  }
}

// Config for firestore
const firestoreOpts: FirestoreOptions = {
  handlers: firestoreHandlers,
}

// Config for Mojaloop client
export const mojaloopClientOpts: MojaloopClientOpts = {
  participantId: config.get('participantId'),
  endpoints: {
    fspiop: config.get('fspiopAPIURL'),
    thirdparty: config.get('thirdpartyAPIURL'),
    tempTransactionRequestService: config.get('tempTransactionRequestServiceAPIURL'),
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugins: Array<ServerRegisterPluginObject<any>> = [
  { plugin: Inert },
  { plugin: Vision },
  {
    plugin: OpenApi,
    options: openApiOpts,
  },
  {
    plugin: Firestore,
    options: firestoreOpts,
  },
  {
    plugin: MojaloopClient,
    options: mojaloopClientOpts,
  },
]

async function register(server: Server): Promise<Server> {
  await server.register(plugins)
  return server
}

export default {
  register,
  plugins,
}
