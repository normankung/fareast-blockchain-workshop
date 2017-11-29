echo $(pwd)
result=${PWD##*/}
locationNow=$(pwd)
echo $result
echo $locationNow

echo $GOPATH

# remove and replace
rm -rf $GOPATH/src/chaincodes/$result
cp -rf $locationNow $GOPATH/src/chaincodes
