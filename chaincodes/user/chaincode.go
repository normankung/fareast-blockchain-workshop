package main

import (
	"chaincodes/user/model/User"
	"fmt"
	"strconv"

	db "chaincodes/chaincode-DbWrapv1.0"

	localRW "chaincodes/chaincode-localRWv1.0"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("Main")

type SimpleChaincode struct {
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Debug("in the init func")

	localRWInstance := localRW.NewLocalRWInstance(stub)
	// Insert Data
	user := &User.User{"", "A", "0", ""}
	user.Insert(stub)

	localRWInstance.FinishPutState()

	return shim.Success([]byte("Success Init"))
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	fmt.Println("Invoke is running " + function)

	// Handle different functions
	if function == "insertNewUser" {
		return t.insertNewUser(stub, args)
	} else if function == "queryUser" {
		return t.queryUser(stub, args)
	} else if function == "updatePoints" {
		return t.updatePoints(stub, args)
	}

	// Function Name Error
	return shim.Error("Invoke did not find func: " + function)
}

func (t *SimpleChaincode) insertNewUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if length := len(args); length != 3 {
		return shim.Error("Error args lens, expect 3")
	}
	userID := args[1]
	points := args[2]
	localRWInstance := localRW.NewLocalRWInstance(stub)

	// Check userID exist or not
	userQuery := &User.User{}
	userDb := userQuery.GetDb()
	queryString := db.FormatQueryString([]string{"UserID", userID})
	userfindBytes, err := userDb.FindOne(stub, queryString)
	if len(userfindBytes) != 0 {
		logger.Debug(err)
		return shim.Error("UserID is exist")
	}

	// Insert Data
	user := &User.User{"", userID, points, ""}
	user.Insert(stub)
	localRWInstance.FinishPutState()
	logger.Debug("Insert Finish")
	return shim.Success([]byte("Success insertNewUser"))
}

func (t *SimpleChaincode) queryUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if length := len(args); length != 2 {
		return shim.Error("Error args lens, expect 1")
	}
	userID := args[1]
	user := &User.User{}
	userDb := user.GetDb()

	// Check UserID exist or not
	queryString := db.FormatQueryString([]string{"UserID", userID})
	userbytes, err := userDb.FindOne(stub, queryString)
	if len(userbytes) == 0 {
		logger.Debug(err)
		return shim.Error("UserID is not exist")
	}

	return shim.Success(userbytes)
}

func (t *SimpleChaincode) updatePoints(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if length := len(args); length != 3 {
		return shim.Error("Error args lens, expect 2")
	}
	userID := args[1]
	updatePointsString := args[2]
	user := &User.User{}
	userDb := user.GetDb()

	localRWInstance := localRW.NewLocalRWInstance(stub)

	// Check UserID exist or not
	queryString := db.FormatQueryString([]string{"UserID", userID})
	userbytes, err := userDb.FindOne(stub, queryString)
	if len(userbytes) == 0 {
		return shim.Error("UserID is not exist")
	}
	user.ParseJSON(string(userbytes))

	userPointString := user.Points
	userPoint, err := strconv.Atoi(userPointString)
	if err != nil {
		return shim.Error(err.(error).Error())
	}

	// Update Point
	updatePoints, err := strconv.Atoi(updatePointsString)
	if err != nil {
		return shim.Error(err.(error).Error())
	}
	finishUserPoint := userPoint + updatePoints
	user.Points = strconv.Itoa(finishUserPoint)
	logger.Debug(user)

	// Update Into DB
	err = user.Update(stub)
	if err != nil {
		logger.Debug(err)
		return shim.Error(err.(error).Error())
	}
	localRWInstance.FinishPutState()
	return shim.Success([]byte("Success Update user"))
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
