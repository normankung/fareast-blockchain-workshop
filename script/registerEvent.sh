export CHAINCODE_NAME=loyalty
export channelName=mychannel
export F_ADDRESS=http://localhost:5010
export H_ADDRESS=http://localhost:5020 
export EX_ADDRESS=http://localhost:5003 
export F_GATEWAY=http://localhost:4001
export H_GATEWAY=http://localhost:4001
export EX_GATEWAY=http://localhost:4001

echo $CHAINCODE_NAME

curl -X POST $EX_GATEWAY/event/register/ccEvent/url -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"eventName\": \"Redeem_Point\",  \"peerName\": \"peer1\",  \"url\": \"$EX_ADDRESS/fabric-event\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
curl -X POST $H_GATEWAY/event/register/ccEvent/url -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"eventName\": \"User_Exchange\",  \"peerName\": \"peer1\",  \"url\": \"$H_ADDRESS/fabric-event\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
curl -X POST $H_GATEWAY/event/register/ccEvent/url -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"eventName\": \"Settlement_Report_Finish\",  \"peerName\": \"peer1\",  \"url\": \"$H_ADDRESS/fabric-event\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
curl -X POST $H_GATEWAY/event/register/ccEvent/url -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"eventName\": \"Settle_Finish\",  \"peerName\": \"peer1\",  \"url\": \"$H_ADDRESS/fabric-event\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
curl -X POST $F_GATEWAY/event/register/ccEvent/url -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"eventName\": \"Settlement_Report_Finish\",  \"peerName\": \"peer1\",  \"url\": \"$F_ADDRESS/fabric-event\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
curl -X POST $F_GATEWAY/event/register/ccEvent/url -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"eventName\": \"Settle_Finish\",  \"peerName\": \"peer1\",  \"url\": \"$F_ADDRESS/fabric-event\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"
echo
curl -X POST $F_GATEWAY/event/register/ccEvent/url -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"chaincodeName\": \"$CHAINCODE_NAME\",  \"eventName\": \"User_Exchange\",  \"peerName\": \"peer1\",  \"url\": \"$F_ADDRESS/fabric-event\",  \"user\": {    \"enrollID\": \"orgAdmin\",    \"enrollSecret\": \"87654321\"  }}"


