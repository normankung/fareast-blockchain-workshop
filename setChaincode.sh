NOWFOLDER=$(pwd)
chaincodePath=$NOWFOLDER/chaincodes
echo $chaincodePath
echo $GOPATH
# mkdir $GOPATH/src/chaincodes
ln -s $chaincodePath/* $GOPATH/src/chaincodes