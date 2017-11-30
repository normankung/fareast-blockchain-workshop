package db

import (
	"encoding/json"
	"fmt"

	logging "github.com/op/go-logging"
)

var FILTER_DISABLED bool = false

type ModelInterface interface {
	//ParseJSON - 解析JSON格式
	ParseJSON(dataJSON string) error
	//ParseRow - 解析Row格式
	ToJSON() (string, error)
	//Filter - 內容過濾（去除子節點中所有的返回值为false的數據，返回false時，该數據應該在結果中去除）
	SetSeqNumber(seqNum string)
	SetModelName(modelName string)
}

func ParseJSON(JSONString string, data ModelInterface) error {
	err := json.Unmarshal([]byte(JSONString), data)
	return err
}
func ToJSON(data ModelInterface) (string, error) {
	JSONString, err := json.Marshal(data)

	return string(JSONString), err
}

var logger = logging.MustGetLogger("DB")

const minUnicodeRuneValue = 0

var dbMap = map[string]*DbStruct{}

func GetDbByName(dbName string) (error, *DbStruct) {
	db, ok := dbMap[dbName]
	if !ok {
		return fmt.Errorf("Db %s did not exist", dbName), nil
	}
	return nil, db
}
func NewDb(name string, seqNumberLength string) *DbStruct {
	db := &DbStruct{name, seqNumberLength, 0}
	dbMap[name] = db
	return db
}
func SetAllSeqToZero() {
	for _, db := range dbMap {
		db.seqNumToZero()
	}
}
