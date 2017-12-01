chaincodeName=user
channelName=mychannel
functionName=insertNewUser
args1=\"D\" # UserID
args2=\"100\" # User's points
args=[args1,args2] 

echo "==============Create User=================="
echo
curl -X POST "http://localhost:4001/chaincode/invoke" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$chaincodeName\",  \"channelName\": \"$channelName\",  \"functionName\": \"$functionName\",  \"args\": $args,  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
echo
echo "===========Finish Create User=============="
echo