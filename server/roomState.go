package main

import "time"

type RoomState struct {
	UUID       string           `json:"uuid"`
	Video      string           `json:"video"`
	Playing    bool             `json:"playing"`
	Time       float64          `json:"time"`
	Users      map[string]*User `json:"users"`
	LastUpdate int64            `json:"lastUpdate"`

	broadcast  chan MessagePacket
	newUser    chan *User
	deleteUser chan *User
	close      chan bool
}

func AfterUpdate(state *RoomState) {
	state.LastUpdate = time.Now().Unix()
}

func CalculateNewPlayTime(state *RoomState) {
	lastUpdate := time.Unix(state.LastUpdate, 0)
	diff := time.Since(lastUpdate)

	state.Time += diff.Seconds()
}

func (r *RoomState) run() {
	defer func() {
		delete(rooms, r.UUID)
	}()

	for {
		select {
		case user := <-r.newUser:
			r.Users[user.UUID] = user
		case user := <-r.deleteUser:
			delete(r.Users, user.UUID)
		case message := <-r.broadcast:
			for uid, user := range r.Users {
				if uid != message.Sender {
					select {
					case user.send <- message.Message:
					}
				}
			}
		case <-r.close:
			return
		}
	}
}
