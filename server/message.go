package main

import (
	"encoding/json"
	"log"
	"strings"
)

type Message struct {
	Type  string    `json:"type,omitempty"`
	JWT   string    `json:"jwt,omitempty"`
	ID    string    `json:"id,omitempty"`
	State RoomState `json:"state,omitempty"`
}

type MessagePacket struct {
	Message Message
	Sender  string
}

func ParseMessage(message string) Message {
	var m Message

	decoder := json.NewDecoder(strings.NewReader(message))
	err := decoder.Decode(&m)
	if err != nil {
		log.Println(err)
	}

	return m
}
