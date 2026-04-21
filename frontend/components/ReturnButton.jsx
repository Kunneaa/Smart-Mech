import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

const ReturnButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.ReturnButtonContainer} onPress={onPress}>
      <AntDesign name="left" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default ReturnButton

const styles = StyleSheet.create({
  ReturnButtonContainer : {
    position: 'absolute',
    padding: 15,
    borderRadius: 99,
    top: 60,
    left: 20,
    backgroundColor: '#DBE2EC',
  },
})