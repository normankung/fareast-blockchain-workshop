export channelName=mychannel
export F_GATEWAY=http://localhost:4001
export H_GATEWAY=http://localhost:4001

./runHyperledger.sh
./runGateway.sh
# Build channel and chaincode
# Create channel
sleep 15s
echo "//////////////////////////////////"
echo "Start to create and join channel"
echo "//////////////////////////////////"
curl -X POST $H_GATEWAY/channel/create -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"channelName\": \"$channelName\",  \"sourceType\": \"local\",  \"source\": \"mychannel.tx\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
sleep 2s
# Join channel
curl -X POST $H_GATEWAY/channel/join -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"opt\": {},  \"channelName\": \"$channelName\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"