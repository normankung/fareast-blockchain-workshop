echo "//////////////////////////////////"
echo "Start to run gateway server"
echo "//////////////////////////////////"
cd ../../hyperledger-fabric-gateway
GATEWAY_PORT=4001 FABRIC_ORGNAME=org1 FABRIC_MODE=dev MONITOR=false node app.js &
echo "//////////////////////////////////"
echo "Started Gateway Server"
echo "//////////////////////////////////"