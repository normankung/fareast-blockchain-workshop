/*
Copyright IBM Corp. 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

//WARNING - this chaincode's ID is hard-coded in chaincode_example04 to illustrate one way of
//calling chaincode from a chaincode. If this example is modified, chaincode_example04.go has
//to be modified as well with the new ID of chaincode_example02.
//chaincode_exampl e05 show's how chaincode ID can be passed in as a parameter instead of
//hard-coding.

import (
	"fmt"
	"reflect"

	localRW "chaincodes/chaincode-localRWv1.0"

	"chaincodes/loyalty/control"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("Main")

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Debug("in the init func")
	function, args := stub.GetFunctionAndParameters()
	d := new(control.InitInterface)

	result, err := CallFuncByName(d, stub, function, args)
	if err != "" {
		return shim.Error(err)

	}
	return shim.Success(result)
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	function, args := stub.GetFunctionAndParameters()

	d := new(control.InvokeInterface)

	// invoke chaincode with Function Name
	result, err := CallFuncByName(d, stub, function, args)
	if err != "" {
		return shim.Error(err)

	}
	//Return value
	return shim.Success(result)
}

func CallFuncByName(myClass interface{}, stub shim.ChaincodeStubInterface, funcName string, args []string) ([]byte, string) {
	myClassValue := reflect.ValueOf(myClass)
	m := myClassValue.MethodByName(funcName)
	if !m.IsValid() {
		return nil, fmt.Sprintf("Method not found \"%s\"", funcName)
	}
	localRWInstance := localRW.NewLocalRWInstance(stub)
	in := make([]reflect.Value, 0)
	in = append(in, reflect.ValueOf(stub))
	in = append(in, reflect.ValueOf(args))
	out := m.Call(in)
	result := out[0].Bytes()
	finalErr := ""
	err := out[1].Interface()

	if err == nil {
		fErr := localRWInstance.FinishPutState()
		if fErr != nil {
			finalErr = fErr.Error()
		}
	} else {

		finalErr = err.(error).Error()
	}
	return result, finalErr
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
