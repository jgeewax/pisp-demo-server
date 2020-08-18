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
 - Raman Mangla <ramanmangla@google.com>
 --------------
 ******/

import Path from 'path'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import { Server, ServerRegisterPluginObject } from '@hapi/hapi'

import config from '~/lib/config'

// Import necessary files to setup openapi
import { OpenApi, OpenApiOpts } from './internal/openapi'
import {
  extHandlers,
  appApiHandlers,
  mojaloopApiHandlers,
} from '~/server/handlers/openapi'

// Import necessary files to setup firestore
import { Firestore, FirestoreOpts } from './internal/firestore'
import firestoreHandlers from '~/server/handlers/firestore'

// Import necessary files to setup mojaloop client
import { MojaloopClient, MojaloopClientOpts } from './internal/mojaloopClient'

// Import necessary files to setup mojaloop simulator
import {
  MojaloopSimulator,
  MojaloopSimulatorOpts,
} from './internal/mojaloopSimulator'

// Config for openapi
const openApiOpts: OpenApiOpts = {
  baseHost: config.get('hostname'),
  definition: {
    app: Path.resolve(__dirname, '../../../dist/openapi/app.yaml'),
    mojaloop: Path.resolve(__dirname, '../../../dist/openapi/mojaloop.yaml'),
  },
  quick: false,
  strict: true,
  handlers: {
    api: {
      app: appApiHandlers,
      mojaloop: mojaloopApiHandlers,
    },
    ext: extHandlers,
  },
}

// Config for firestore
const firestoreOpts: FirestoreOpts = {
  handlers: firestoreHandlers,
}

// Config for mojaloop client
export const mojaloopClientOpts: MojaloopClientOpts = {
  mojaloopUrl: config.get('mojaloop.url'),
  participantId: config.get('request.participantId'),
  alsEndpoint: config.get('request.alsEndpoint'),
  thirdpartyRequestsEndpoint: config.get('request.thirdpartyRequestsEndpoint'),
  transactionRequestsEndpoint: config.get(
    'request.transactionRequestsEndpoint'
  ),
  peerEndpoint: config.get('request.peerEndpoint'),
}

// Config for mojaloop simulator
const mojaloopSimulatorOpts: MojaloopSimulatorOpts = {
  host: 'mojaloop.' + config.get('hostname'),
  delay: config.get('experimental.delay'),
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

  if (config.get('experimental.mode') === 'on') {
    await server.register({
      plugin: MojaloopSimulator,
      options: mojaloopSimulatorOpts,
    })
  }

  return server
}

export default {
  register,
  plugins,
}
