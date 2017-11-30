package control

//WARNING - this chaincode's ID is hard-coded in chaincode_example04 to illustrate one way of
//calling chaincode from a chaincode. If this example is modified, chaincode_example04.go has
//to be modified as well with the new ID of chaincode_example02.
//chaincode_example05 show's how chaincode ID can be passed in as a parameter instead of
//hard-coding.

import (
	"chaincodes/loyalty/config"
	"chaincodes/loyalty/model/Org"
	"chaincodes/loyalty/model/SettlementReport"
	"chaincodes/loyalty/model/TxHistory"
	"chaincodes/loyalty/model/User"
	"chaincodes/loyalty/utils"
	"encoding/json"
	"fmt"
	"strconv"

	db "chaincodes/chaincode-DbWrap"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type InvokeInterface struct {
}

func (t *InvokeInterface) Invoke_Exchange_Point(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 5 {
		return nil, fmt.Errorf("error args len, expect 5 ")
	}
	exchangeMetaData := &TxHistory.ExchangeMetaData{}
	txDate := args[0]
	userID := args[1]
	sourceOrgID := args[2]
	exchangeMetaData.SourceOrgID = sourceOrgID
	targetOrgID := args[3]
	exchangeMetaData.TargetOrgID = targetOrgID
	pointAmountString := args[4]
	exchangeMetaData.ExChangeAmount = pointAmountString
	user := &User.User{}
	userDb := user.GetDb()
	fmt.Println("Get user db")
	fmt.Println(userDb)
	if sourceOrgID == targetOrgID {
		return nil, fmt.Errorf("can not change at same org")
	}
	queryString := db.FormatQueryString([]string{"UserID", userID})
	userbytes, err := userDb.FindOne(stub, queryString)
	if err != nil {
		return nil, nil
	}
	user.ParseJSON(string(userbytes))

	sourceOrg, err := getOrgByOrgID(stub, sourceOrgID)
	if err != nil {
		return nil, err
	}

	pointAmount, err := strconv.Atoi(pointAmountString)
	if err != nil {
		return nil, err
	}
	if pointAmount < 0 {
		fmt.Println("amount is negtive, change-back")
		if _, ok := user.Points[targetOrgID]; !ok {
			return nil, fmt.Errorf("user did not have such kind of point to exchange")
		}
		userTargetPointString := user.Points[targetOrgID]
		userTargetPoint, err := strconv.Atoi(userTargetPointString)
		if err != nil {
			return nil, err
		}
		finishUserPoint := userTargetPoint + pointAmount
		if finishUserPoint < 0 {
			return nil, fmt.Errorf("User did not have enough point to change-back")
		}
		user.Points[targetOrgID] = strconv.Itoa(finishUserPoint)
		err = user.Update(stub)
		if err != nil {
			return nil, err
		}
		if _, ok := sourceOrg.HoldPoints[targetOrgID]; !ok {
			sourceOrg.HoldPoints[targetOrgID] = "0"
		}
		orgHoldPointString := sourceOrg.HoldPoints[targetOrgID]
		orgHoldPoint, err := strconv.Atoi(orgHoldPointString)
		if err != nil {
			return nil, err
		}
		orgFinishHoldPoint := orgHoldPoint + (-1 * pointAmount)
		sourceOrg.HoldPoints[targetOrgID] = strconv.Itoa(orgFinishHoldPoint)
		exchangeMetaData.TargetPointBalance = sourceOrg.HoldPoints[targetOrgID]

		err = sourceOrg.Update(stub)
		if err != nil {
			return nil, err
		}

	} else {
		fmt.Println("amount is positive, change")
		fmt.Println(user)
		if _, ok := user.Points[targetOrgID]; !ok {
			user.Points[targetOrgID] = "0"
		}
		userTargetPointString := user.Points[targetOrgID]
		userTargetPoint, err := strconv.Atoi(userTargetPointString)
		if err != nil {
			return nil, err
		}
		finishUserPoint := userTargetPoint + pointAmount
		user.Points[targetOrgID] = strconv.Itoa(finishUserPoint)
		exchangeMetaData.TargetPointBalance = user.Points[targetOrgID]

		err = user.Update(stub)
		if err != nil {
			return nil, err
		}
		targetOrg, err := getOrgByOrgID(stub, targetOrgID)
		if err != nil {
			return nil, err
		}
		if _, ok := targetOrg.HoldPoints[sourceOrgID]; !ok {
			targetOrg.HoldPoints[sourceOrgID] = "0"
		}
		targetHoldPointString := targetOrg.HoldPoints[sourceOrgID]
		targetHoldPoint, err := strconv.Atoi(targetHoldPointString)
		if err != nil {
			return nil, err
		}
		targetFinishPoint := targetHoldPoint + pointAmount
		exchangeMetaJSONbytes, err := json.Marshal(exchangeMetaData)
		if err != nil {
			return nil, err
		}
		err = createTxHistory(stub, txDate, userID, "EXCHANGE", string(exchangeMetaJSONbytes))
		if err != nil {
			return nil, err
		}
		targetOrg.HoldPoints[sourceOrgID] = strconv.Itoa(targetFinishPoint)
		targetOrg.Update(stub)

	}
	eventType := "User_Exchange"
	err = setEvent(stub, eventType, []string{sourceOrgID, userID, targetOrgID, pointAmountString})
	if err != nil {
		return nil, err
	}

	if err != nil {
		return nil, err
	}

	return []byte(fmt.Sprintf("User %s exchange %s success", user.UserID, pointAmountString)), nil
}
func (t *InvokeInterface) Invoke_Redeem_Point(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 5 {
		return nil, fmt.Errorf("error args len, expect 5 ")
	}
	txDate := args[0]
	userID := args[1]
	targetOrgID := args[2]
	pointAmountString := args[3]
	redeemMetaData := args[4]
	user := &User.User{}
	userDb := user.GetDb()
	queryString := db.FormatQueryString([]string{"UserID", userID})
	userfindBytes, err := userDb.Find(stub, queryString)
	if len(userfindBytes) == 0 {
		return nil, fmt.Errorf("User did not exist")
	}
	userfinds := db.ParseFindResults(userfindBytes)
	user.ParseJSON(userfinds[0])

	if _, ok := user.Points[targetOrgID]; !ok {
		return nil, fmt.Errorf("User %s did not have %s royalty point", user.UserID, targetOrgID)
	}
	point, _ := strconv.Atoi(pointAmountString)
	userPointString := user.Points[targetOrgID]
	userPoint, _ := strconv.Atoi(userPointString)
	if userPoint < point {
		return nil, fmt.Errorf("User %s did not have enough point to redeem ", user.UserID)
	}
	finishPoint := userPoint - point
	finishPointString := strconv.Itoa(finishPoint)
	user.Points[targetOrgID] = finishPointString
	err = user.Update(stub)
	if err != nil {
		return nil, err
	}
	err = createTxHistory(stub, txDate, userID, "REDEEM_POINT", redeemMetaData)
	if err != nil {
		return nil, err
	}
	userJSON, err := user.ToJSON()
	if err != nil {
		return nil, err
	}
	eventType := "Redeem_Point"

	err = setEvent(stub, eventType, []string{targetOrgID, userID, pointAmountString})
	if err != nil {
		return nil, err
	}
	return []byte(userJSON), nil

}
func (t *InvokeInterface) Invoke_Generate_Settlement_Report(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 1 {
		return nil, fmt.Errorf("error args len, expect 0 ")
	}

	phaseNumberBytes, err := stub.GetState(config.PhaseNumberKeyName)
	if err != nil {
		return nil, err
	}
	if phaseNumberBytes == nil {
		phaseNumberBytes = []byte("1")
	}
	phaseNumberString := string(phaseNumberBytes)
	phaseNumber, err := strconv.Atoi(phaseNumberString)
	if err != nil {
		return nil, err
	}
	orgIDList := config.GetOrgIDList()
	for index, orgID1 := range orgIDList {
		for i := index + 1; i < len(orgIDList); i++ {
			orgID2 := orgIDList[i]
			org1, err := getOrgByOrgID(stub, orgID1)
			if err != nil {
				return nil, err
			}
			org2, err := getOrgByOrgID(stub, orgID2)
			if err != nil {
				return nil, nil
			}
			settlementReport := &SettlementReport.SettlementReport{}
			settlementReport.SettlementReports = make(map[string]SettlementReport.PointAndMoney)
			settlementReport.Phase = strconv.Itoa(phaseNumber)
			settlementReport.HaveSettle = "false"
			parties := []string{}
			parties = append(parties, orgID1)
			parties = append(parties, orgID2)
			settlementReport.Parties = parties
			org1PointAndMoney := SettlementReport.PointAndMoney{}
			org2PointAndMoney := SettlementReport.PointAndMoney{}
			var org1Point, org2Point int
			if org1HoldPointString, ok := org1.HoldPoints[orgID2]; ok {
				org1.HoldPoints[orgID2] = "0"
				org1.Update(stub)
				org1PointAndMoney.Point = org1HoldPointString
				org1Point, err = strconv.Atoi(org1HoldPointString)
				if err != nil {
					return nil, err
				}
			} else {
				org1Point = 0
				org1PointAndMoney.Point = "0"
			}
			if org2HoldPointString, ok := org2.HoldPoints[orgID1]; ok {
				org2.HoldPoints[orgID1] = "0"
				org2.Update(stub)
				org2PointAndMoney.Point = org2HoldPointString
				org2Point, err = strconv.Atoi(org2HoldPointString)
				if err != nil {
					return nil, err
				}
			} else {
				org2Point = 0
				org2PointAndMoney.Point = "0"
			}
			deductMoney := org1Point - org2Point
			org1PointAndMoney.Money = strconv.Itoa(-1 * deductMoney)
			org2PointAndMoney.Money = strconv.Itoa(deductMoney)
			/*
				PointAndMoney Struct
				------------------------
				| point:10 | money:400 |
				------------------------
				means that:
				you have 10 point of the other org,
				you need to pay 400 to the other org in this settlement.
				If the money is negtive, it means you should recevie money from others
			**/
			settlementReport.SettlementReports[orgID1] = org1PointAndMoney
			settlementReport.SettlementReports[orgID2] = org2PointAndMoney
			settlementReport.Insert(stub)
		}
	}
	phaseNumber++
	stub.PutState(config.PhaseNumberKeyName, []byte(strconv.Itoa(phaseNumber)))
	eventType := "Settlement_Report_Finish"
	setEvent(stub, eventType, []string{phaseNumberString})
	return []byte(fmt.Sprintf("Generate settlement report for phase: %s success", phaseNumberString)), nil
}
func (t *InvokeInterface) Invoke_Settlement(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 2 {
		return nil, fmt.Errorf("error args len, expect 1 ")

	}
	settlementSeqNum := args[1]
	settlementReport := &SettlementReport.SettlementReport{}
	settlementReportDb := settlementReport.GetDb()
	settlementReportBytes, err := settlementReportDb.Get(stub, settlementSeqNum)
	if err != nil {
		return nil, err
	}
	if len(settlementReportBytes) == 0 {
		return nil, fmt.Errorf("can not settle none-existed settlement report")
	}
	err = settlementReport.ParseJSON(string(settlementReportBytes))
	if err != nil {
		return nil, nil
	}
	settlementReport.HaveSettle = "true"
	settlementReport.Update(stub)
	eventArgs := []string{}
	for orgID, pointAndMoney := range settlementReport.SettlementReports {
		eventArgs = append(eventArgs, orgID, pointAndMoney.Point)
	}
	setEvent(stub, "Settle_Finish", eventArgs)
	return []byte(fmt.Sprintf("Settle for settlement report seq : %s success", settlementSeqNum)), nil
}
func (t *InvokeInterface) Query_Settlement_Report(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 1 {
		return nil, fmt.Errorf("error args len, expect 1 ")
	}
	settlementPhase := args[0]
	orgID, err := getSelfOrgID(stub)
	org, err := getOrgByOrgID(stub, orgID)
	if err != nil {
		return nil, err
	}

	settlementReport := &SettlementReport.SettlementReport{}
	settlementReportDb := settlementReport.GetDb()
	finalResult := "["
	queryString := db.FormatQueryString([]string{"Phase", settlementPhase})
	phaseAllReportsBytes, err := settlementReportDb.Find(stub, queryString)
	if err != nil {
		return nil, err
	}
	phaseAllReportsJSONStrings := db.ParseFindResults(phaseAllReportsBytes)
	for _, reportJSONstring := range phaseAllReportsJSONStrings {
		nSettlementReport := &SettlementReport.SettlementReport{}
		err := nSettlementReport.ParseJSON(reportJSONstring)
		if err != nil {
			return nil, err
		}
		involved := false
		for _, partyID := range nSettlementReport.Parties {
			if partyID == org.OrgID {
				involved = true
			}
		}
		if involved {
			nSettlementReportJSONString, err := nSettlementReport.ToJSON()
			if err != nil {
				return nil, err
			}
			finalResult += nSettlementReportJSONString

		}

	}
	finalResult += "]"
	return []byte(finalResult), nil

}
func (t *InvokeInterface) Query_List_Tx_History_By_User(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 1 {
		return nil, fmt.Errorf("error args len, expect 1 ")
	}
	txDb := TxHistory.Db
	queryString := db.FormatQueryString([]string{"UserID", args[0]})
	return txDb.Find(stub, queryString)

}
func (t *InvokeInterface) Query_List_All_Tx_History(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 0 {
		return nil, fmt.Errorf("error args len, expect 0 ")
	}
	txDb := TxHistory.Db
	return txDb.ListAll(stub)

}
func (t *InvokeInterface) Query_List_All_User(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	userDb := User.Db
	return userDb.ListAll(stub)
}
func (t *InvokeInterface) Query_Get_User_By_UserID(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if length := len(args); length != 1 {
		return nil, fmt.Errorf("error args len, expect 1 ")
	}
	userID := args[0]
	userDb := User.Db
	queryString := db.FormatQueryString([]string{"UserID", userID})

	return userDb.FindOne(stub, queryString)
}
func (t *InvokeInterface) Query_List_All_Org(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	orgDb := Org.Db
	return orgDb.ListAll(stub)
}

func getSelfOrgID(stub shim.ChaincodeStubInterface) (string, error) {
	identityArr, err := utils.GetMSPIDAndEnrollID(stub)
	if err != nil {
		return "", err
	}
	MSPID := identityArr[0]
	MSPMap := config.GetMSPMap()
	if orgID, ok := MSPMap[MSPID]; ok {
		return orgID, nil
	} else {
		return "", fmt.Errorf("MSP ID did not exist in the config file")
	}

}
func createTxHistory(stub shim.ChaincodeStubInterface, txDate string, userID string, txType string, metaData string) error {
	txHistory := &TxHistory.TxHistory{"", txDate, userID, txType, metaData, ""}
	_, err := txHistory.Insert(stub)
	return err
}
func getOrgByOrgID(stub shim.ChaincodeStubInterface, orgID string) (*Org.Org, error) {
	org := &Org.Org{}
	orgDb := org.GetDb()
	queryString := db.FormatQueryString([]string{"OrgID", orgID})
	orgbytes, err := orgDb.FindOne(stub, queryString)
	if err != nil {
		return nil, err
	}
	err = org.ParseJSON(string(orgbytes))
	if err != nil {
		return nil, err
	}
	return org, nil
}

func setEvent(stub shim.ChaincodeStubInterface, eventType string, args []string) error {
	switch eventType {
	case "User_Exchange":
		{
			msgBytes, err := makeEventJSON(eventType, args)
			err = stub.SetEvent(eventType, []byte(msgBytes))
			if err != nil {
				return err
			}
			return nil
		}
	case "Settlement_Report_Finish":
		{
			msgBytes, err := makeEventJSON(eventType, args)
			err = stub.SetEvent(eventType, []byte(msgBytes))
			if err != nil {
				return err
			}
			return nil
		}
	case "Redeem_Point":
		{
			redeemMsgBytes, err := makeEventJSON(eventType, args)
			err = stub.SetEvent(eventType, []byte(redeemMsgBytes))
			if err != nil {
				return err
			}
			return nil
		}
	case "Settle_Finish":
		{
			// note : cause point field of point and money struct records you hold other's point
			// so when you need to settle the report, you should reveice the point record in oppsite
			// org's report's point field.
			fmt.Println("set Settle_Finish event")

			msgBytes, err := makeEventJSON(eventType, args)
			err = stub.SetEvent(eventType, []byte(msgBytes))
			if err != nil {
				return err
			}
			return nil
		}
	}
	return nil
}
func makeEventJSON(eventType string, args []string) ([]byte, error) {

	switch eventType {
	case "User_Exchange":
		{
			orgName := args[0]
			userID := args[1]
			targetOrgID := args[2]
			deductAmount := args[3]
			jsonMap := map[string]string{
				"orgName":      orgName,
				"userID":       userID,
				"targetOrgID":  targetOrgID,
				"deductAmount": deductAmount,
			}
			return json.Marshal(jsonMap)
		}
	case "Settlement_Report_Finish":
		{
			phase := args[0]
			jsonMap := map[string]string{
				"phase": phase,
			}
			return json.Marshal(jsonMap)
		}
	case "Add_Issue_Point":
		{
			pointAmount := args[0]
			jsonMap := map[string]string{
				"pointAmount": pointAmount,
			}
			return json.Marshal(jsonMap)
		}
	case "Redeem_Point":
		{
			orgName := args[0]
			userID := args[1]
			redeemAmount := args[2]
			jsonMap := map[string]string{
				"orgName":      orgName,
				"userID":       userID,
				"redeemAmount": redeemAmount,
			}
			return json.Marshal(jsonMap)

		}
	case "Settle_Finish":
		{
			org1ID := args[0]
			org1ReturnPoint := args[3]
			org2ID := args[2]
			org2ReturnPoint := args[1]
			jsonMap := map[string]string{
				org1ID: org1ReturnPoint,
				org2ID: org2ReturnPoint,
			}
			return json.Marshal(jsonMap)

		}
	}
	return nil, nil
}
