package db

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"chaincodes/loyalty/config"
	"chaincodes/loyalty/interfaces"

	localRW "chaincodes/chaincode-localRWv1.0"

	"github.com/hyperledger/fabric/protos/ledger/queryresult"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("DB")

const minUnicodeRuneValue = 0

type DbStruct struct {
	Name            string
	SeqNumberLength string
}

var dbMap = map[string]*DbStruct{}

func GetDbByName(dbName string) (error, *DbStruct) {
	db, ok := dbMap[dbName]
	if !ok {
		return fmt.Errorf("Db %s did not exist", dbName), nil
	}
	return nil, db
}
func NewDb(name string, seqNumberLength string) *DbStruct {
	db := &DbStruct{name, seqNumberLength}
	dbMap[name] = db
	return db
}
func (db *DbStruct) Insert(stub shim.ChaincodeStubInterface, data interfaces.ModelInterface) (string, error) {
	lRW := localRW.GetNewestLocalRwInstance()
	seqByte, err := lRW.LocalGetState(db.getSeqNumKey())
	if seqByte == nil {
		seqByte = []byte("1")
	}
	seqString := string(seqByte)
	formatedSeqString := fmt.Sprintf("%0"+db.SeqNumberLength+"s", seqString)
	fmt.Printf("formatted seq Num for %s ", db.Name)
	fmt.Println(formatedSeqString)
	data.SetSeqNumber(formatedSeqString)
	data.SetModelName(db.Name)
	dataJSONStr, err := interfaces.ToJSON(data)
	fmt.Println("JSON string")
	fmt.Println(dataJSONStr)

	if err != nil {
		return "", nil
	}
	err = lRW.LocalPutState(db.getSeqKey(stub, formatedSeqString), []byte(dataJSONStr))
	if err != nil {
		return "", err
	}
	seqInt, err := strconv.Atoi(seqString)
	if err != nil {
		return "", err
	}
	seqInt++
	fmt.Printf("next seq Num for %s ", db.Name)
	fmt.Println(seqInt)
	lRW.LocalPutState(db.getSeqNumKey(), []byte(strconv.Itoa(seqInt)))
	return "key : " + (seqString), nil
}

func (db *DbStruct) Get(stub shim.ChaincodeStubInterface, key string) ([]byte, error) {
	seqKey := db.getSeqKey(stub, key)
	dataByte, err := stub.GetState(seqKey)
	if err != nil {

		return nil, err
	}

	if dataByte == nil {
		return nil, fmt.Errorf("Data not found")
	}
	return dataByte, nil
}
func (db *DbStruct) FindOne(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {
	findResultsBytes, err := db.Find(stub, queryString)
	if err != nil {
		return nil, err
	}
	if len(findResultsBytes) == 0 {
		return nil, nil
	}
	if len(findResultsBytes) == 2 {
		return nil, fmt.Errorf("Data did not exist")
	}
	findResults := ParseFindResults(findResultsBytes)
	return []byte(findResults[0]), nil
}
func (db *DbStruct) Find(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {
	if config.DB_TYEP == "COUCH" {
		fmt.Println("queryString")
		fmt.Println(queryString)
		addModelNameMap := map[string]string{}
		json.Unmarshal([]byte(queryString), &addModelNameMap)
		addModelNameMap["ModelName"] = db.Name
		addModelNameMapBytes, err := json.Marshal(addModelNameMap)
		if err != nil {
			return nil, err
		}
		addModelNameString := string(addModelNameMapBytes)

		var queryString2 string
		if queryString == "" {
			queryString2 = "{\"selector\":{}}"
		} else {
			queryString2 = fmt.Sprintf("{\"selector\":%s}", addModelNameString)
		}
		fmt.Println("queryString2")
		fmt.Println(queryString2)
		resultBytes, err := getQueryResultForQueryString(stub, queryString2)
		if err != nil {
			return nil, err
		}
		return resultBytes, nil
	} else {
		return nil, nil
	}
}
func (db *DbStruct) Update(stub shim.ChaincodeStubInterface, seqNum string, doc interfaces.ModelInterface) ([]byte, error) {
	lRW := localRW.GetNewestLocalRwInstance()
	key := db.getSeqKey(stub, seqNum)
	jsonString, err := doc.ToJSON()
	if err != nil {
		return nil, err
	}
	lRW.LocalPutState(key, []byte(jsonString))
	return []byte(seqNum), nil
}
func getQueryResultForLevelDB(stub shim.ChaincodeStubInterface, queryString string, db *DbStruct) ([]byte, error) {
	critiriaMap := make(map[string]interface{})
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false

	err := json.Unmarshal([]byte(queryString), &critiriaMap)
	if err != nil {
		return nil, err
	}
	seqNumKey := db.getSeqNumKey()
	nowSeqNumByte, err := stub.GetState(seqNumKey)
	if err != nil {
		return nil, err
	}
	if nowSeqNumByte == nil {
		return nil, fmt.Errorf("no data in this db")
	}
	nowSeqNum, _ := strconv.Atoi(string(nowSeqNumByte))
	logger.Debug("now seq :", nowSeqNum)
	sq, err := stub.GetStateByPartialCompositeKey(db.Name, []string{})
	if err != nil {
		return nil, err
	}
	for {
		if sq.HasNext() {
			result, err := sq.Next()
			if err != nil {
				continue
			}
			storeDataMap := make(map[string]interface{})
			if err := json.Unmarshal(result.GetValue(), storeDataMap); err != nil {
				continue
			}
			if compareMap(critiriaMap, storeDataMap) {
				writeResultIntoResultArray(stub, &buffer, result, bArrayMemberAlreadyWritten)

				bArrayMemberAlreadyWritten = true

			}
		} else {
			break
		}
	}
	buffer.WriteString("]")
	return buffer.Bytes(), nil

}
func compareMap(critiriaMap, comparedMap map[string]interface{}) bool {
	for critiriaKey, critiriaElement := range critiriaMap {
		comparedElement, exist := comparedMap[critiriaKey]
		if exist {
			if critiriaString, critiriaStringCanConvert := critiriaElement.(string); critiriaStringCanConvert {
				if comparedString, comparedStringCanConvert := comparedElement.(string); comparedStringCanConvert {
					if critiriaString == comparedString {
					} else {
						return false
					}
				}

			} else {
				if critiria2Map, critiria2MapCanConvert := critiriaElement.(map[string]interface{}); critiria2MapCanConvert {
					if compared2Map, compared2MapCanConvert := comparedElement.(map[string]interface{}); compared2MapCanConvert {
						if !compareMap(critiria2Map, compared2Map) {
							return false
						}
					}
				}

			}
		} else {
			return false
		}

	}
	return true
}
func writeResultIntoResultArray(stub shim.ChaincodeStubInterface, resultArray *bytes.Buffer, queryResponse *queryresult.KV, hasWrite bool) {
	if hasWrite == true {
		resultArray.WriteString(",")
	}

	// Record is a JSON object, so we write as-is
	resultArray.WriteString(string(queryResponse.Value))

}
func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		writeResultIntoResultArray(stub, &buffer, queryResponse, bArrayMemberAlreadyWritten)

		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}
func (db *DbStruct) ListAll(stub shim.ChaincodeStubInterface) ([]byte, error) {
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false

	seqNumKey := db.getSeqNumKey()
	nowSeqNumByte, err := stub.GetState(seqNumKey)
	if err != nil {
		return nil, err
	}
	if nowSeqNumByte == nil {
		return nil, fmt.Errorf("no data in this db")
	}
	nowSeqNum, _ := strconv.Atoi(string(nowSeqNumByte))
	logger.Debug("now seq :", nowSeqNum)
	sq, err := stub.GetStateByPartialCompositeKey(db.Name, []string{})
	if err != nil {
		return nil, err
	}
	for {
		if sq.HasNext() {
			result, err := sq.Next()
			if err != nil {
				continue
			}
			writeResultIntoResultArray(stub, &buffer, result, bArrayMemberAlreadyWritten)
			bArrayMemberAlreadyWritten = true
		} else {
			break
		}
	}
	buffer.WriteString("]")
	return buffer.Bytes(), nil
}

func (db *DbStruct) getSeqNumKey() string {
	return db.Name + "_SEQ"
}

func (db *DbStruct) getSeqKey(stub shim.ChaincodeStubInterface, index string) string {
	key, _ := stub.CreateCompositeKey(db.Name, []string{index})
	return key
}

func ParseFindResults(findResultsBytes []byte) []string {
	prefindResults := []interface{}{}
	json.Unmarshal(findResultsBytes, &prefindResults)
	findResult := make([]string, len(prefindResults))
	for index, element := range prefindResults {
		modelByte, _ := json.Marshal(element)
		modelJSONString := string(modelByte)
		findResult[index] = modelJSONString
	}
	return findResult
}

// only support first lay format
func FormatQueryString(a []string) string {
	queryMap := make(map[string]string)
	for index, element := range a {
		if index%2 == 0 {
			queryMap[element] = a[index+1]
		}
	}
	queryStringByte, _ := json.Marshal(queryMap)
	return string(queryStringByte)
}
