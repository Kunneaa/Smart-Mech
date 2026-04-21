import React from 'react'
import { Stack } from 'expo-router'

const HistoryLayout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="History"/>
      <Stack.Screen name="Pdf"/>
    </Stack>
  )
}

export default HistoryLayout