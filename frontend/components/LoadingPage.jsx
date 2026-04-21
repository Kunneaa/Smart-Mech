import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Animated } from "react-native";

export default function LoadingPage() {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>AUTOMECH</Text>
      <Animated.Image
        source={require('../assets/images/logo.png')}
        style={{transform: [{ rotate }] }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: "auto", 
    marginBottom: "auto"
  },
  text: {
    fontSize: 32,
    fontFamily: "quicksand-bold",
    fontWeight: "bold",
    color: "rgb(33,53,85)"
  }
})