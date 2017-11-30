export CHAINCODE_NAME=loyalty
export channelName=mychannel
export F_ADDRESS=http://localhost:5010
export H_ADDRESS=http://localhost:5020
export EX_ADDRESS=http://localhost:5003
export F_GATEWAY=http://localhost:4001
export H_GATEWAY=http://localhost:4001
export EX_GATEWAY=http://localhost:4001

echo "//////////////////////////////////"
echo "Copy chaincodes files"
echo "//////////////////////////////////"
cd ../
cd chaincodes/chaincode-DbWrap
./cloneToGoPath.sh
cd ../loyalty
./cloneToGoPath.sh

echo "//////////////////////////////////"
echo "Finish Copy chaincodes files"
echo "//////////////////////////////////"

# trigger to install chaincode
echo "============================"
echo "trigger to install chaincode"
echo "============================"
curl -X POST $H_GATEWAY/chaincode/install -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodePath\": \"chaincodes/loyalty\",  \"chaincodeVersion\": \"v1\",  \"sourceType\": \"sourceCode\",  \"langType\": \"golang\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
# curl -X POST $F_GATEWAY/chaincode/install -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodePath\": \"chaincodes/loyalty\",  \"chaincodeVersion\": \"v1\",  \"sourceType\": \"sourceCode\",  \"langType\": \"golang\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
sleep 2s
# #instantiate from gateway 1
curl -X POST $H_GATEWAY/chaincode/instantiate -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"channelName\": \"$channelName\",  \"chaincodeVersion\": \"v1\",  \"functionName\": \"Init\",  \"args\": [  ],  \"opt\": {      },  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo

# run org shop exchange sev
echo "============================"
echo "run org shop exchange sev"
echo "============================"
cd ../../script
./startupServers.sh

echo "============================"
echo "Register Event"
echo "============================"
./registerEvent.sh