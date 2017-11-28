package User

import (
	"chaincodes/user/interfaces"
	"fmt"

	db "chaincodes/chaincode-DbWrapv1.0"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type User struct {
	SeqNum    string
	UserID    string
	Points    string
	ModelName string
}

const DbName = "USERTEST"
const DbSeqLength = "10"

var Db = db.NewDb(DbName, DbSeqLength)

func (o *User) SetModelName(modelName string) {
	o.ModelName = modelName
}
func (o *User) ParseJSON(dataJSON string) error {
	return interfaces.ParseJSON(dataJSON, o)
}
func (o *User) ToJSON() (string, error) {
	return interfaces.ToJSON(o)
}

func (o *User) Insert(stub shim.ChaincodeStubInterface) (string, error) {

	seqNum, err := Db.Insert(stub, o)
	if err != nil {
		return "", err
	}
	return seqNum, nil
}
func (o *User) SetSeqNumber(seqNum string) {
	o.SeqNum = seqNum
}
func (o *User) GetDb() *db.DbStruct {
	return Db
}
func (o *User) Update(stub shim.ChaincodeStubInterface) error {
	if o.SeqNum == "" {
		return fmt.Errorf(" can not update an un-input data, use Insert first")
	}
	_, err := Db.Update(stub, o.SeqNum, o)
	if err != nil {
		return err
	}
	return nil
}
