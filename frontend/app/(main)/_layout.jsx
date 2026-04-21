import React from 'react'
import { Stack } from 'expo-router'

import { EngineProvider } from '@/Context/EngineContext'

const AuthLayout = () => {
  return (
    <EngineProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="HomePage"/>
        <Stack.Screen name="Profile"/>
        <Stack.Screen name="InputPage"/>
        <Stack.Screen name="EngineSelectPage"/>
        <Stack.Screen name="Chapter3Page"/>
        <Stack.Screen name="Chapter4Page"/>
        <Stack.Screen name="Chapter5Page"/>
        <Stack.Screen name="PdfPage"/>
      </Stack>
    </EngineProvider>
  )
}

export default AuthLayout