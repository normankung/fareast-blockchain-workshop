package TxHistory

import (
	"chaincodes/loyalty/interfaces"
	"fmt"

	db "chaincodes/chaincode-DbWrapv1.0"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type TxHistory struct {
	SeqNum    string
	Date      string
	UserID    string
	TxType    string
	MetaData  string
	ModelName string
}
type ExchangeMetaData struct {
	SourceOrgID        string
	TargetOrgID        string
	ExChangeAmount     string
	TargetPointBalance string
}

const DbName = "TX_HISTORY"
const DbSeqLength = "10"

var Db = db.NewDb(DbName, DbSeqLength)

func (o *TxHistory) SetModelName(modelName string) {
	o.ModelName = modelName
}
func (o *TxHistory) ParseJSON(dataJSON string) error {
	return interfaces.ParseJSON(dataJSON, o)
}
func (o *TxHistory) ToJSON() (string, error) {
	return interfaces.ToJSON(o)
}
func (o *TxHistory) Insert(stub shim.ChaincodeStubInterface) (string, error) {
	seqNum, err := Db.Insert(stub, o)
	if err != nil {
		return "", err
	}
	return seqNum, nil
}
func (o *TxHistory) SetSeqNumber(seqNum string) {
	o.SeqNum = seqNum
}
func (o *TxHistory) GetDb() *db.DbStruct {
	return Db
}
func (o *TxHistory) Update(stub shim.ChaincodeStubInterface) error {
	if o.SeqNum == "" {
		return fmt.Errorf(" can not update an un-input data, use Insert first")
	}
	_, err := Db.Update(stub, o.SeqNum, o)
	if err != nil {
		return err
	}
	return nil
}
