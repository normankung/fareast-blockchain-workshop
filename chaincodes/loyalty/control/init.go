package control

import (
	"chaincodes/LoyaltyPoint/config"
	"chaincodes/LoyaltyPoint/model/Org"
	"chaincodes/LoyaltyPoint/model/User"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("CONTROL")

//WARNING - this chaincode's ID is hard-coded in chaincode_example04 to illustrate one way of
//calling chaincode from a chaincode. If this example is modified, chaincode_example04.go has
//to be modified as well with the new ID of chaincode_example02.
//chaincode_example05 show's how chaincode ID can be passed in as a parameter instead of
//hard-coding.

type InitInterface struct {
}

func (init *InitInterface) Init(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 0 {
		logger.Debug(args)
		return nil, fmt.Errorf("Error args lens, expect 0")
	}

	var orgs = []*Org.Org{Org.NewOrg("Friday", "F"), Org.NewOrg("HappyGo", "H")}
	logger.Debug("start to init db")
	// init org and product info
	for orgIndex, org := range orgs {
		logger.Debug("for loop insert org")
		logger.Debug("orgIndex")
		logger.Debug(orgIndex)
		logger.Debug("org")
		logger.Debug(org)

		logger.Debug(org.OrgID)
		org.Insert(stub)

	}
	for _, userID := range config.UserList {
		user := &User.User{"", userID, make(map[string]string), ""}
		user.Insert(stub)
	}

	return nil, nil
}
