// ----------------------------------------------------------------
// ESP32 IoT Device Code
// This code runs on the ESP32 microcontroller. It reads data from a DHT11 sensor and an ultrasonic distance sensor, then sends this data to a server via Wi-Fi. It also listens for commands from the server to control a buzzer.
// Make sure to update the Wi-Fi credentials and server URL before uploading to your ESP32.
// ----------------------------------------------------------------


#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <ArduinoJson.h> 

// ----------------------------------------------------------------
// 1. NETWORK & SECURITY SETTINGS (Update these!)
// ----------------------------------------------------------------
const char* ssid = "Nighthawk-7";
const char* password = "82148214";

// Replace YOUR_COMPUTER_IP with your actual local IP (e.g., 192.168.1.50)
const char* serverUrl = "http://10.55.201.220:3000/api/iot/log"; 
const char* apiKey = "alpha47_iot_api_key"; 

// ----------------------------------------------------------------
// 2. HARDWARE PINS
// ----------------------------------------------------------------
#define DHTPIN 4
#define DHTTYPE DHT11 

#define TRIG_PIN 5
#define ECHO_PIN 18

#define GREEN_LED 19
#define RED_LED 21
#define BUZZER_PIN 22

#define ONBOARD_LED 2 

String deviceID = "ESP32_MAIN_01"; 
const int DOOR_THRESHOLD_CM = 5; 

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT); 
  pinMode(ONBOARD_LED, OUTPUT); 
  
  dht.begin();

  // Connect to Wi-Fi
  Serial.print("\nConnecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(ONBOARD_LED, !digitalRead(ONBOARD_LED)); 
  }
  
  digitalWrite(ONBOARD_LED, HIGH);
  
  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    digitalWrite(ONBOARD_LED, HIGH);

    // 1. Read Sensors (WITH FAULT TOLERANCE)
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    
    // If the sensor is broken/unplugged, default to 0 instead of crashing
    if (isnan(h) || isnan(t)) {
      Serial.println("⚠️ DHT Sensor missing/broken. Defaulting to 0.");
      h = 0.0;
      t = 0.0;
    }

    // 2. Read Distance
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    long duration = pulseIn(ECHO_PIN, HIGH);
    int distance_cm = duration * 0.034 / 2;

    // 3. Determine Door Status & Control LEDs locally
    String doorStatus;
    if (distance_cm > DOOR_THRESHOLD_CM) {
      doorStatus = "OPEN";
      digitalWrite(RED_LED, HIGH);
      digitalWrite(GREEN_LED, LOW);
    } else {
      doorStatus = "CLOSED";
      digitalWrite(RED_LED, LOW);
      digitalWrite(GREEN_LED, HIGH);
    }

    // 4. Build JSON Payload
    String jsonPayload = "{";
    jsonPayload += "\"device_id\":\"" + deviceID + "\",";
    jsonPayload += "\"temperature\":" + String(t) + ",";
    jsonPayload += "\"humidity\":" + String(h) + ",";
    jsonPayload += "\"door_status\":\"" + doorStatus + "\"";
    jsonPayload += "}";

    // 5. Send POST Request to the Laptop
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    Serial.println("\n📡 Sending Data | Door: " + doorStatus + " | Dist: " + String(distance_cm) + "cm");

    int httpResponseCode = http.POST(jsonPayload);

    // 6. Handle Command & Control (Buzzer ONLY)
    if (httpResponseCode > 0) {
      String response = http.getString();
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, response);

      if (!error) {
        bool soundAlarm = doc["command"]["sound_alarm"];
        
        if (soundAlarm) {
          Serial.println("   🚨 SERVER COMMAND: ALARM TRIGGERED!");
          digitalWrite(BUZZER_PIN, HIGH); // 🔥 SOUND THE SIREN!
        } else {
          Serial.println("   ✅ SERVER COMMAND: Area Secure.");
          digitalWrite(BUZZER_PIN, LOW);  // 🔇 SILENCE THE SIREN!
        }
      }
    } else {
      Serial.print("❌ Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
    
    // Wait 5 seconds before next reading
    delay(5000); 

  } else {
    // IF THE HOTSPOT DROPS:
    Serial.println("\n⚠️ Wi-Fi Disconnected. Attempting to reconnect...");
    
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, LOW); 
    digitalWrite(BUZZER_PIN, LOW); 

    WiFi.disconnect();
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
      delay(250);
      Serial.print(".");
      digitalWrite(ONBOARD_LED, !digitalRead(ONBOARD_LED)); 
    }
    
    Serial.println("\n✅ Wi-Fi Reconnected!");
    digitalWrite(ONBOARD_LED, HIGH); 
  }
}