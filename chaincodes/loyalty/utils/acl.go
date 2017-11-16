package utils

import (
	"crypto/x509"
	"encoding/pem"
	"fmt"

	"github.com/golang/protobuf/proto"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/msp"
)

func GetMSPIDAndEnrollID(stub shim.ChaincodeStubInterface) ([]string, error) {
	Creater, err := stub.GetCreator()
	if err != nil {
		return nil, fmt.Errorf("get Creater failed")
	}
	SerializedIdentity := new(msp.SerializedIdentity)
	err = proto.Unmarshal(Creater, SerializedIdentity)
	if err != nil {
		return nil, fmt.Errorf("fail get id")
	}

	certs := SerializedIdentity.GetIdBytes()
	pemByte, _ := pem.Decode(certs)
	cert, err := x509.ParseCertificate(pemByte.Bytes)
	if err != nil {
		return nil, fmt.Errorf("fail parse cert")
	}
	MSPID := SerializedIdentity.GetMspid()
	res := []string{MSPID, cert.Subject.CommonName}
	return res, nil
}
