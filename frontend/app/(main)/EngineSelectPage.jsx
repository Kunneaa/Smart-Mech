import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiService from '../../api'
import ReturnButton from '@/components/ReturnButton'
import { useRouter } from 'expo-router'
import Collapsible from 'react-native-collapsible';
import DisplayResult from '@/components/DisplayResult'
import EngineCard from '@/components/EngineCard'
import AntDesign from '@expo/vector-icons/AntDesign';

import { useEngine } from '../../Context/EngineContext'

const MonitorSelectPage = () => {
  const router = useRouter();

  const { listMonitor, setListMonitor } = useEngine();

  const [isCollapsedResult, setIsCollapsedResult] = useState(true);
  const [isCollapsedMonitor, setIsCollapsedMonitor] = useState(true);
  const [selectedMonitorId, setSelectedMonitorId] = useState(null);
  const [monitorRows, setMonitorRows] = useState(listMonitor ?? []);

  const [calculatedData, setCalculateData] = useState({
    luc_vong_bang_tai: "",
    van_toc_bang_tai: "",
    duong_kinh_tang_dan: "",
    thoi_gian_phuc_vu: "",
    T1: "",
    T2: "",
    t1: "",
    t2: "",
    cong_suat_truc_cong_tac: "",
    hieu_suat_chung: "",
    cong_suat_tuong_duong_truc_cong_tac: "",
    cong_suat_can_thiet_tren_truc_dong_co: "",
    so_vong_quay_truc_cong_tac: "",
    so_vong_quay_so_bo: ""
  });
  
  useEffect(() => {
    if (Array.isArray(listMonitor) && listMonitor.length > 0) {
      setMonitorRows(listMonitor);
    }
  }, [listMonitor]);

  useEffect(()=>{
    const fetchData = async () => {
      try {
        const recordID = await AsyncStorage.getItem('RECORDID');
        if (!recordID) {
          return;
        }

        const response = await apiService.Chapter2FetchData(recordID);
        setCalculateData(response.chapter2data[0]);

        const fetchedMonitorList = response.monitor_list || [];
        if (fetchedMonitorList.length > 0) {
          setMonitorRows(fetchedMonitorList);
          setListMonitor(fetchedMonitorList);
          await AsyncStorage.setItem('MONITOR_LIST', JSON.stringify(fetchedMonitorList));
          return;
        }

        const cachedMonitorList = await AsyncStorage.getItem('MONITOR_LIST');
        if (cachedMonitorList) {
          const parsedMonitorList = JSON.parse(cachedMonitorList);
          if (Array.isArray(parsedMonitorList) && parsedMonitorList.length > 0) {
            setMonitorRows(parsedMonitorList);
            setListMonitor(parsedMonitorList);
          }
        }
      } catch (error) {
        alert(error?.response?.data?.message || 'Không tải được dữ liệu monitor');
      }
    }

    fetchData()
  }, [setListMonitor])


  async function handleSubmit() {
    try {
      if(!selectedMonitorId) {
        alert('Vui lòng chọn monitor')
        return;
      }

      const recordID = await AsyncStorage.getItem('RECORDID');
      await apiService.Chapter2AfterChoosingMonitor(recordID, selectedMonitorId)
      router.push('/(main)/Chapter3Page');
    } catch(error) {
      alert(error?.response?.data?.message || 'Lưu lựa chọn monitor thất bại');
    }
  }

  return (
    <View>
      <ReturnButton onPress={() => router.back()}/>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>TÍNH TOÁN TỔNG QUAN</Text>
      </View>

      <ScrollView style={styles.inputContainer}>
        <Text style={styles.inputTitle}>Các thông số đầu vào</Text>
        <View style={styles.displayRow}>
          <View style={styles.displayColumn}>
            <DisplayResult variable={"F"} value={calculatedData.luc_vong_bang_tai} unit={"N"} />
            <DisplayResult variable={"v"} value={calculatedData.van_toc_bang_tai} unit={"m/s"} />
            <DisplayResult variable={"D"} value={calculatedData.duong_kinh_tang_dan} unit={"mm"} />
            <DisplayResult variable={"L"} value={calculatedData.thoi_gian_phuc_vu} unit={"năm"} />
          </View>
          <View style={styles.displayColumn}>
            <DisplayResult variable={"t1"} value={calculatedData.t1} unit={"giây"} />
            <DisplayResult variable={"t2"} value={calculatedData.t2} unit={"giây"} />
            <DisplayResult variable={"T1"} value={calculatedData.t1_t} unit={"momem xoắn"} />
            <DisplayResult variable={"T2"} value={calculatedData.t2_t} unit={"momem xoắn"} />
          </View>
        </View>
        <Text style={styles.resultTitle}>Kết quả tính toán và chọn động cơ</Text>

        <View style={[styles.collapseButton, !isCollapsedResult ? styles.collapseButtonActive : null]}>
          <Text style={[styles.buttonText, !isCollapsedResult ? styles.buttonTextActive : null]}>Kết quả tính toán tổng quan</Text>
          <TouchableOpacity onPress={() => setIsCollapsedResult(!isCollapsedResult)}>
            <AntDesign name={isCollapsedResult ? "caretright": "caretdown"} size={28} color={isCollapsedResult ? "rgb(33,53,85)" : "#DBE2EC"} />
          </TouchableOpacity>
        </View>

        <Collapsible collapsed={isCollapsedResult}>
          <View style={styles.resultContainer}>
            <DisplayResult variable={"Công suất trục công tác (Plv)"} value={calculatedData.cong_suat_truc_cong_tac} unit={"kW"} />
            <DisplayResult variable={"Hiệu suất chung (η)"} value={Number(calculatedData.hieu_suat_chung).toFixed(4)} unit={""} />
            <DisplayResult variable={"Công suất tương đương trục công tác (Ptd)"} value={Number(calculatedData.cong_suat_tuong_duong_truc_cong_tac).toFixed(4)} unit={"kW"} />
            <DisplayResult variable={"Công suất cần thiết trên trục động cơ (Pct)"} value={Number(calculatedData.cong_suat_can_thiet_tren_truc_dong_co).toFixed(4)} unit={"kW"} />
            <DisplayResult variable={"Số vòng quay trục công tác (nlv)"} value={Number(calculatedData.so_vong_quay_truc_cong_tac).toFixed(4)} unit={"vòng/phút"} />
            <DisplayResult variable={"Số vòng quay sơ bộ (nsb)"} value={Number(calculatedData.so_vong_quay_so_bo).toFixed(4)} unit={"vòng/phút"} />
          </View>
        </Collapsible>
        <View style={[styles.collapseButton, !isCollapsedMonitor ? styles.collapseButtonActive : null]}>
          <Text style={[styles.buttonText, !isCollapsedMonitor ? styles.buttonTextActive : null]}>Chọn monitor</Text>
          <TouchableOpacity onPress={() => setIsCollapsedMonitor(!isCollapsedMonitor)}>
            <AntDesign name={isCollapsedMonitor ? 'caretright' : 'caretdown'} size={28} color={isCollapsedMonitor ? 'rgb(33,53,85)' : '#DBE2EC'} />
        </TouchableOpacity>
        </View>

        <Collapsible collapsed={isCollapsedMonitor}>
          <View style={styles.engineContainer}>
            {monitorRows.length === 0 ? (
              <Text style={styles.emptyMonitorText}>Chưa có danh sách monitor phù hợp. Vui lòng quay lại bước tính toán.</Text>
            ) : null}
            {monitorRows.map((monitor) => (
              <EngineCard
                key={monitor.id}
                kieu_dong_co={monitor.kieu_dong_co}
                cong_suat={monitor.cong_suat}
                van_toc_vong_quay={monitor.van_toc_vong_quay}
                isSelected={selectedMonitorId === monitor.id}
                onSelect={() => {setSelectedMonitorId(monitor.id)}}
              />
            ))}
          </View>
        </Collapsible>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default MonitorSelectPage

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '30%'
  },
  title: {
    fontFamily: 'quicksand-bold',
    fontSize: 20,
    color: 'rgb(33, 53, 85)'
  },
  inputContainer: {
    marginTop: '5%',
    marginHorizontal: '8%',
    marginBottom: '40%'
  },
  inputTitle: {
    fontFamily: 'quicksand-semibold',
    fontSize: 16,
    color: 'rgb(33, 53, 85)'
  },
  displayRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent:'space-between',
    marginTop: 10
  },
  displayColumn: {
    gap: 3
  },
  resultTitle: {
    marginTop: '2%',
    fontFamily: 'quicksand-semibold',
    fontSize: 16,
    color: 'rgb(33, 53, 85)'
  },
  collapseButton: {
    marginTop: '5%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgb(33, 53, 85)',
    borderRadius: 24,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  collapseButtonActive: {
    backgroundColor:'rgb(33,53,85)',
    borderBottomRightRadius:0,
    borderBottomLeftRadius:0
  },
  buttonText: {
    fontFamily: 'quicksand-medium',
    fontSize: 14,
    color: 'rgb(33, 53, 85)'
  },
  buttonTextActive: {
    fontFamily: 'quicksand-medium',
    fontSize: 14,
    color: '#DBE2EC'
  },
  resultContainer: {
    paddingVertical: '4%',
    paddingHorizontal:'6%',
    backgroundColor:'#F5EFE7',
  },
  engineContainer: {
    backgroundColor:'#F5EFE7',
    paddingVertical: '2%',
  },
  emptyMonitorText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'rgb(33,53,85)',
    fontFamily: 'quicksand-medium',
  },

  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgb(33,53,85)',
    borderRadius: 10,
    marginBottom:'10%', 
  },

  saveButtonText: {
    color: 'white',
    fontFamily: 'quicksand-semibold',
    fontSize: 16,
  }
})