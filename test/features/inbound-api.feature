Feature: Mojaloop API

Scenario Outline: Endpoint for <OperationId> returns 200 or 202
  Given pisp-demo-server
  When I sent a <OperationId> request
  Then I should get a <StatusCode> response

  Examples: 
    | OperationId                | StatusCode | 
    | putConsentRequestsById     | 200        | 
    | putConsentsById            | 200        | 
    | putParticipants            | 200        | 
    | putParticipantsError       | 200        | 
    | putPartiesByTypeAndId      | 200        | 
    | putPartiesByTypeAndIdError | 200        | 
    | postConsents               | 202        | 
    | putTransfersById           | 200        | 
    | authorizations             | 202        | 