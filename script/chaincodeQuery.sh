chaincodeName=user
channelName=mychannel
functionName=queryUser
args=[\"D\"] # UserID

echo "==============Query User=================="
echo
curl -X POST "http://localhost:4001/chaincode/invoke" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$chaincodeName\",  \"channelName\": \"$channelName\",  \"functionName\": \"$functionName\",  \"args\": $args,  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
echo
echo "===========Finish Query User=============="
echo