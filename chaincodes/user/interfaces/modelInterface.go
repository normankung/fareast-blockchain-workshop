package interfaces

import "encoding/json"

type ModelInterface interface {
	ParseJSON(dataJSON string) error
	ToJSON() (string, error)
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
