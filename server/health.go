package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
)

type HealthStats struct {
	Rooms int `json:"rooms"`
	Users int `json:"users"`
}

type HealthResponse struct {
	Status string `json:"status"`
	Stats HealthStats `json:"stats"`
}

func getHealthStats() HealthStats {
	roomCount, userCount := 0, 0

	for _, room := range rooms {
		roomCount++
		userCount += len(room.Users)
	}

	return HealthStats{
		Rooms: roomCount,
		Users: userCount,
	}
}

func getHealthResponse() HealthResponse {
	stats := getHealthStats()

	return HealthResponse{
		Status: "up",
		Stats: stats,
	}
}

func handleHealthRequest(w http.ResponseWriter, r *http.Request) {
	health := getHealthResponse()
	healthJSON, err := json.Marshal(health)

	if err != nil {
		log.Println("Error getting health data")
	}

	httpJSONResponse(w, healthJSON)
}

func healthClient(port int) {
	response, err := http.Get("http://localhost:" + strconv.Itoa(port))
	if err != nil || response.StatusCode != 200 {
		os.Exit(1)
	}

	responseBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		os.Exit(1)
	}

	var parsedHealth HealthResponse
	err = json.Unmarshal(responseBody, &parsedHealth)
	if err != nil || parsedHealth.Status != "up" {
		os.Exit(1)
	}

	os.Exit(0)
}