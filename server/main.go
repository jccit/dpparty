package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var rooms map[string]RoomState

var upgrader = websocket.Upgrader{}

func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		//log.Print("upgrade:", err)
		return
	}

	defer c.Close()

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		//log.Printf("recv: %s", )
		msg := ParseMessage(string(message))

		switch msg.Type {
			case "newRoom":
				user := NewUser("Joe", c)
				users := []User{user}
				room := RoomState{
					UUID: NewUUID(),
					Users: users,
					Video: msg.State.Video,
					Playing: msg.State.Playing,
					Time: msg.State.Time,
				}

				rooms[room.UUID] = room

				c.WriteJSON(Message{
					Type: "jwt",
					JWT: GetUserJWT(user),
				})

				c.WriteJSON(Message{
					Type: "joinRoom",
					State: room,
				})
			case "joinRoom":
				user := NewUser("Not joe", c)
				room := rooms[msg.ID]
				users := room.Users

				for i := 0; i < len(users); i++ {
					users[i].Conn.WriteJSON(Message{
						Type: "userJoined",
						ID: user.UUID,
					})
				}

				users = append(users, user)
				room.Users = users
				rooms[msg.ID] = room

				c.WriteJSON(Message{
					Type: "jwt",
					JWT: GetUserJWT(user),
				})

				c.WriteJSON(Message{
					Type: "joinRoom",
					State: room,
				})
			case "update":
				room := rooms[msg.ID]
				users := room.Users
				room.Playing = msg.State.Playing
				room.Time = msg.State.Time
				room.Video = msg.State.Video

				rooms[msg.ID] = room

				senderUID := GetUID(msg.JWT)

				for i := 0; i < len(users); i++ {
					user := users[i]

					if user.UUID != senderUID {
						user.Conn.WriteJSON(Message{
							Type: "update",
							State: room,
						})
					}
				}
		}
	}
}

func main() {
	rooms = make(map[string]RoomState)

	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	http.HandleFunc("/", echo)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
