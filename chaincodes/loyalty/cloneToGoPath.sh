echo $(pwd)
result=${PWD##*/}
echo $result
rm -rf $GOPATH/src/chaincodes/$result
cp -rf ${PWD} $GOPATH/src/chaincodes/
cd $GOPATH/src/chaincodes/$result
govendor init
govendor add +external