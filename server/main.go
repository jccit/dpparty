package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var rooms map[string]RoomState

var upgrader = websocket.Upgrader{}

func handleWsConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	user := NewUser("User", conn)

	go user.handleRead()
	go user.sender()
}

func main() {
	rooms = make(map[string]RoomState)

	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	http.HandleFunc("/", handleWsConnection)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
