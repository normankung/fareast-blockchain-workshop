# echo $CHAINCODE_NAME
CHAINCODE_NAME=loyalty
F_GATEWAY=http://localhost:4001
H_GATEWAY=http://localhost:4001
channelName=mychannel

curl -X POST $H_GATEWAY/channel/create -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"channelName\": \"$channelName\",  \"sourceType\": \"local\",  \"source\": \"mychannel.tx\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
curl -X POST $H_GATEWAY/channel/join -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"opt\": {},  \"channelName\": \"$channelName\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"

curl -X POST $F_GATEWAY/channel/join -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"opt\": {},  \"channelName\": \"$channelName\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"


curl -X POST $H_GATEWAY/chaincode/install -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodePath\": \"chaincodes/loyalty\",  \"chaincodeVersion\": \"v1\",  \"sourceType\": \"sourceCode\",  \"langType\": \"golang\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
curl -X POST $H_GATEWAY/chaincode/instantiate -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodeVersion\": \"v1\",  \"functionName\": \"Init\",  \"args\": [  ],  \"opt\": {      },  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"

curl -X POST $F_GATEWAY/chaincode/install -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodePath\": \"chaincodes/loyalty\",  \"chaincodeVersion\": \"v1\",  \"sourceType\": \"sourceCode\",  \"langType\": \"golang\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
curl -X POST $F_GATEWAY/chaincode/instantiate -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodeVersion\": \"v1\",  \"functionName\": \"Init\",  \"args\": [  ],  \"opt\": {      },  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
