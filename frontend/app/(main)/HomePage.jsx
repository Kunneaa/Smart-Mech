import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import apiService from '@/api';

const parseRecordDateTime = (record) => {
  const createdAt = record?.created_at || '';
  const time = record?.time || '00:00';

  const createdParts = createdAt.split(' ');
  const datePart = createdParts.length > 1 ? createdParts[1] : '';
  const [day, month, year] = datePart.split('.').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  if (![day, month, year, hour, minute].every(Number.isFinite)) {
    return 0;
  }

  return new Date(2000 + year, month - 1, day, hour, minute).getTime();
};

const TimelineItem = ({ item, index, isLast, handlePdfViewPage, handleDeleteRecord }) => {
  const isOdd = index % 2 === 0;
  const containerStyle = isOdd ? styles.contentBox : styles.whiteBox;
  const titleStyle = isOdd ? styles.titleContent : styles.titleWhiteBox;
  const descStyle = isOdd ? styles.desc : styles.descWhiteBox;
  return(
    <View style={styles.itemContainer}>
      {/* Time column */}
      <View style={styles.timeContainer}>
        <Text style={styles.date}>{item.created_at}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {/* Middle timeline column */}
      <View style={styles.timelineContainer}>
        <View style={styles.circle} />
        {!isLast && <View style={styles.verticalLine} />}
      </View>

      {/* Content box */}
      <View style={containerStyle}>
        <TouchableOpacity onPress={() => handlePdfViewPage(item.id)}>
          <Text style={titleStyle}>{item.name ? item.name : "Chưa được đặt tên"}</Text>
          <Text style={descStyle}>Kết quả tính toán</Text> 
        </TouchableOpacity>
        <View style ={styles.icon}>
          <TouchableOpacity onPress={() => handleDeleteRecord(item.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={22}  color="firebrick"/> 
          </TouchableOpacity>
          {/* <AntDesign name="delete" size={24} color="firebrick" /> */}
        </View>
      </View>
    </View>
  );
};

const HomePage = () => {
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [userData, setUserData] = useState({});

  const fetchData = async () => {
    try {
      const userID = await AsyncStorage.getItem("USERID");
      if (!userID) {
        setRecords([]);
        return;
      }

      const response = await apiService.FetchHistoryData(userID);
      if (!response.success || !Array.isArray(response.record)) {
        setRecords([]);
        return;
      }

      const sorted = response.record
        .map((item) => ({
          ...item,
          _datetime: parseRecordDateTime(item),
        }))
        .sort((a, b) => b._datetime - a._datetime)
        .slice(0, 3);

      setRecords(sorted);
    } catch (error) {
      console.error('Fetch history failed:', error);
      setRecords([]);
    }
  };

  const fetchUser = async () => {
    try {
      const userId = await AsyncStorage.getItem("USERID");
      if (!userId) {
        setUserData({});
        return;
      }

      const response = await apiService.GetUser(userId);
      setUserData(response?.userData || {});
    } catch (error) {
      console.error('Fetch user failed:', error);
      setUserData({});
    }
  };

  const handlePdfViewPage = (recordID) => {
    router.push({
      pathname: '/(history)/Pdf',
      params: { recordID }
    });
  }

  const handleDeleteRecord = async (recordID) => {
    try {
      const response = await apiService.DeleteRecord(recordID);
      if(response.success) {
        fetchData();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Xóa record thất bại');
    }
  };

  function handleCalculatePage() {
    router.push('/(main)/InputPage');
  }

  const handleHistoryPage = () => {
    router.push('/(history)/History');
  }

  useEffect(() => {
    const bootstrap = async () => {
      await AsyncStorage.removeItem("RECORDID");
      await Promise.all([fetchData(), fetchUser()]);
    };

    bootstrap();
  }, [])

  return(
    <View>
      <TouchableOpacity style={styles.profileButton} onPress={() => router.navigate('/(main)/Profile')}>
        {userData?.image ? (
          <Image
            source={{ uri: userData.image }}
            style={{ width: 60, height: 60, borderRadius: 60 }}
          />
        ) : (
          <AntDesign style={{marginRight: 15}} name="user" size={36} color="black" />
        )}
      </TouchableOpacity>

      <View style={styles.ButtonContainer}>
        <TouchableOpacity style={styles.CalculateButtonContainer} onPress={handleCalculatePage}>
          <Image source={require('../../assets/images/calendar-edit.png')}/>
          <Text style={styles.TextButton}>Tính toán</Text>
          <Text style={styles.TextButton}>Chọn chi tiết máy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.CalculateButtonContainer} onPress={handleHistoryPage}>
          <Image source={require('../../assets/images/list-right.png')}/>
          <Text style={styles.TextButton}>Lịch sử</Text>
          <Text style={styles.TextButton}>tính toán</Text>
        </TouchableOpacity>
      </View>

      <SafeAreaView>
        <Text style={styles.historyText}>Lịch sử tính toán gần nhất</Text>
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TimelineItem 
              item={item} 
              index={index} 
              isLast={index === records.length - 1}
              handlePdfViewPage={handlePdfViewPage}
              handleDeleteRecord={handleDeleteRecord}
            />
          )}
        />
      </SafeAreaView>

    </View>
  );
}

export default HomePage

const styles = StyleSheet.create({
  profileButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 10,
    alignItems: 'center',
    marginTop: '20%',
    marginRight: '5%'
  },
  ButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: 'auto',
    marginTop: '10%',
    gap: 15
    // justifyContent:'space-between'
  },
  CalculateButtonContainer: {
    backgroundColor: '#DBE2EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 30,
    width: '40%',
    // height:'50%',
    borderRadius: 15
  },
  historyText: {
    fontFamily: 'quicksand-bold',
    color:'rgb(33,53,85)',
    fontSize: 20,
    marginLeft: 40,
    marginTop: 30
  },
  TextButton: {
    fontFamily: 'quicksand-bold',
    color:'rgb(33,53,85)',
    fontSize: 14
  },
  itemContainer: {
    flexDirection: 'row',
    paddingRight: 40,
    paddingLeft: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  timeContainer: {
    width: 100,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  date: {
    color: '#213555',
    fontWeight: 'bold',
    color: '#1D1E4F',
  },
  time: {
    color: '#3E5879',
  },
  contentBox: {
    flex: 1,
    flexDirection:'row',
    backgroundColor: '#213555',
    borderRadius: 20,
    paddingInline: 15,
    paddingVertical:10,
    width: 20,
    marginLeft: 10,
    justifyContent:'space-between',
    gap: '20%',
  },
  icon:{
    marginTop: 0,
  },
  whiteBox: {
    flex: 1,
    flexDirection:'row',
    borderRadius: 20,
    paddingInline: 15,
    paddingVertical:10,
    width: 20,
    marginLeft: 10,
    justifyContent:'space-between',
    gap: '20%',
    backgroundColor: '#F5EFE7',
  },
  titleContent: {
    fontSize: 14,
    fontFamily: 'quicksand-bold',
    fontWeight: '600',
    color: '#D8C4B6',
    marginBottom: 6,
  },
  titleWhiteBox: {
    fontSize: 14,
    fontFamily: 'quicksand-bold',
    fontWeight: '600',
    marginBottom: 6,
    color:'#213555'
  },
  desc: {
    fontFamily: 'quicksand-bold',
    fontWeight:'500',
    fontSize: 13,
    color: '#F5EFE7',
    marginBottom: 6,
  },
  descWhiteBox:{
    fontFamily: 'quicksand-bold',
    fontWeight:'500',
    fontSize: 13,
    color: '#3E5879',
    marginBottom: 6,
  },
})