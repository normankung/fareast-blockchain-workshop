package Org

import (
	"chaincodes/LoyaltyPoint/interfaces"
	"fmt"

	db "chaincodes/chaincode-DbWrapv1.0"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("MODEL ORG")

type Org struct {
	SeqNum     string
	OrgName    string
	OrgID      string
	HoldPoints map[string]string
	ModelName  string
}

const DbName = "ORG"
const DbSeqLength = "10"

var Db = db.NewDb(DbName, DbSeqLength)

func NewOrg(orgName, orgID string) *Org {

	return &Org{"", orgName, orgID, make(map[string]string), ""}
}
func (o *Org) SetModelName(modelName string) {
	fmt.Println("SetModelName")

	o.ModelName = modelName
	fmt.Println(o.ModelName)
}
func (o *Org) ParseJSON(dataJSON string) error {
	return interfaces.ParseJSON(dataJSON, o)
}
func (o *Org) ToJSON() (string, error) {
	return interfaces.ToJSON(o)
}
func (o *Org) Insert(stub shim.ChaincodeStubInterface) (string, error) {
	seqNum, err := Db.Insert(stub, o)
	if err != nil {
		return "", err
	}
	return seqNum, nil
}
func (o *Org) SetSeqNumber(seqNum string) {
	o.SeqNum = seqNum
}
func (o *Org) GetDb() *db.DbStruct {
	return Db
}
func (o *Org) Update(stub shim.ChaincodeStubInterface) error {
	if o.SeqNum == "" {
		return fmt.Errorf(" can not update an un-input data, use Insert first")
	}
	_, err := Db.Update(stub, o.SeqNum, o)
	if err != nil {
		return err
	}
	return nil
}
