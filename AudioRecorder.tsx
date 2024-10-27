import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSet, AudioSourceAndroidType } from 'react-native-audio-recorder-player';
import axios from 'axios';

const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.1);

const AudioRecorder = () => {
  const audioSet: AudioSet = {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
  };

  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);

  const handleRecordPress = async () => {
    try {
      if (!isRecording) {
        // Start recording
        const path = await audioRecorderPlayer.startRecorder(undefined, audioSet, true);
        console.log(`Recording started: ${path}`);
        setAudioPath(path); // Save audio path
      } else {
        // Stop recording
        const result = await audioRecorderPlayer.stopRecorder();
        console.log(`Recording stopped: ${result}`);
      }
      setIsRecording(!isRecording);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlayPress = async () => {
    if (audioPath) {
      try {
        await audioRecorderPlayer.startPlayer(audioPath);
        console.log('Playing audio...');
      } catch (error) {
        console.error(error);
      }
    } else {
      console.warn('No audio file available to play');
    }
  };

  const handleUploadPress = async () => {
    if (audioPath) {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioPath,
        type: 'audio/mpeg', // Specify type as MP3
        name: 'recordedAudio.mp3', // Set audio file name
      });

      try {
        const response = await axios.post('http://192.168.100.190:8000/api/upload-audio', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Audio uploaded successfully:', response.data);
        Alert.alert('Audio uploaded successfully: ' + response.data);
      } catch (error) {
        console.error('Error uploading audio:', error);
        Alert.alert('Upload error', error.response ? error.response.data.error : error.message);
      }
    } else {
      console.warn('No audio file to upload');
      Alert.alert('No audio file to upload');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice control</Text>

      <Pressable onPress={handleRecordPress} style={styles.button}>
        <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
      </Pressable>

      <Pressable onPress={handleUploadPress} style={styles.button}>
        <Text style={styles.buttonText}>Control</Text>
      </Pressable>

      <Pressable onPress={handlePlayPress} style={styles.button}>
        <Text style={styles.buttonText}>Replay</Text>
      </Pressable>
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 10,
    margin: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AudioRecorder;
