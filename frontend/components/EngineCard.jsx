import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import DisplayResult from './DisplayResult'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const EngineCard = (props) => {
  const {kieu_dong_co, cong_suat, van_toc_vong_quay, onSelect, isSelected, isMostSuggested} = props;
  return (
    <View style={styles.engineBlock}>
      {isMostSuggested && (
        <View style={styles.badgeMostSuggested}>
          <Text style={styles.badgeText}>TOP RECOMMENDATION</Text>
        </View>
      )}
      <DisplayResult variable={"Kiểu động cơ"} value={kieu_dong_co} unit={""}/>
      <DisplayResult variable={"Công suất"} value={cong_suat} unit={"kW"}/>
      <DisplayResult variable={"Vận tốc quay"} value={van_toc_vong_quay} unit={"vg/ph"}/>
      <View style={styles.choiceButton}>
        <TouchableOpacity onPress={onSelect}>
            {isSelected ? <FontAwesome6 name="check" size={24} color="rgb(33,53,85)"/> : <Text style={styles.choiceText}>Chọn</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default EngineCard

const styles = StyleSheet.create({
  engineBlock: {
    padding:'4%',
    backgroundColor:'#DBE2EC',
    marginHorizontal: '6%',
    marginVertical:'2%',
    borderRadius:10,
  },
  choiceButton: {
    display:'flex',
    alignItems:'flex-end',
    marginTop:'1%'
  },
  choiceText: {
    backgroundColor:'rgb(33,53,85)',
    fontFamily:'quicksand',
    color:'white',
    padding: 4,
    fontSize: 12,
    borderRadius:10,
    width:50,
    textAlign:'center',
  },
  badgeMostSuggested: {
    backgroundColor: 'transparent',
    borderLeftWidth: 4,
    borderLeftColor: '#C0A080',
    borderRightWidth: 4,
    borderRightColor: '#C0A080',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  badgeText: {
    
    fontFamily: 'quicksand-bold',
    fontSize: 11,
    color: '#C0A080',
    letterSpacing: 0.5,
  },
})