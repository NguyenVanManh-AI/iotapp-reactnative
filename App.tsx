import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import AudioRecorder from './AudioRecorder.tsx';

// Function to send command to ESP8266
const sendCommand = async (option: number) => {
  const url = 'http://192.168.100.150/sendOption'; // ESP8266 IP address
  const data = { option }; // Data to be sent

  try {
    // Sending POST request using fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data).toString(),
    });

    // Checking the response status
    if (response.ok) {
      console.log('Success', `Command sent successfully: Option ${option}`);
    } else {
      console.log('Error', `Failed to send command: ${response.status}`);
      Alert.alert('Error', `Failed to send command: ${response.status}`);
    }
  } catch (error) {
    console.log('Connection Error', error.message);
    Alert.alert('Connection Error', error.message);
  }
};

// Custom button component for better styling
const ControlButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[styles.button, isActive && styles.activeButton]} onPress={onPress}>
    <Text style={styles.buttonText}>{isActive ? 'Off' : 'On'} {title}</Text>
  </TouchableOpacity>
);

// Main component
const App = () => {
  const [fanOn, setFanOn] = useState(false);
  const [bedroomLightOn, setBedroomLightOn] = useState(false);
  const [diningRoomLightOn, setDiningRoomLightOn] = useState(false);
  const [livingRoomLightOn, setLivingRoomLightOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false); // State for door

  const toggleFan = () => {
    const newState = !fanOn;
    sendCommand(newState ? 1 : 2); // 1 for ON, 2 for OFF
    setFanOn(newState);
  };

  const toggleDoor = () => {
    const newState = !doorOpen;
    sendCommand(newState ? 3 : 4); // 3 for Open, 4 for Close
    setDoorOpen(newState);
  };

  const toggleBedroomLight = () => {
    const newState = !bedroomLightOn;
    sendCommand(newState ? 5 : 6); // 5 for ON, 6 for OFF
    setBedroomLightOn(newState);
  };

  const toggleDiningRoomLight = () => {
    const newState = !diningRoomLightOn;
    sendCommand(newState ? 7 : 8); // 7 for ON, 8 for OFF
    setDiningRoomLightOn(newState);
  };

  const toggleLivingRoomLight = () => {
    const newState = !livingRoomLightOn;
    sendCommand(newState ? 9 : 10); // 9 for ON, 10 for OFF
    setLivingRoomLightOn(newState);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Home Device Control</Text> {/* Tiêu đề */}
      <ControlButton title="Fan" isActive={fanOn} onPress={toggleFan} />
      <ControlButton title="Door" isActive={doorOpen} onPress={toggleDoor} /> {/* Nút mở/đóng cửa */}
      <ControlButton title="Bedroom Light" isActive={bedroomLightOn} onPress={toggleBedroomLight} />
      <ControlButton title="Dining Room Light" isActive={diningRoomLightOn} onPress={toggleDiningRoomLight} />
      <ControlButton title="Living Room Light" isActive={livingRoomLightOn} onPress={toggleLivingRoomLight} />
      <AudioRecorder />
    </View>
  );
};

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  title: {
    fontSize: 24,            // Kích thước chữ cho tiêu đề
    fontWeight: 'bold',      // Đậm
    marginBottom: 20,        // Khoảng cách dưới tiêu đề
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#FF5722', // Change color when active
  },
});

export default App;