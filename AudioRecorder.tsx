import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSet, AudioSourceAndroidType } from 'react-native-audio-recorder-player';
import axios from 'axios';

const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.1);

const AudioRecorder = ({ onOptionChange }) => {
	const audioSet: AudioSet = {
		AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
		AudioSourceAndroid: AudioSourceAndroidType.MIC,
	};

	const [isRecording, setIsRecording] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [audioPath, setAudioPath] = useState<string | null>(null);
	const silenceThreshold = -10; // Ngưỡng âm lượng (dB)
	const silenceTimeout = 2000; // Thời gian chờ trước khi tự động dừng (ms)

	useEffect(() => {
		if (isRecording) {
			let silenceTimer;
			audioRecorderPlayer.addRecordBackListener((e) => {
				const currentVolume = e.currentMetering;
				if (currentVolume < silenceThreshold) {
					if (!silenceTimer) {
						silenceTimer = setTimeout(async () => {
							await stopRecording(); // Tự động dừng ghi âm
						}, silenceTimeout);
					}
				} else if (silenceTimer) {
					clearTimeout(silenceTimer); // Hủy bỏ hẹn giờ nếu phát hiện âm thanh
					silenceTimer = null;
				}
			});
			return () => {
				audioRecorderPlayer.removeRecordBackListener();
				if (silenceTimer) clearTimeout(silenceTimer);
			};
		}
	}, [isRecording]);

	const handleRecordPress = async () => {
		if (!isRecording) {
			const path = await audioRecorderPlayer.startRecorder(undefined, audioSet, true);
			console.log(`Recording started: ${path}`);
			setAudioPath(path);
			setIsRecording(true);
		} else {
			await stopRecording();
		}
	};

	const stopRecording = async () => {
		const result = await audioRecorderPlayer.stopRecorder();
		console.log(`Recording stopped: ${result}`);
		setIsRecording(false);
		await handleUploadPress(); // Tự động upload sau khi dừng
	};

	const handleUploadPress = async () => {
		if (audioPath) {
			setIsUploading(true);
			const formData = new FormData();
			formData.append('audio', {
				uri: audioPath,
				type: 'audio/mpeg',
				name: 'recordedAudio.mp3',
			});

			try {
				const response = await axios.post('http://192.168.89.250:8000/api/upload-audio', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				console.log('Upload success', response.data);
				if (response.data.status == 'ok') {
					if (response.data.transcription) Alert.alert(response.data.transcription);
					else Alert.alert('Successful control !');
					
					const option = response.data.option;
					if (onOptionChange && typeof option === 'number') onOptionChange(option); // Send option to parent
				} 
				else {
					Alert.alert(response.data.message);
				}
			} catch (error) {
				console.error('Upload error !', error);
				Alert.alert('Upload error !');
			} finally {
				setIsUploading(false);
			}
		} else {
			console.warn('No audio file to upload !');
			Alert.alert('No audio file to upload !');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Voice control</Text>
			<Pressable onPress={handleRecordPress} style={styles.button}>
				<Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
			</Pressable>
			{isUploading && <Text style={styles.uploadText}>Are controlling...</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: '600',
		marginTop: 0,
		marginBottom: 10,
	},
	button: {
		backgroundColor: 'blue',
		borderRadius: 5,
		padding: 10,
		margin: 5,
		alignItems: 'center',
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
	},
	uploadText: {
		color: '#4CAF50',
		fontSize: 16,
		marginTop: 10,
	},
});

export default AudioRecorder;
