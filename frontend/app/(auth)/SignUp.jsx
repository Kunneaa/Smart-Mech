import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import apiService from '../../api'

const SignUp = () => {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    password: "",
    reEnterpassword: ""
  })

  function handleLoginRoute() {
    router.replace('/(auth)/Login')
  }

  async function handleSubmit() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.email || !user.password || !user.reEnterpassword) {
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
  
    if (user.password !== user.reEnterpassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    let UserData = {
      email: user.email,
      password: user.password
    }

    try {
      let response = await apiService.UserCreateAccount(UserData);
      alert(response.message)
      router.replace('/(auth)/Login')
    } catch(error) {
      if (!error?.response) {
        alert(`Không kết nối được backend (${apiService.getBaseURL()}). Nếu dùng điện thoại thật, hãy đặt EXPO_PUBLIC_API_URL=http://<IP-LAN-cua-may-ban>:3000`);
        return;
      }

      alert(error?.response?.data?.message || "Đăng ký thất bại!");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.signupTitle}>ĐĂNG KÝ TÀI KHOẢN</Text>
      <View style={styles.signupContainer}>
        <Text style={styles.signupContainerLabel}>Email</Text>
        <TextInput 
          style={styles.signupContainerInput} 
          onChangeText={(text) => setUser(prev => ({ ...prev, email: text }))}
          value={user.email}
          placeholder='Nhập email'
        />

        <Text style={styles.signupContainerLabel}>Mật khẩu</Text>
        <TextInput 
          style={styles.signupContainerInput} 
          onChangeText={(text) => setUser(prev => ({ ...prev, password: text }))}
          value={user.password}
          secureTextEntry
          placeholder='Nhập mật khẩu'
        />

        <Text style={styles.signupContainerLabel}>Nhập lại mật khẩu</Text>
        <TextInput 
          style={styles.signupContainerInput} 
          onChangeText={(text) => setUser(prev => ({ ...prev, reEnterpassword: text }))}
          value={user.reEnterpassword}
          secureTextEntry
          placeholder='Nhập mật khẩu'
        />

        <TouchableOpacity style={styles.signupSubmitButton} onPress={handleSubmit}>
          <Text style={styles.signupSubmitButtonText}>Đăng ký</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText1}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={handleLoginRoute}>
            <Text style={styles.signUpText2}>Đăng Nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default SignUp

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    marginBottom: 'auto'
  },
  signupContainer: {
    backgroundColor: '#DBE2EC',
    marginTop: 20,
    padding: 20,
    marginHorizontal: '10%',
    borderRadius: 15,
    display:'flex'
  },
  signupTitle: {
    fontFamily: 'quicksand-bold',
    fontSize: 24,
    color: 'rgb(33,53,85)',
    marginHorizontal: 'auto'
  },
  signupContainerInput: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 10
  },
  signupContainerLabel: {
    marginBottom: 10,
    fontFamily: 'quicksand-semibold',
    color: 'rgb(33,53,85)'
  },
  signupSubmitButton: {
    flexGrow: 1,
    backgroundColor: 'rgb(33,53,85)',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5
  },
  signupSubmitButtonText: {
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