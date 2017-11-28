channelName=mychannel
CHAINCODE_NAME=user
F_GATEWAY=http://localhost:4001
H_GATEWAY=http://localhost:4001

# trigger to install chaincode
echo "============================"
echo "trigger to install chaincode"
echo "============================"
curl -X POST $H_GATEWAY/chaincode/install -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodePath\": \"chaincodes/loyalty\",  \"chaincodeVersion\": \"v1\",  \"sourceType\": \"sourceCode\",  \"langType\": \"golang\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
./run_chaincodeUser.sh
# curl -X POST $F_GATEWAY/chaincode/install -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodePath\": \"chaincodes/loyalty\",  \"chaincodeVersion\": \"v1\",  \"sourceType\": \"sourceCode\",  \"langType\": \"golang\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
sleep 2s
# #instantiate from gateway 1
curl -X POST $H_GATEWAY/chaincode/instantiate -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodeVersion\": \"v1\",  \"functionName\": \"Init\",  \"args\": [  ],  \"opt\": {      },  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo