echo $(pwd)
result=${PWD##*/}
locationNow=$(pwd)
echo $result

cd ../../
GOPATH=$(pwd)
echo "GOPATH : " $GOPATH

cd $locationNow

# remove and replace
rm -rf $GOPATH/src/$result
cp -rf $locationNow $GOPATH/src/

# go build
cd $GOPATH/src/chaincodes/loyalty
# govendor init
# govendor add +external
GOPATH=$GOPATH go build
CORE_PEER_ADDRESS=127.0.0.1:7051 CORE_CHAINCODE_ID_NAME=loyalty:v1 ./loyalty &