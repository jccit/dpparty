package main

import (
	"log"
	"time"

	"github.com/gbrlsnchs/jwt/v3"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var hs = jwt.NewHS256([]byte("secret"))

type UserPayload struct {
	jwt.Payload
	Name string `json:"name,omitempty"`
}

type User struct {
	Name        string          `json:"name,omitempty"`
	UUID        string          `json:"uuid,omitempty"`
	CurrentRoom string          `json:"-"`
	Conn        *websocket.Conn `json:"-"`

	send    chan Message
	closing bool
}

const (
	pongWait   = 30 * time.Second
	pingPeriod = (pongWait * 9) / 10
	writeWait  = 10 * time.Second
)

func NewUUID() string {
	uid, err := uuid.NewRandom()
	if err != nil {
		return ""
	}

	return uid.String()
}

func NewUser(name string, conn *websocket.Conn) User {
	return User{
		UUID:    NewUUID(),
		Name:    name,
		Conn:    conn,
		send:    make(chan Message),
		closing: false,
	}
}

func GetUserJWT(user User) string {
	now := time.Now()
	payload := UserPayload{
		Payload: jwt.Payload{
			IssuedAt:       jwt.NumericDate(now),
			ExpirationTime: jwt.NumericDate(now.Add(24 * time.Hour)),
			Subject:        user.UUID,
		},
		Name: user.Name,
	}

	token, err := jwt.Sign(payload, hs)
	if err != nil {
		log.Println(err)
	}

	return string(token)
}

func GetUID(tokenString string) string {
	var payload UserPayload
	_, err := jwt.Verify([]byte(tokenString), hs, &payload)

	if err != nil {
		log.Println(err)
		return ""
	}

	return payload.Subject
}

func UserLeft(roomUUID string, userUUID string) {
	room := rooms[roomUUID]
	users := room.Users

	if user, ok := users[userUUID]; ok && user.closing == false {
		user.closing = true

		delete(users, userUUID)
		room.Users = users

		log.Println("User left: ", userUUID)

		// Check if room is empty, if not send update message

		if len(users) == 0 {
			// Close room
			room.close <- true

		} else {
			room.broadcast <- MessagePacket{
				Message: Message{
					Type:  "userLeft",
					State: room,
				},
				Sender: userUUID,
			}

			rooms[roomUUID] = room
		}
	}
}

func (u *User) handleDisconnect() {
	u.Conn.Close()
	UserLeft(u.CurrentRoom, u.UUID)
}

func (u *User) handleRead() {
	defer func() {
		u.handleDisconnect()
	}()

	u.Conn.SetReadDeadline(time.Now().Add(pongWait))
	u.Conn.SetPongHandler(func(string) error {
		u.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := u.Conn.ReadMessage()

		if err != nil {
			log.Println("read:", err)
			break
		}
		//log.Printf("recv: %s", )
		msg := ParseMessage(string(message))

		switch msg.Type {
		case "newRoom":
			users := make(map[string]*User)
			users[u.UUID] = u
			room := RoomState{
				UUID:       NewUUID(),
				Users:      users,
				Video:      msg.State.Video,
				Playing:    msg.State.Playing,
				Time:       msg.State.Time,
				LastUpdate: time.Now().Unix(),

				broadcast:  make(chan MessagePacket),
				newUser:    make(chan *User),
				deleteUser: make(chan *User),
				close:      make(chan bool),
			}

			go room.run()

			u.CurrentRoom = room.UUID
			rooms[room.UUID] = room

			u.send <- Message{
				Type: "jwt",
				JWT:  GetUserJWT(*u),
			}

			u.send <- Message{
				Type:  "joinRoom",
				State: room,
			}
		case "joinRoom":
			room := rooms[msg.ID]
			users := room.Users

			room.broadcast <- MessagePacket{
				Message: Message{
					Type: "userJoined",
					ID:   u.UUID,
				},
				Sender: u.UUID,
			}

			u.CurrentRoom = room.UUID

			users[u.UUID] = u
			room.Users = users
			CalculateNewPlayTime(&room)
			AfterUpdate(&room)
			rooms[msg.ID] = room

			u.send <- Message{
				Type: "jwt",
				JWT:  GetUserJWT(*u),
			}

			u.send <- Message{
				Type:  "joinRoom",
				State: room,
			}
		case "update":
			room := rooms[msg.ID]
			room.Playing = msg.State.Playing
			room.Time = msg.State.Time
			room.Video = msg.State.Video

			AfterUpdate(&room)

			rooms[msg.ID] = room

			room.broadcast <- MessagePacket{
				Message: Message{
					Type:  "update",
					State: room,
				},
				Sender: u.UUID,
			}
		}
	}
}

func (u *User) sender() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		u.handleDisconnect()
	}()

	for {
		select {
		case message, ok := <-u.send:
			u.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				u.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			u.Conn.WriteJSON(message)

		case <-ticker.C:
			u.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := u.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
