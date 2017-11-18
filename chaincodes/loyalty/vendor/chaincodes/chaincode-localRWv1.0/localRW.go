package localRW

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type LocalRWInstance struct {
	stub       shim.ChaincodeStubInterface
	localRWMap map[string][]byte
}

var newestLocalRWInstance *LocalRWInstance

func NewLocalRWInstance(stub shim.ChaincodeStubInterface) *LocalRWInstance {
	fmt.Println("Start NewLocalRWInstance")
	nLRW := &LocalRWInstance{stub, make(map[string][]byte)}
	newestLocalRWInstance = nLRW
	fmt.Println(newestLocalRWInstance)

	return newestLocalRWInstance
}
func GetNewestLocalRwInstance() *LocalRWInstance {
	fmt.Println("Start GetNewestLocalRwInstance")
	fmt.Println(newestLocalRWInstance)
	return newestLocalRWInstance
}

func (t *LocalRWInstance) LocalGetState(key string) ([]byte, error) {
	if localValue, ok := t.localRWMap[key]; ok {
		return localValue, nil
	} else {
		return t.stub.GetState(key)
	}
}
func (t *LocalRWInstance) LocalPutState(key string, value []byte) error {
	t.localRWMap[key] = value
	return nil
}
func (t *LocalRWInstance) FinishPutState() error {
	for key, value := range t.localRWMap {
		err := t.stub.PutState(key, value)
		if err != nil {
			return err
		}
	}
	return nil
}
