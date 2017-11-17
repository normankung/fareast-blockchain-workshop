package SettlementReport

import (
	"chaincodes/loyalty/interfaces"
	"fmt"

	db "chaincodes/chaincode-DbWrapv1.0"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type SettlementReport struct {
	SeqNum            string
	Phase             string
	SettlementReports map[string]PointAndMoney
	Parties           []string
	HaveSettle        string
	ModelName         string
}
type PointAndMoney struct {
	Point string
	Money string
}

const DbName = "SETTLEMENT_REPORT"
const DbSeqLength = "10"

var Db = db.NewDb(DbName, DbSeqLength)

func (o *SettlementReport) SetModelName(modelName string) {
	o.ModelName = modelName
}
func (o *SettlementReport) ParseJSON(dataJSON string) error {
	return interfaces.ParseJSON(dataJSON, o)
}
func (o *SettlementReport) ToJSON() (string, error) {
	return interfaces.ToJSON(o)
}
func (o *SettlementReport) Insert(stub shim.ChaincodeStubInterface) (string, error) {
	seqNum, err := Db.Insert(stub, o)
	if err != nil {
		return "", err
	}
	return seqNum, nil
}
func (o *SettlementReport) SetSeqNumber(seqNum string) {
	o.SeqNum = seqNum
}
func (o *SettlementReport) GetDb() *db.DbStruct {
	return Db
}
func (o *SettlementReport) Update(stub shim.ChaincodeStubInterface) error {
	if o.SeqNum == "" {
		return fmt.Errorf(" can not update an un-input data, use Insert first")
	}
	_, err := Db.Update(stub, o.SeqNum, o)
	if err != nil {
		return err
	}
	return nil
}
