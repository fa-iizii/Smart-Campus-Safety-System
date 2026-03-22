#include "DHT.h"

// --- PIN DEFINITIONS ---
#define DHTPIN 4
#define DHTTYPE DHT11
#define TRIG_PIN 5
#define ECHO_PIN 18 

// Matrix Pins (Row 7 is GPIO 13/D13)
uint8_t rowPins[8] = {22, 23, 19, 21, 15, 2, 13, 16};
uint8_t colPins[8] = {17, 32, 33, 25, 26, 27, 14, 12};

DHT dht(DHTPIN, DHTTYPE);

// Test Patterns
byte all_on[8]   = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
byte x_mark[8]   = {0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x81}; 
byte tick_mark[8] = {0x01, 0x02, 0x04, 0x08, 0x90, 0x60, 0x00, 0x00}; 

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Initialize Matrix Pins
  for (int i = 0; i < 8; i++) {
    pinMode(rowPins[i], OUTPUT);
    pinMode(colPins[i], OUTPUT);
    digitalWrite(rowPins[i], LOW);
    digitalWrite(colPins[i], HIGH); // Columns HIGH = Off
  }

  Serial.println("--- OFFLINE HARDWARE TEST START ---");
  
  // TEST 1: LIGHT UP EVERYTHING (3 Seconds)
  Serial.println("Testing Matrix: All LEDs should be ON...");
  unsigned long start = millis();
  while(millis() - start < 3000) {
    refreshMatrix(all_on);
  }

  // TEST 2: SHOW SYMBOLS
  Serial.println("Testing Symbols: Showing X then Tick...");
  start = millis();
  while(millis() - start < 2000) refreshMatrix(x_mark);
  start = millis();
  while(millis() - start < 2000) refreshMatrix(tick_mark);

  Serial.println("--- SENSOR LIVE MONITOR START ---");
}

// Multiplexing logic to drive the 16-pin matrix
void refreshMatrix(byte image[8]) {
  for (int r = 0; r < 8; r++) {
    digitalWrite(rowPins[r], HIGH); // Row ON
    for (int c = 0; c < 8; c++) {
      // Extract the bit for the column
      bool pixel = (image[r] >> (7 - c)) & 0x01;
      digitalWrite(colPins[c], pixel ? LOW : HIGH); // LOW = On for common cathode
    }
    delay(2); 
    digitalWrite(rowPins[r], LOW); // Row OFF
  }
}

void loop() {
  // 1. Read DHT11
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // 2. Read Ultrasonic
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  int distance = duration * 0.034 / 2;

  // 3. Print Results to Serial Monitor
  Serial.print("Temp: "); Serial.print(t);
  Serial.print("C | Humidity: "); Serial.print(h);
  Serial.print("% | Distance: "); Serial.print(distance);
  Serial.println("cm");

  // 4. Update Matrix based on Distance
  unsigned long refreshStart = millis();
  while(millis() - refreshStart < 1000) { // Refresh display for 1 second
    refreshMatrix(distance > 5 ? tick_mark : x_mark);
  }
}