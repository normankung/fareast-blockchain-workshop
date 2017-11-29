pkill loyalty
filename1=chaincode-DbWrapv1.0
filename2=chaincode-localRWv1.0
filename3=loyalty

cd ../chaincodes
echo "pwd : " $(pwd)
result=${PWD##*/}
locationNow=$(pwd)
echo "result : " $result
echo "GOPATH : " $GOPATH

# remove and replace
# rm -rf $GOPATH/src/$result/$filename1
# cp -rf $locationNow $GOPATH/src/

# # go build
# cd $GOPATH/src/chaincodes/loyalty
# # govendor init
# # govendor add +external
# GOPATH=$GOPATH go build
# CORE_PEER_ADDRESS=127.0.0.1:7051 CORE_CHAINCODE_ID_NAME=loyalty:v1 ./loyalty &