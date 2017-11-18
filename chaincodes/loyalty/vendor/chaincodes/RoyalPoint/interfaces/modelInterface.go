package interfaces

import "github.com/op/go-logging"
import "encoding/json"

var logger = logging.MustGetLogger("CXL_MODEL")

//TODO: 上線前開啟
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
