package permDb

import (
	"chaincodes/v1.0Chaincode/model"

	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

var permInfoDb = "PERM_INFO_DB"

func Insert(stub shim.ChaincodeStubInterface, data *model.PERM_INFO) ([]byte, error) {

	insertKey, err := getKeyPrefix(stub, data.ID, data.MSPID)
	if err != nil {
		return nil, err
	}
	permByte, err := stub.GetState(insertKey)
	if err != nil {
		return nil, err
	}
	if permByte != nil {
		return nil, fmt.Errorf("perm info has been set, plz use update to change it")
	}
	permJSON, err := data.ToJSON()
	if err != nil {
		return nil, err
	}
	permByte = []byte(permJSON)
	stub.PutState(insertKey, permByte)
	return []byte(insertKey), nil
}

func Update(stub shim.ChaincodeStubInterface, data *model.PERM_INFO) ([]byte, error) {

	insertKey, err := getKeyPrefix(stub, data.ID, data.MSPID)
	if err != nil {
		return nil, err
	}
	permByte, err := stub.GetState(insertKey)
	if err != nil {
		return nil, err
	}
	if permByte == nil {
		return nil, fmt.Errorf("perm info is empty, plz use insert to change it")
	}
	permJSON, err := data.ToJSON()
	if err != nil {
		return nil, err
	}
	permByte = []byte(permJSON)
	stub.PutState(insertKey, permByte)
	return []byte(insertKey), nil
}
func Get(stub shim.ChaincodeStubInterface, MSPID, ID string) (*model.PERM_INFO, error) {

	insertKey, err := getKeyPrefix(stub, ID, MSPID)
	if err != nil {
		return nil, err
	}
	permByte, err := stub.GetState(insertKey)
	if err != nil {
		return nil, err
	}
	if permByte == nil {
		return nil, fmt.Errorf("perm info is empty")
	}
	permJSON := string(permByte)
	perm := new(model.PERM_INFO)
	err = perm.ParseJSON(permJSON)
	if err != nil {
		return nil, err
	}
	return perm, nil
}
func getKeyPrefix(stub shim.ChaincodeStubInterface, ID string, MSPID string) (string, error) {
	if ID == "" {
		return "", fmt.Errorf("ID field is empty")
	}
	key, _ := stub.CreateCompositeKey(permInfoDb, []string{ID, MSPID})
	return key, nil
}
