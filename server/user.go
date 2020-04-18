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
	Name string `json:"name,omitempty"`
	UUID string `json:"uuid,omitempty"`
	Conn *websocket.Conn `json:"-"`
}

func NewUUID() string {
	uid, err := uuid.NewRandom()
	if err != nil {
		return ""
	}

	return uid.String()
}

func NewUser(name string, conn *websocket.Conn) User {
	return User{
		UUID: NewUUID(),
		Name: name,
		Conn: conn,
	}
}

func GetUserJWT(user User) string {
	now := time.Now()
	payload := UserPayload{
		Payload: jwt.Payload{
			IssuedAt: jwt.NumericDate(now),
			ExpirationTime: jwt.NumericDate(now.Add(24 * time.Hour)),
			Subject: user.UUID,
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