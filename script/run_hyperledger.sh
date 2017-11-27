export channelName=mychannel
export F_GATEWAY=http://localhost:4001
export H_GATEWAY=http://localhost:4001

echo "//////////////////////////////////"
echo "Git Clone Hyperledger-fabric"
echo "//////////////////////////////////"
cd ../../
# git clone https://github.com/as93717913/hyperledger-fabric-gateway.git
cd hyperledger-fabric-gateway

echo "//////////////////////////////////"
echo "Start to intall node js paackagese"
echo "//////////////////////////////////"
npm install
echo
echo "//////////////////////////////////"
echo "copy protos to hyperutil folder"
echo "//////////////////////////////////"
cp -r ./node_modules/fabric-client/lib/protos ./hyperledgerUtil/
echo
echo "//////////////////////////////////"
echo "copy protos to hyperutil folder finish"
echo "//////////////////////////////////"
echo
echo "//////////////////////////////////"
echo "Start to build configtxlator"
echo "//////////////////////////////////"
GOPATH=$(pwd)/gopath
echo $GOPATH
cd gopath/src/configtxlator
GOPATH=$GOPATH go build

# Docker Compose & run server
echo "//////////////////////////////////"
echo "Docker Compose"
echo "//////////////////////////////////"
cd ../../../
cd artifacts/composeFile
docker-compose -f one-org-solo-couch-dev.yaml up -d
docker-compose -f mongo.yaml up -d

echo "//////////////////////////////////"
echo "Start to run gateway server"
echo "//////////////////////////////////"
cd ../../
GATEWAY_PORT=4001 FABRIC_ORGNAME=org1 FABRIC_MODE=dev MONITOR=false node app.js &
echo "//////////////////////////////////"
echo "Started Gateway Server"
echo "//////////////////////////////////"


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