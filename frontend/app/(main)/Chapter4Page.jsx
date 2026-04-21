import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReturnButton from '@/components/ReturnButton';
import apiService from '@/api';
import { useRouter } from 'expo-router';
import InputField from '@/components/InputField';
import DisplayResult from '@/components/DisplayResult';
import AntDesign from '@expo/vector-icons/AntDesign';
import Collapsible from 'react-native-collapsible';

const Chapter4Page = () => {
  const router = useRouter();

  const [material, setMaterial] = useState("");
  const [heatTreatment, setHeatTreatment] = useState("");
  const [HB1, setHB1] = useState(250);
  const [HB2, setHB2] = useState(235);
  const [c, setC] = useState(1);
  const [ASoboNhanh, setAsoboNhanh] = useState(0);
  const [ASoboCham, setAsoboCham] = useState(0);
  const [khoangCachNghieng, setKhoangCachNghieng] = useState(0);
  const [khoangCachThang, setKhoangCachThang] = useState(0);
  const [mNghieng, setMNghieng] = useState(3);
  const [mThang, setMThang] = useState(2.5);

  const [displayResult, setDisplayResult] = useState(false);
  const [secondDisplayResult, setSecondDisplayResult] = useState(false);
  const [FastResult, setFastResult] = useState({});
  const [SlowResult, setSlowResult] = useState({});

  const [isCollapsedFastResult, setIsCollapsedFastResult] = useState(true);
  const [isCollapsedSlowResult, setIsCollapsedSlowResult] = useState(true);

  useEffect(() => {
    const FetchData = async () => {
      const recordID = await AsyncStorage.getItem("RECORDID");
      const response = await apiService.Chapter4PreData(recordID);
  
      const materialMap = {
        1: { material: "Gang xám", heatTreatment: "Tôi, ram" },
        2: { material: "Thép 45", heatTreatment: "Tôi cải thiện" },
        3: { material: "Thép 45", heatTreatment: "Tôi, ram" },
        default: { material: "Thép 15", heatTreatment: "Thấm cacbon, tôi, ram" }
      };
  
      const selected = materialMap[response.material] || materialMap.default;
      setMaterial(selected.material);
      setHeatTreatment(selected.heatTreatment);
    };
  
    FetchData();
  }, []);


  const module1 = (aw) => {
    return 0.01*aw;
  }

  const module2 = (aw) => {
    return 0.02*aw;
  }

  const [mNghiengMin, setMNghiengMin] = useState(0);
  const [mNghiengMax, setMNghiengMax] = useState(0);
  const [mThangMin, setMThangMin] = useState(0);
  const [mThangMax, setMThangMax] = useState(0);

  const [loading, setLoading] = useState(false)
  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (HB1 < 192 || HB1 > 285) {
        setLoading(false);
        alert("HB1 phải nằm trong khoảng 192 - 285");
        return;
      }
      if (HB2 < 192 || HB2 > 285) {
        setLoading(false);
        alert("HB2 phải nằm trong khoảng 192 - 285");
        return;
      }
      const hb1min = HB1 - 15;
      const hb1max = HB1 - 10;
      if (HB2 < hb1min || HB2 > hb1max) {
        setLoading(false);
        alert(`HB2 phải nhỏ hơn 10 đến 15 đơn vị so với HB1`);
        return;
      }
      if(c <= 0) {
        setLoading(false);
        alert("c phải lớn hơn 0");
        return;
      }

      let sb1, sch1, sb2, sch2;

      if (HB1 >= 192 && HB1 <= 240) {
        sb1 = 750;
        sch1 = 450;
      } else {
        sb1 = 850;
        sch1 = 580;
      }
      
      if (HB2 >= 241 && HB2 <= 285) {
        sb2 = 850;
        sch2 = 580;
      } else {
        sb2 = 750;
        sch2 = 450;
      }
      
      const userData = {
        Sb1: sb1,
        Sch1: sch1,
        HB1: HB1,
        Sb2: sb2,
        Sch2: sch2,
        HB2: HB2,
        c: c,
      };
      
      const recordID = await AsyncStorage.getItem("RECORDID");
      const response = await apiService.Chapter4Calculation(recordID, userData);
      if(response.success) {
        setAsoboNhanh(response.ASoBoNhanh);
        setAsoboCham(response.ASoBoCham);
        setDisplayResult(true);
      }
    } catch(error) {
      console.error("Error Calculation Chapter 4:" , error);
    } finally {
      setLoading(false);
    }
  }

  const [loadingSecondTime, setLoadingSecondTime] = useState(false);
  const handleSubmitSecondTime = async () => {
    try {
      setLoadingSecondTime(true);

      if(khoangCachNghieng < ASoboNhanh) {
        alert(`Khoảng cách phải lớn hơn ${Number(ASoboNhanh).toFixed(4)}`)
        setLoadingSecondTime(false);
        return;
      }

      if(khoangCachThang < ASoboCham) {
        alert(`Khoảng cách phải lớn hơn ${Number(ASoboCham).toFixed(4)}`)
        setLoadingSecondTime(false);
        return;
      }

      if(mNghieng < mNghiengMin || mNghieng > mNghiengMax) {
        alert(`m phải nằm trong khoảng ${Number(mNghiengMin).toFixed(1)} - ${Number(mNghiengMax).toFixed(1)}`)
        setLoadingSecondTime(false);
        return;
      }

      if(mThang < mThangMin || mThang > mThangMax) {
        alert(`m phải nằm trong khoảng ${Number(mThangMin).toFixed(1)} - ${Number(mThangMax).toFixed(1)}`)
        setLoadingSecondTime(false);
        return;
      }

      const userData = {
        mNghieng: mNghieng,
        mThang: mThang,
        khoangCachNghieng: khoangCachNghieng,
        khoangCachThang: khoangCachThang
      }
      
      const recordID = await AsyncStorage.getItem("RECORDID");
      const response = await apiService.Chapter4SecondCalculation(recordID, userData);
      if(response.success) {
        setFastResult(response.nhanh);
        setSlowResult(response.cham);
        setSecondDisplayResult(true);
      }

    } catch(error) {
      console.error("Error Second Calculation Chapter 4:" , error);
    } finally {
      setLoadingSecondTime(false);
    }
  }

  const handleChapter5 = () => {
    router.push('/(main)/Chapter5Page');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0} // adjust if needed
    >
      
        <ReturnButton onPress={() => router.back()}/>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TÍNH TOÁN {"\n"} TRUYỀN ĐỘNG BÁNH RĂNG</Text>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.FirstContainer}>
          <DisplayResult variable={"Vật liệu"} value={material}/>
          <DisplayResult variable={"Nhiệt luyện"} value={heatTreatment}/>

          <InputField
            label="Độ cứng của bánh răng nhỏ"
            sublabel="(192 - 285)"
            value={HB1.toString()}
            onChange={(text) => setHB1(Number(text))}
          />

          <InputField
            label="Độ cứng của bánh răng lớn"
            sublabel="(192 - 285)"
            value={HB2.toString()}
            onChange={(text) => setHB2(Number(text))}
          />

          <InputField
            label="Số lần ăn khớp 1 vòng quay c"
            sublabel=""
            value={c.toString()}
            onChange={(text) => setC(Number(text))}
          />

          <TouchableOpacity style={styles.doMathButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.doMathButtonText}>Chọn</Text>
          </TouchableOpacity>
        </View>

        {displayResult && (
          <View style={styles.SecondContainer}>
            <DisplayResult variable={"Khoảng cách trục (Trụ Nghiêng)"} value={Number(ASoboNhanh).toFixed(2)} unit={"mm"}/>
            <DisplayResult variable={"Khoảng cách trục (Trụ Thẳng)"} value={Number(ASoboCham).toFixed(2)} unit={"mm"}/>

            <InputField
              label="Chọn khoảng cách trục cơ bộ cho cấp nghiêng"
              sublabel={`(Khoảng cách >${Number(ASoboNhanh).toFixed(4)})`}
              value={khoangCachNghieng.toString()}
              onChange={(text) => {
                const val = Number(text);
                setKhoangCachNghieng(val);
                setMNghiengMin(module1(val));
                setMNghiengMax(module2(val));
              }}          
            />

            <InputField
              label="Chọn khoảng cách trục cơ bộ cho cấp thẳng"
              sublabel={`(Khoảng cách >${Number(ASoboCham).toFixed(4)})`}
              value={khoangCachThang.toString()}
              onChange={(text) => {
                const val = Number(text);
                setKhoangCachThang(val);
                setMThangMin(module1(val));
                setMThangMax(module2(val));
              }}     
            />

            <InputField
              label="Chọn module m của tính toán trụ nghiêng"
              sublabel={`(${Number(mNghiengMin).toFixed(1)} - ${Number(mNghiengMax).toFixed(1)})`}
              value={mNghieng.toString()}
              onChange={(text) => setMNghieng(text)}
            />

            <InputField
              label="Chọn module m của tính toán trụ thẳng"
              sublabel={`(${Number(mThangMin).toFixed(1)} - ${Number(mThangMax).toFixed(1)})`}
              value={mThang.toString()}
              onChange={(text) => setMThang(text)}
            />

            <TouchableOpacity style={styles.doMathButton} onPress={handleSubmitSecondTime} disabled={loadingSecondTime}>
              <Text style={styles.doMathButtonText}>Chọn</Text>
            </TouchableOpacity>
          </View>
        )}

        {secondDisplayResult && (
          <View style={styles.ThirdContainer}>
            <View style={[styles.collapseButton, !isCollapsedFastResult ? styles.collapseButtonActive : null]}>
              <Text style={[styles.buttonText, !isCollapsedFastResult ? styles.buttonTextActive : null]}>
                Kết quả tính toán cấp nhanh - trụ nghiêng
              </Text>
              <TouchableOpacity onPress={() => setIsCollapsedFastResult(!isCollapsedFastResult)}>
                <AntDesign 
                  name={isCollapsedFastResult ? "caretright" : "caretdown"} 
                  size={28} 
                  color={isCollapsedFastResult ? "rgb(33,53,85)" : "#DBE2EC"} 
                />
              </TouchableOpacity>
            </View>

            <Collapsible collapsed={isCollapsedFastResult}>
              <View style={styles.resultContainer}>
                <DisplayResult variable={"Khoảng cách trục (a)"} value={FastResult.khoangCach} unit={"mm"} />
                <DisplayResult variable={"Số bánh răng nhỏ (z1)"} value={FastResult.z1} unit={"răng"}/>
                <DisplayResult variable={"Số bánh răng lớn (z2)"} value={FastResult.z2} unit={"răng"}/>
                <DisplayResult variable={"Đường kính đỉnh răng 1 (da1)"} value={Number(FastResult.duong_kinh_dinh_rang_da1).toFixed(2)} unit={"mm"}/>
                <DisplayResult variable={"Đường kính đỉnh răng 2 (da2)"} value={Number(FastResult.duong_kinh_dinh_rang_da2).toFixed(2)} unit={"mm"} />
              </View>
            </Collapsible>

            {/* Collapsible - Tính toán chậm */}
            <View style={[styles.collapseButton, !isCollapsedSlowResult ? styles.collapseButtonActive : null]}>
              <Text style={[styles.buttonText, !isCollapsedSlowResult ? styles.buttonTextActive : null]}>
                Kết quả tính toán cấp chậm - trụ thẳng
              </Text>
              <TouchableOpacity onPress={() => setIsCollapsedSlowResult(!isCollapsedSlowResult)}>
                <AntDesign 
                  name={isCollapsedSlowResult ? "caretright" : "caretdown"} 
                  size={28} 
                  color={isCollapsedSlowResult ? "rgb(33,53,85)" : "#DBE2EC"} 
                />
              </TouchableOpacity>
            </View>

            <Collapsible collapsed={isCollapsedSlowResult}>
              <View style={styles.resultContainer}>
                <DisplayResult variable={"Khoảng cách trục (a)"} value={SlowResult.khoangCach} unit={"mm"} />
                <DisplayResult variable={"Số bánh răng (z1)"} value={SlowResult.z1} unit={"răng"} />
                <DisplayResult variable={"Số bánh răng (z2)"} value={SlowResult.z2} unit={"răng"}/>
                <DisplayResult variable={"Đường kính đỉnh răng 1 (da1)"} value={Number(SlowResult.duong_kinh_dinh_rang_da1).toFixed(2)} unit={"mm"}/>
                <DisplayResult variable={"Đường kính đỉnh răng 2 (da2)"} value={Number(SlowResult.duong_kinh_dinh_rang_da2).toFixed(2)} unit={"mm"}/>
              </View>
            </Collapsible>
            <TouchableOpacity style={styles.saveButton} onPress={handleChapter5}>
                  <Text style={styles.doMathButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Chapter4Page

const styles = StyleSheet.create({
  FirstContainer: {
    marginTop: '5%',
    marginHorizontal: '8%',
  },
  SecondContainer: {
    marginTop: '5%',
    marginHorizontal: '8%',
  },
  ThirdContainer: {
    marginTop: '2%',
    marginHorizontal: '8%',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '30%',
  },
  title: {
    fontFamily: 'quicksand-bold',
    fontSize: 20,
    color: 'rgb(33, 53, 85)',
    textAlign: 'center',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  inputFieldContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5
  },
  inputField: {
    color: 'rgb(58, 65, 99)',
    fontFamily: 'quicksand-bold',
    fontSize: 14,
  },
  input: {
    borderColor: '#213555',
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    shadowOffset: {width:0, height:4,},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
    marginRight: 15
  },
  doMathButton: {
    display: 'flex',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    padding: 8,
    backgroundColor: 'rgb(33,53,85)',
    borderRadius: 10,
    marginBottom: 0, 
    alignSelf: 'flex-end'
  },
  doMathButtonText: {
    color: 'white',
    fontFamily: 'quicksand-semibold',
    fontSize: 14
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgb(33,53,85)',
    borderRadius: 10,
    marginBottom:'15%', 
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
  resultContainer: {
    paddingVertical: '4%',
    paddingHorizontal:'7%',
    backgroundColor:'#F5EFE7',
    
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
})