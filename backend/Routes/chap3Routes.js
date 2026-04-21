const express = require('express')
const MachineCalculatorFactory = require('../MachineCalculator');
const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '../config.env' });

let Chapter3Routes = express.Router();
const Chapter3Function = MachineCalculatorFactory.getChapter("Chapter3");

Chapter3Routes.route('/chapter3/:recordid').get(async (request, response) => {
  const supabase = request.db
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', record_id.id);

    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    // Lấy data từ bảng Chapter2
    const { data: chapter2Data, error: chapter2DataError } = await supabase.from('Chapter2').select('*').eq('id', recordData[0].chapter2_id);

    if(chapter2DataError) {
      console.error("chapter2DataError", chapter2DataError)
      return response.status(400).json({ message: chapter2DataError.message });
    }

    return response.status(200).json({ message: 'Predata chapter 3', chapter2Data: chapter2Data[0] });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
}) 

Chapter3Routes.route('/chapter3/calculation/:recordid').post(async (request, response) => {
  const supabase = request.db
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', record_id.id);

    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    // Lấy data từ bảng Chapter2
    const { data: chapter2Data, error: chapter2DataError } = await supabase.from('Chapter2').select('*').eq('id', recordData[0].chapter2_id);
    if(chapter2DataError) {
      console.error("chapter2DataError", chapter2DataError)
      return response.status(400).json({ message: chapter2DataError.message });
    }

    // Tính toán hệ số an toàn
    const Chapter3InputData1 = Chapter3FirstCalculation(chapter2Data[0], request.body);
    if (Chapter3InputData1.error) {
      return response.status(200).json({
        message: 'Tính toán dừng lại vì dữ liệu không hợp lệ',
        reason: Chapter3InputData1.reason,
        safetyResult: false
      });
    }
    const safetyCheck = getSafetyFactor(Chapter3InputData1.buoc_xich, Chapter3InputData1.n01);
    let safetyResult = false;
    if(safetyCheck < Chapter3InputData1.he_so_an_toan) {
      safetyResult = true;
    }

    // Trả về nếu safetyCheck là false
    if(!safetyResult) {
      return response.status(200).json({ message: 'Đã kiểm tra an toàn xong', safetyResult: safetyResult });
    }

    // Tính toán phần còn lại nếu safetyCheck là true
    const Chapter3InputData2 = Chapter3SecondCalculation(chapter2Data[0], Chapter3InputData1)
    const Chapter3InputData = {
      ...Chapter3InputData1,
      ...Chapter3InputData2
    }

    if(recordData[0].chapter3_id) {
      // Cập nhật dữ liệu chương 3
      const {data: insertChapter3, error: insertChapter3Error } = await supabase.from('Chapter3').update(Chapter3InputData).eq('id',recordData[0].chapter3_id)
      if(insertChapter3Error) {
        console.error("insertChapter3Error", insertChapter3Error)
        return response.status(400).json({ message: insertChapter3Error.message });
      }
    } else {
      const Chapter3Id = uuidv4();
      const Chapter3InputDataWithId = {
        id: Chapter3Id,
        ...Chapter3InputData
      }

      // Thêm dữ liệu ban đầu chương 3
      const {data: insertChapter3, error: insertChapter3Error } = await supabase.from('Chapter3').insert([Chapter3InputDataWithId])
      if(insertChapter3Error) {
        console.error("insertChapter3Error", insertChapter3Error)
        return response.status(400).json({ message: insertChapter3Error.message });
      }

      // Cập nhật khoá chương 3 trong HistoryRecord
      const { data: insertChapter3ID, error: insertChapter3IDError } = await supabase.from('HistoryRecord').update({chapter3_id: Chapter3Id}).eq('id', record_id.id)
      if(insertChapter3IDError) {
        console.error("insertChapter3IDError", insertChapter3IDError)
        return response.status(400).json({ message: insertChapter3IDError.message });
      }
    }

    return response.status(200).json({ message: 'Đã tính toán xong chương 3', safetyResult: safetyResult, chapter3Data: Chapter3InputData });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
}) 

const safetyFactorTable = {
  "12.7-15.875": [7, 7.8, 8.5, 9.3, 10.2, 11, 11.7, 13.2, 14.8, 16.3, 18],
  "19.05-25.4":  [7, 8.2, 9.3, 10.3, 11.7, 12.9, 14, 16.3, null, null, null],
  "31.75-38.1":  [7, 8.5, 10.2, 13.2, 14.8, 16.3, 19.5, null, null, null, null],
  "44.45-50.8":  [7, 9.3, 11.7, 14, 16.3, null, null, null, null, null, null]
};
const speedSteps = [50, 200, 400, 600, 800, 1000, 1200, 1600, 2000, 2400, 2800];

function getSafetyFactor(p, n1) {
  let rangeKey;
  if (p <= 15.875) rangeKey = "12.7-15.875";
  else if (p <= 25.4) rangeKey = "19.05-25.4";
  else if (p <= 38.1) rangeKey = "31.75-38.1";
  else if (p <= 50.8) rangeKey = "44.45-50.8";
  else return null;
  const nIndex = speedSteps.findIndex((speed) => n1 <= speed);
  if (nIndex === -1) return null;
  const value = safetyFactorTable[rangeKey][nIndex];
  return value ?? null;
}

function Chapter3FirstCalculation(Chapter2Data, Chapter3Input) {
  const z1 = Chapter3Function.Z1(Chapter2Data.he_so_truyen_dong_xich);
  const z2 = Chapter3Function.Z2(Chapter2Data.he_so_truyen_dong_xich, z1);
  const z1_round = Math.round(z1);
  const kz = Chapter3Function.kz(Chapter3Input.z01, z1_round);
  const kn = Chapter3Function.kn(Chapter3Input.n01, Chapter2Data.n3);
  const k = Chapter3Function.k(Chapter3Input.k0, Chapter3Input.ka, Chapter3Input.kdc, Chapter3Input.kbt, Chapter3Input.kd, Chapter3Input.kc);
  const cong_suat_tinh_toan = Chapter3Function.cong_suat_tinh_toan(Chapter2Data.p3, k, kz, kn);

  // cong suat cho phep ko the tinh dc neu n01 va cong suat tinh toan vuot qua bang tra
  const cong_suat_cho_phep = Chapter3Function.cong_suat_cho_phep(Chapter3Input.n01, cong_suat_tinh_toan);
  if(cong_suat_cho_phep === undefined) {
    return { error: true, reason: 'cong_suat_cho_phep undefined' };
  }

  const buoc_xich = Chapter3Function.buoc_xich(Chapter3Input.n01, cong_suat_cho_phep);
  const khoang_cach_truc = Chapter3Function.khoang_cach_truc(buoc_xich);
  const so_mat_xich = Chapter3Function.so_mat_xich(khoang_cach_truc, buoc_xich, Chapter3Input.z01, z2);
  const tinh_lai_khoang_cach_truc = Chapter3Function.tinh_lai_khoang_cach_truc(buoc_xich, so_mat_xich, Chapter3Input.z01, z2);
  const delta_a = Chapter3Function.delta_a(Chapter3Input.Da, tinh_lai_khoang_cach_truc);
  const a = Chapter3Function.a(tinh_lai_khoang_cach_truc, delta_a);
  const so_lan_va_dap_cua_xich = Chapter3Function.so_lan_va_dap_cua_xich(z1_round, Chapter2Data.n3, so_mat_xich);
  const tai_trong_pha_hong = Chapter3Function.tai_trong_pha_hong(buoc_xich);
  const q = Chapter3Function.khoi_luong_1m_xich(buoc_xich);
  const v = Chapter3Function.v(z1_round, buoc_xich, Chapter2Data.n3);
  const ft = Chapter3Function.Ft(Chapter2Data.p3, v);
  const fv = Chapter3Function.Fv(q, v);
  const F0 = Chapter3Function.F0(Chapter3Input.kf, q, a);
  const s = Chapter3Function.he_so_an_toan(tai_trong_pha_hong, Chapter3Input.kd, ft, F0, fv);

  return {
    k0: Chapter3Input.k0,
    ka: Chapter3Input.ka,
    kdc: Chapter3Input.kdc,
    kc: Chapter3Input.kc,
    kd: Chapter3Input.kd,
    kbt: Chapter3Input.kbt,
    z01: Chapter3Input.z01,
    kf: Chapter3Input.kf,
    n01: Chapter3Input.n01,
    da: Chapter3Input.Da,
    z1: z1_round,
    z2: z2,
    kz: kz,
    kn: kn,
    k: k,
    cong_suat_tinh_toan: cong_suat_tinh_toan,
    cong_suat_cho_phep: cong_suat_cho_phep,
    buoc_xich: buoc_xich,
    khoang_cach_truc: khoang_cach_truc,
    so_mat_xich: so_mat_xich,
    tinh_lai_khoang_cach_truc: tinh_lai_khoang_cach_truc,
    delta_a: delta_a,
    a: a,
    so_lan_va_dap_cua_xich: so_lan_va_dap_cua_xich,
    tai_trong_pha_hong: tai_trong_pha_hong,
    q: q,
    v: v,
    ft: ft,
    fv: fv,
    f0: F0,
    he_so_an_toan: s
  }
}

function Chapter3SecondCalculation(Chapter2Data, Chapter3Data) {
  const d1 = Chapter3Function.d1(Chapter3Data.buoc_xich, Chapter3Data.z01);
  const d2 = Chapter3Function.d2(Chapter3Data.buoc_xich, Chapter3Data.z2);
  const da1 = Chapter3Function.da1(Chapter3Data.buoc_xich, Chapter3Data.z01);
  const da2 = Chapter3Function.da2(Chapter3Data.buoc_xich, Chapter3Data.z2);
  const d1_chon_bang = Chapter3Function.d1_chon_bang(Chapter3Data.buoc_xich);
  const r = Chapter3Function.r(d1_chon_bang);
  const df1 = Chapter3Function.df1(d1, r);
  const df2 = Chapter3Function.df2(d2, r);
  const kr1 = Chapter3Function.kr(Chapter3Data.z1);
  const kr2 = Chapter3Function.kr(Chapter3Data.z2);
  const fvd = Chapter3Function.Fvd(Chapter2Data.n3, Chapter3Data.buoc_xich);
  const module_dan_hoi = 210000;
  const a_dt = Chapter3Function.A_dt(Chapter3Data.buoc_xich);
  const Fr = Chapter3Function.Fr(Chapter3Data.ft);
  const oH1 = Chapter3Function.oH1(kr1, Chapter3Data.kd, Chapter3Data.ft, fvd, a_dt);
  const oH2 = Chapter3Function.oH2(kr2, Chapter3Data.kd, Chapter3Data.ft, fvd, a_dt);

  return {
    d1: d1,
    d2: d2,
    da1: da1,
    da2: da2,
    d1_chon_bang: d1_chon_bang,
    r: r,
    df1: df1,
    df2: df2,
    kr1: kr1,
    kr2: kr2,
    fvd: fvd,
    module_dan_hoi: module_dan_hoi,
    a_dt: a_dt,
    fr: Fr,
    oh1: oH1,
    oh2: oH2
  }
}

module.exports = Chapter3Routes;