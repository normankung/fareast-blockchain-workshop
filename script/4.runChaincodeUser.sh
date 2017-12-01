pkill user
filename=user
cd ../chaincodes/$filename
echo $(pwd)
result=${PWD##*/}
locationNow=$(pwd)
echo $result
echo $locationNow

echo $GOPATH

# remove and replace
rm -rf $GOPATH/src/chaincodes/$result
cp -rf $locationNow $GOPATH/src/chaincodes

# go build
cd $GOPATH/src/chaincodes/$filename
# govendor init
# govendor add +external
GOPATH=$GOPATH go build
CORE_PEER_ADDRESS=127.0.0.1:7051 CORE_CHAINCODE_ID_NAME=$filename:v1 ./$filename &