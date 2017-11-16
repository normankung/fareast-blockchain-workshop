package utils

import (
	"encoding/binary"
	"strconv"
)

func BoolToInt64(b bool) int64 {
	if b {
		return 1
	}
	return 0
}

func Int64ToBool(i int64) bool {
	if i == 0 {
		return false
	}
	return true
}

func StringToBool(i string) bool {
	if i == "0" {
		return false
	}
	return true
}

func Int64ToString(i int64) string {
	return strconv.FormatInt(i, 10)
}

func Int64ToBytes(i int64) []byte {
	var buf = make([]byte, 8)
	binary.BigEndian.PutUint64(buf, uint64(i))
	return buf
}

func BytesToInt64(buf []byte) int64 {
	return int64(binary.BigEndian.Uint64(buf))
}

func StringToInt64(str string) int64 {
	intVal, err := strconv.ParseInt(str, 10, 64)
	if err != nil {
		return 0
	}

	return intVal
}

func BytesToBool(buf []byte) bool {
	return Int64ToBool(BytesToInt64(buf))
}

func BoolToBytes(b bool) []byte {
	return Int64ToBytes(BoolToInt64(b))
}
