import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import apiService from '../../api'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const router = useRouter()

  const [user, setUser] = useState({
    email: "",
    password: ""
  })

  function handleSignUpRoute() {
    router.replace('/(auth)/SignUp')
  }

  async function handleSubmit() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.email || !user.password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!emailRegex.test(user.email)) {
      alert("Email không đúng định dạng!");
      return;
    }
  
    if (user.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    let UserData = {
      email: user.email,
      password: user.password
    }

    try {
      let response = await apiService.UserLoginAccount(UserData);
      await AsyncStorage.removeItem("USERID");
      await AsyncStorage.setItem('USERID', response.token)
      router.replace('/(main)/HomePage')
    } catch (error) {
      if (!error?.response) {
        alert(`Không kết nối được backend (${apiService.getBaseURL()}). Nếu dùng điện thoại thật, hãy đặt EXPO_PUBLIC_API_URL=http://<IP-LAN-cua-may-ban>:3000`);
        return;
      }

      alert(error?.response?.data?.message || "Đăng nhập thất bại!");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.loginTitle}>ĐĂNG NHẬP</Text>
      <View style={styles.loginContainer}>
        <Text style={styles.loginContainerLabel}>Email</Text>
        <TextInput 
          style={styles.loginContainerInput} 
          onChangeText={(text) => setUser(prev => ({...prev, email: text}))} 
          value={user.email} 
          placeholder='Nhập email'
        />
        <Text style={styles.loginContainerLabel}>Mật khẩu</Text>
        <TextInput 
          style={styles.loginContainerInput} 
          onChangeText={(text) => setUser(prev => ({...prev, password: text}))} 
          value={user.password} 
          placeholder='Nhập mật khẩu'
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginSubmitButton} onPress={handleSubmit}>
          <Text style={styles.loginSubmitButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText1}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={handleSignUpRoute}>
            <Text style={styles.signUpText2}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    marginBottom: 'auto'
  },
  loginContainer: {
    backgroundColor: '#DBE2EC',
    marginTop: 20,
    padding: 20,
    marginHorizontal: '10%',
    borderRadius: 15,
    display:'flex'
  },
  loginTitle: {
    fontFamily: 'quicksand-bold',
    fontSize: 24,
    color: 'rgb(33,53,85)',
    marginHorizontal: 'auto'
  },
  loginContainerInput: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 10
  },
  loginContainerLabel: {
    marginBottom: 10,
    fontFamily: 'quicksand-semibold',
    color: 'rgb(33,53,85)'
  },
  loginSubmitButton: {
    flexGrow: 1,
    backgroundColor: 'rgb(33,53,85)',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5
  },
  loginSubmitButtonText: {
    color: 'white',
    fontFamily: 'quicksand-bold',
    textAlign: 'center',
  },
  signUpContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 15,
  },
  signUpText1: {
    fontFamily: 'quicksand'
  },
  signUpText2: {
    fontFamily: 'quicksand-semibold',
    color: 'rgb(33,53,85)'
  }
})
