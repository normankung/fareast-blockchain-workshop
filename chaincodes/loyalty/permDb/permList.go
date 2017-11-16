package permDb

import (
	"chaincodes/v1.0Chaincode/model"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func PermInfoInit(stub shim.ChaincodeStubInterface) error {

	_, err := Insert(stub, &model.PERM_INFO{ID: "norman", MSPID: "org1MSP", ROLE_NO: model.ROLE_NO_ADMIN, ORG_TYPE: model.ORG_TYPE_HOSP, ORG_NO: "0"})
	if err != nil {
		return err
	}
	return nil
}
