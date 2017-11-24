
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


