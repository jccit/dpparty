package main

type RoomState struct {
	UUID string `json:"uuid"`
	Video string `json:"video"`
	Playing bool `json:"playing"`
	Time float64 `json:"time"`
	Users []User `json:"users"`
}