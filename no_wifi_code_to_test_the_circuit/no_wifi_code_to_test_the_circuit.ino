#include "DHT.h"

// --- PIN ASSIGNMENTS ---
#define DHTPIN 4
#define DHTTYPE DHT11
#define TRIG_PIN 5
#define ECHO_PIN 18 
#define RED_LED 2    
#define GREEN_LED 15 
#define BUZZER_PIN 13 

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastRead = 0;
unsigned long lastBeep = 0;
bool buzzerActive = false;
int distance = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Soft startup chirp
  tone(BUZZER_PIN, 800, 100); 
}

void loop() {
  unsigned long currentMillis = millis();

  // 1. Refresh Sensors
  if (currentMillis - lastRead > 150) {
    lastRead = currentMillis;
    digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duration = pulseIn(ECHO_PIN, HIGH, 25000);
    distance = duration * 0.034 / 2;
  }

  // 2. Door Logic
  int beepGap = 0;   // Time between beeps
  int beepLength = 0; // How long the beep lasts

  if (distance > 0 && distance <= 5) {
    // DOOR CLOSED: Green LED, Silence
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    beepGap = 0; 
    noTone(BUZZER_PIN);
  } 
  else if (distance > 5 && distance < 80) {
    // DOOR OPENING: Red LED
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, HIGH);
    
    // ADJUSTING THE SOUND:
    // Close to 5cm = Long gaps (slow), Short beeps (quiet feel)
    // Close to 80cm = Short gaps (fast), Longer beeps (urgent feel)
    beepGap = map(distance, 5, 80, 800, 100); 
    beepLength = map(distance, 5, 80, 20, 80); 
  }
  else {
    // WIDE OPEN: Regular Warning
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, HIGH);
    beepGap = 150;
    beepLength = 50;
  }

  // 3. The "Non-Annoying" Beep Logic
  if (beepGap > 0) {
    if (currentMillis - lastBeep > beepGap) {
      lastBeep = currentMillis;
      
      // We use a lower 1000Hz frequency for a "friendlier" sound
      tone(BUZZER_PIN, 2500, beepLength); 
    }
  } else {
    noTone(BUZZER_PIN);
  }
}