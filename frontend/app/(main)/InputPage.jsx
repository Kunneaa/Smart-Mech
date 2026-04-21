import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native'
import { useEffect, useState } from 'react'
import apiService from '../../api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useEngine } from '../../Context/EngineContext'

const InputPage = () => {
  const [f, setF] = useState(6000);
  const [v, setV] = useState(1.5);
  const [D, setD] = useState(650);
  const [L, setL] = useState(10);
  const [t1, setT1] = useState(45);
  const [t2, setT2] = useState(30);
  const [T1, setT1M] = useState('T');
  const [T2, setT2M] = useState('0.8T');
  const [nk, setNk] = useState(1);
  const [nol, setNol] = useState(0.993);
  const [nbr, setNbr] = useState(0.97);
  const [nx, setNx] = useState(0.91);
  const [uh, setUh] = useState(8);
  const [ux, setUx] = useState(2);
  const [UserID, setUserID] = useState("");
  const [loading, setLoading] = useState(false);

  const { setListMonitor } = useEngine();

  const inputName = ["F(N)", "v(m/s)", "D(mm)", "L(năm)", "t1(giây)", "t2(giây)", "T1\n(momem xoắn)", 
    "T2\n(momem xoắn)", "Hiệu suất nối trục", "Hiệu suất ổ lăn\n(0.99 - 0.995)", 
    "Hiệu suất bánh răng\n(0.96 - 0.98)", "Hiệu suất xích\n(0.90 - 0.93)", 
    "Tỷ số truyền\nhộp giảm tốc (8 - 40)", "Tỷ số truyền\nxích (2 - 5)"]

  const inputFunc = [setF, setV, setD, setL, setT1, setT2, setT1M, setT2M, setNk, setNol, setNbr, setNx, setUh, setUx]

  const inputValues = [f, v, D, L, t1, t2, T1, T2, nk, nol, nbr, nx, uh, ux];

  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("USERID");
        if(storedUserID) {
          setUserID(storedUserID);
        } else {
          console.log("UserId no found in AsyncStorage");
        }
      } catch(error) {
        console.error("Error fetching userID:", error);
      }
    }

    fetchUserID();
  }, [])

  const parseTorqueInput = (value) => {
    const normalized = value.toString().trim().toUpperCase().replace(',', '.');
    if (normalized === 'T') {
      return { raw: value, numeric: 1 };
    }

    const numeric = Number(normalized.replace('T', ''));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return null;
    }

    return { raw: value, numeric };
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    if (!UserID) {
      alert('Không tìm thấy phiên đăng nhập, vui lòng đăng nhập lại');
      setLoading(false);
      return;
    }

    const values = {
      f: Number(f),
      v: Number(v),
      D: Number(D),
      L: Number(L),
      t1: Number(t1),
      t2: Number(t2),
      nk: Number(nk),
      nol: Number(nol),
      nbr: Number(nbr),
      nx: Number(nx),
      uh: Number(uh),
      ux: Number(ux),
    };

    if (Object.values(values).some((val) => !Number.isFinite(val))) {
      alert('Vui lòng nhập đúng định dạng số cho các trường đầu vào');
      setLoading(false);
      return;
    }

    const parsedT1 = parseTorqueInput(T1);
    const parsedT2 = parseTorqueInput(T2);

    if (!parsedT1 || !parsedT2) {
      alert('T1/T2 không hợp lệ. Ví dụ hợp lệ: T, 0.8T, 1.2T');
      setLoading(false);
      return;
    }

    if(values.f < 0) {
      alert("Lực vòng băng tải phải lớn hơn 0");
      setLoading(false);
      return;
    } else if(values.v < 0) {
      alert("Vận tốc băng tải phải lớn hơn 0");
      setLoading(false);
      return;
    } else if(values.D < 0) {
      alert("Đường kính tang dẫn phải lớn hơn 0");
      setLoading(false);
      return;
    } else if(values.L < 0) {
      alert("Thời gian phục vụ phải lớn hơn 0");
      setLoading(false);
      return;
    } else if(values.t1 < 0) {
      alert("t1 phải lớn hơn 0");
      setLoading(false);
      return;
    } else if(values.t2 < 0) {
      alert("t2 phải lớn hơn 0");
      setLoading(false);
      return;
    } else if(values.nk !== 1) {
      alert('Hiệu suất nối trục phải bằng 1');
      setLoading(false);
      return;
    } else if((values.nol < 0.99) || (values.nol > 0.995)) {
      alert("Hiệu suất ổ lăn phải nằm trong (0.99 - 0.995)");
      setLoading(false);
      return;
    } else if((values.nbr < 0.96) || (values.nbr > 0.98)) {
      alert("Hiệu suất bánh răng phải nằm trong (0.96 - 0.98)");
      setLoading(false);
      return;
    } else if((values.nx < 0.90) || (values.nx > 0.93)) {
      alert("Hiệu suất xích phải nằm trong (0.90 - 0.93)");
      setLoading(false);
      return;
    } else if((values.uh < 8) || (values.uh > 40)) {
      alert("Tỷ số truyền hộp giảm tốc (8 - 40)");
      setLoading(false);
      return;
    } else if((values.ux < 2) || (values.ux > 5)) {
      alert("Tỷ số truyền xích (2 - 5)");
      setLoading(false);
      return;
    }

    const usb = values.ux * values.uh;

    let inputObject = {
      f: values.f,
      v: values.v,
      D: values.D,
      L: values.L,
      t1: values.t1,
      t2: values.t2,
      T1: parsedT1.raw,
      T2: parsedT2.raw,
      nk: values.nk,
      nol: values.nol,
      nbr: values.nbr,
      nx: values.nx,
      ux: values.ux,
      uh: values.uh,
      T1_numeric: parsedT1.numeric,
      T2_numeric: parsedT2.numeric,
      usb: usb
    }

    try {
      let recordID = await AsyncStorage.getItem("RECORDID")
      let response = await apiService.Chapter2InputData(inputObject, UserID, recordID);
      await AsyncStorage.setItem("RECORDID", response.record_id);
      const monitorList = response.monitor_list || [];
      await AsyncStorage.setItem('MONITOR_LIST', JSON.stringify(monitorList));
      setListMonitor(monitorList);
      router.push('/(main)/EngineSelectPage')
    } catch(error) {
      alert(error?.response?.data?.message || "Tính toán thất bại");
    } finally {
      setLoading(false); 
    }

  };

  return (
    <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0} // adjust if needed
    >
      <View style={styles.container}>
        <Text style={styles.title}>TÍNH TOÁN{'\n'}CHỌN CHI TIẾT MÁY</Text>
        <ScrollView style={styles.inputContainer}>
          <Text style={styles.inputContainerTitle}>Hãy nhập các thông số đầu vào</Text>
          <View style={styles.displayinputComponent}>
            {inputName.map((name, index) => (
              <View style={styles.inputComponent} key={index}>
                <Text style={styles.inputField}>{name}</Text>
                <TextInput 
                  style={styles.input} 
                  value={inputValues[index].toString()} 
                  onChangeText={(text) => inputFunc[index](text)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.doMathButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.doMathButtonText}>Tính toán</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default InputPage

const styles = StyleSheet.create({
  container: {

    marginTop: '14%',
  },

  title: {
    fontFamily: 'quicksand-bold',
    fontSize: 20,
    textAlign: 'center',
    padding: 10,
    color:'rgb(33,53,85)',
  },

  inputContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '90%',
    backgroundColor: '#DBE2EC',
    paddingVertical: 10,
    paddingHorizontal:20,
    borderRadius: 15,
    height: '80%',
  },
  inputContainerTitle: {
    fontFamily: 'quicksand-semibold',
    fontSize: 16,
    marginBottom: 15,
    color: 'rgb(58, 65, 99)',
    fontFamily: 'quicksand-bold',
  },
  displayinputComponent: {
    display: 'flex',
    flexDirection:'column',
  },
  inputComponent: {
    display:'flex',
    flexDirection:'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
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
    width:140,
    backgroundColor: '#F8FAFC',
  },
  doMathButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5%',
    marginHorizontal:'5%',
    padding: 10,
    backgroundColor: 'rgb(33,53,85)',
    borderRadius: 10,
    marginBottom:5
  },
  doMathButtonText: {
    color: 'white',
    fontFamily: 'quicksand-semibold',
    fontSize: 16
  }
})