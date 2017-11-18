package config

// db type, accept "COUCH", "LEVEL"
const DB_TYEP = "COUCH"
const VenderCount = 2
const ProductCount = 2
const PhaseNumberKeyName = "PHASE_COUNT"

func GetMSPMap() map[string]string {
	mspMap := map[string]string{
		"Org1MSP": "F",
		"Org2MSP": "H",
	}
	return mspMap
}
func GetOrgIDList() []string {
	mspMap := GetMSPMap()
	orgIDList := []string{}
	for _, orgID := range mspMap {
		orgIDList = append(orgIDList, orgID)
	}
	return orgIDList
}

var UserList = []string{"A", "B", "C", "D"}
