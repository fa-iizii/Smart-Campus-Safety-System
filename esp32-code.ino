// ESP32 IoT Sensor Code
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// ----------------------------------------------------------------
// 1. NETWORK SETTINGS (Fill these in!)
// ----------------------------------------------------------------
const char* ssid = "YOUR_WIFI_NETWORK_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your computer's local IP address
// On Windows, you can find this by running `ipconfig` in Command Prompt and looking for the IPv4 address under your active network adapter.
const char* serverUrl = "http://YOUR_COMPUTER_IP:3000/api/iot/log"; 
const char* apiKey = "MySecureESP32Key2026"; 

// ----------------------------------------------------------------
// 2. HARDWARE PINS
// ----------------------------------------------------------------
// DHT Sensor Settings
#define DHTPIN 4          // DHT11 data pin connected to GPIO 4
#define DHTTYPE DHT11     // Change to DHT22 if using the white sensor

// HC-SR04 Ultrasonic Sensor Pins
#define TRIG_PIN 5        // Trigger pin connected to GPIO 5
#define ECHO_PIN 18       // Echo pin connected to GPIO 18

DHT dht(DHTPIN, DHTTYPE);

// Distance threshold for the fire exit
const int DOOR_THRESHOLD_CM = 5; 

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize Sensors
  dht.begin();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Connect to Wi-Fi
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    // 1. Read Temperature & Humidity
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    
    if (isnan(h) || isnan(t)) {
      Serial.println("⚠️ Failed to read from DHT sensor!");
      delay(2000);
      return;
    }

    // 2. Read Distance Sensor (HC-SR04)
    // Clear the trigPin by setting it LOW
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    
    // Trigger the sensor by setting the trigPin HIGH for 10 microseconds
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    // Read the echoPin, returns the sound wave travel time in microseconds
    long duration = pulseIn(ECHO_PIN, HIGH);
    
    // Calculate the distance
    int distance_cm = duration * 0.034 / 2;

    // 3. Determine Door Status
    // If distance is greater than 5cm, the door is OPEN
    String doorStatus = (distance_cm > DOOR_THRESHOLD_CM) ? "OPEN" : "CLOSED";

    // Build the JSON Payload
    String jsonPayload = "{";
    jsonPayload += "\"temperature\":" + String(t) + ",";
    jsonPayload += "\"humidity\":" + String(h) + ",";
    jsonPayload += "\"door_status\":\"" + doorStatus + "\"";
    jsonPayload += "}";

    // 4. Send the POST Request
    HTTPClient http;
    http.begin(serverUrl);
    
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    Serial.println("\n📡 Sending Data to Node.js...");
    Serial.print("Distance: "); Serial.print(distance_cm); Serial.println(" cm");
    Serial.println("Payload: " + jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("✅ Server Response Code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("❌ Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("⚠️ Wi-Fi Disconnected. Reconnecting...");
    WiFi.reconnect();
  }

  // Wait 5 seconds before sending the next reading
  delay(5000); 
}