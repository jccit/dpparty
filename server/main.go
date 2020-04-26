package main

import (
	"flag"
	"log"
	"net/http"
	"strconv"
	"sync"

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

func httpJSONResponse(w http.ResponseWriter, data []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Length", strconv.Itoa(len(data)))
	w.WriteHeader(200)
	w.Write(data)
}

func main() {
	healthFlag := flag.Bool("health", false, "Docker healthcheck client")
	healthPort := flag.Int("healthPort", 8888, "Port to run health server on")
	socketPort := flag.Int("p", 8080, "Port to run websocket server on")

	flag.Parse()

	if *healthFlag {
		// Run health check client
		healthClient(*healthPort)
		return
	}

	rooms = make(map[string]RoomState)

	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	httpWait := new(sync.WaitGroup)
	httpWait.Add(2)

	// Health check server
	go func() {
		healthHandler := http.NewServeMux()
		healthHandler.HandleFunc("/", handleHealthRequest)

		healthSrv := http.Server {
			Addr: ":" + strconv.Itoa(*healthPort),
			Handler: healthHandler,
		}

		log.Printf("Running health server on: %d\n", *healthPort)
		log.Fatal(healthSrv.ListenAndServe())
		httpWait.Done()
	}()

	// Websocket server
	go func() {
		wsHandler := http.NewServeMux()
		wsHandler.HandleFunc("/", handleWsConnection)

		wsSrv := http.Server {
			Addr: ":" + strconv.Itoa(*socketPort),
			Handler: wsHandler,
		}

		log.Printf("Running socket server on: %d\n", *socketPort)
		log.Fatal(wsSrv.ListenAndServe())
		httpWait.Done()
	}()

	httpWait.Wait()
}
