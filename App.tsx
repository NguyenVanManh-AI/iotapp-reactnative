import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import AudioRecorder from './AudioRecorder.tsx';

// Function to send command to ESP8266
const sendCommand = async (option: number) => {
	const url = 'http://192.168.100.150/sendOption'; // ESP8266 IP address (OPPOReno)
	const data = { option }; // Data to be sent

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(data).toString(),
		});

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
const ControlButton = ({ title, isActive, onPress }) => (
	<TouchableOpacity style={[styles.button, isActive && styles.activeButton]} onPress={onPress}>
		<Text style={styles.buttonText}>{title === 'Window' ? (isActive ? 'Close' : 'Open') : (isActive ? 'Off' : 'On')} {title}</Text>
	</TouchableOpacity>
);

// Main component
const App = () => {
	const [fanOn, setFanOn] = useState(false);
	const [bedroomLightOn, setBedroomLightOn] = useState(false);
	const [diningRoomLightOn, setDiningRoomLightOn] = useState(false);
	const [livingRoomLightOn, setLivingRoomLightOn] = useState(false);
	const [windowOpen, setWindowOpen] = useState(false);

	// Function to handle option received from AudioRecorder or button press
	const handleOptionUpdate = async (option: number) => {
		console.log(`Received option: ${option}`);
		await sendCommand(option); // Send command to ESP8266

		// Update state based on option
		switch (option) {
			case 1:
				setFanOn(true);
				break;
			case 2:
				setFanOn(false);
				break;
			case 3:
				setWindowOpen(true);
				break;
			case 4:
				setWindowOpen(false);
				break;
			case 5:
				setBedroomLightOn(true);
				break;
			case 6:
				setBedroomLightOn(false);
				break;
			case 7:
				setDiningRoomLightOn(true);
				break;
			case 8:
				setDiningRoomLightOn(false);
				break;
			case 9:
				setLivingRoomLightOn(true);
				break;
			case 10:
				setLivingRoomLightOn(false);
				break;
			default:
				console.log('Unrecognized option');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Smart Home Device Control</Text>
			<ControlButton title="Fan" isActive={fanOn} onPress={() => handleOptionUpdate(fanOn ? 2 : 1)} />
			<ControlButton title="Window" isActive={windowOpen} onPress={() => handleOptionUpdate(windowOpen ? 4 : 3)} />
			<ControlButton title="Bedroom Light" isActive={bedroomLightOn} onPress={() => handleOptionUpdate(bedroomLightOn ? 6 : 5)} />
			<ControlButton title="Dining Room Light" isActive={diningRoomLightOn} onPress={() => handleOptionUpdate(diningRoomLightOn ? 8 : 7)} />
			<ControlButton title="Living Room Light" isActive={livingRoomLightOn} onPress={() => handleOptionUpdate(livingRoomLightOn ? 10 : 9)} />
			<AudioRecorder onOptionChange={handleOptionUpdate} /> {/* Pass callback to child */}
		</View>
	);
};

// Styling for the component
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	button: {
		backgroundColor: '#4CAF50',
		padding: 15,
		borderRadius: 8,
		marginVertical: 5,
		width: '80%',
		alignItems: 'center',
	},
	buttonText: {
		color: '#FFF',
		fontSize: 18,
		fontWeight: 'bold',
	},
	activeButton: {
		backgroundColor: '#FF5722',
	},
});

export default App;
