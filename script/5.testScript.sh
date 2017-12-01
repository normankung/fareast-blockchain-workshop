chaincodeName=user
channelName=mychannel

# insertNewUser ／ queryUser ／ updatePoints ／ exchangePoint ／ redeemPoint
functionName=insertNewUser

# ["userID","Points"] / ["userID"] / ["userID","Points"] / [] / []
# Points must be string type
args=["B","0"]

echo "==============Invoke=================="
echo
curl -X POST "http://localhost:4001/chaincode/invoke" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$chaincodeName\",  \"channelName\": \"$channelName\",  \"functionName\": \"$functionName\",  \"args\": $args,  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
echo
echo "===========Finish Invoke=============="
echo