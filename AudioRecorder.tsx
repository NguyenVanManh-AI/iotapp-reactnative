import React, { useState } from 'react';
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
  const [audioPath, setAudioPath] = useState<string | null>(null);

  const handleRecordPress = async () => {
    try {
      if (!isRecording) {
        const path = await audioRecorderPlayer.startRecorder(undefined, audioSet, true);
        console.log(`Recording started: ${path}`);
        setAudioPath(path);
      } else {
        const result = await audioRecorderPlayer.stopRecorder();
        console.log(`Recording stopped: ${result}`);
        await handleUploadPress(); // Automatically upload after stopping
      }
      setIsRecording(!isRecording);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadPress = async () => {
    if (audioPath) {
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
        console.log('Audio uploaded successfully:', response.data);
        if(response.data.transcription) {
          Alert.alert(response.data.transcription);
        }
        else {
          Alert.alert('Control success !');
        }

        const option = response.data.option;
        if (onOptionChange && typeof option === 'number') {
          onOptionChange(option); // Send option to parent
        }
      } catch (error) {
        console.error('Error uploading audio:', error);
        Alert.alert('Upload error');
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
});

export default AudioRecorder;
