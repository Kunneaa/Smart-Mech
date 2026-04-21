import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'
import apiService from '@/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from '@expo/vector-icons/AntDesign';

const Profile = () => {
  const router = useRouter();
  
  const [userData, setUserData] = useState({});
  const [totalRecord, setTotalRecord] = useState(0);

  const FetchUser = async () => {
    const userId = await AsyncStorage.getItem("USERID");
    const response = await apiService.GetUser(userId);
    setUserData(response.userData);
  }

  const CountTotalRecord = async () => {
    const userId = await AsyncStorage.getItem("USERID");
    const response = await apiService.CountTotalRecord(userId);
    setTotalRecord(response.total);
  }

  useEffect(() => {
    FetchUser();
    CountTotalRecord();
  }, [])

  const handleLogout = async () => {
    await AsyncStorage.removeItem("USERID");
    router.replace('/(auth)/Login');
  }

  return (
    <View style={{backgroundColor: '#F5F5F5'}}>
      <ReturnButton onPress={() => router.back()}/>

      <View style={styles.container}>
        <Text style={styles.titleText}>Hồ sơ của tôi</Text>
        {userData.image ? (
          <Image
            source={{ uri: userData.image }}
            style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 15}}
          />
        ) : (
          <AntDesign style={{marginBottom: 15}} name="user" size={48} color="black" />
        )}
        <Text style={styles.emailBox}>{userData.email}</Text>

        <View style={styles.calculationBox}>
          <Text style={styles.totalText}>Tổng số lượt tính toán</Text>
          <Text style={styles.totalCount}>{totalRecord}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
        <Text style={styles.signOutText}>Đăng Xuất</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '30%'
  },
  titleText: {
    color: 'rgb(58, 65, 99)',
    fontFamily: 'quicksand-bold',
    fontSize: 24,
    marginBottom: 10
  },
  nameBox: {
    marginTop: 15,
    color: 'rgb(58, 65, 99)',
    fontFamily: 'quicksand-bold',
    fontSize: 20,
    marginBottom: 10
  },
  emailBox: {
    color: 'rgb(58, 65, 99)',
    fontFamily: 'quicksand-bold',
    fontSize: 16,
  },
  calculationBox: {
    display:'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: '15%',
    paddingVertical: '5%',
    backgroundColor: 'white',
    borderRadius: 20
  },
  totalText: {
    color: 'rgb(58, 65, 99)',
    fontFamily: 'quicksand-bold',
    fontSize: 16,
  }, 
  totalCount: {
    color: 'rgb(58, 65, 99)',
    fontFamily: 'quicksand-bold',
    fontSize: 16,
    marginTop: 10
  },
  signOutButton: {
    marginTop: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#213555',
    marginHorizontal: '20%',
    paddingHorizontal: '15%',
    paddingVertical: 15,
    borderRadius: 15
  },
  signOutText: {
    color: 'white',
    fontFamily: 'quicksand-bold',
    fontSize: 14
  }
})