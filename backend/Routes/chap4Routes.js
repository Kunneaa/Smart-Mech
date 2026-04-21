const express = require('express')
const MachineCalculatorFactory = require('../MachineCalculator');
const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../config.env' });

let Chapter4Routes = express.Router();
const Chapter4Function = MachineCalculatorFactory.getChapter("Chapter4");

Chapter4Routes.route('/chapter4/:recordid').get(async (request, response) => {
  const supabase = request.db;
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try { 
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', record_id.id);

    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    // Lấy data từ bảng Chapter3
    const { data: chapter3Data, error: chapter3DataError } = await supabase.from('Chapter3').select('v, z1, z2, oh1, oh2').eq('id', recordData[0].chapter3_id);
    if(chapter3DataError) {
      console.error("chapter3DataError", chapter3DataError)
      return response.status(400).json({ message: chapter3DataError.message });
    }

    const material = SelectMaterial(chapter3Data[0].v, chapter3Data[0].z1, chapter3Data[0].z2, chapter3Data[0].oh1, chapter3Data[0].oh2);

    return response.status(200).json({ message: 'Predata Chapter 4', material: material})
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

Chapter4Routes.route('/chapter4/calculation/:recordid').post(async (request, response) => {
  const supabase = request.db;
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', record_id.id);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    // Lấy data từ bảng Chapter2
    const { data: Chapter2Data, error: Chapter2DataError } = await supabase.from('Chapter2').select('*').eq('id', recordData[0].chapter2_id);
    if(Chapter2DataError) {
      console.error("Chapter2DataError", Chapter2DataError)
      return response.status(400).json({ message: Chapter2DataError.message });
    }

    // Lấy data từ bảng Chapter3
    const { data: Chapter3Data, error: Chapter3DataError } = await supabase.from('Chapter3').select('*').eq('id', recordData[0].chapter3_id);
    if(Chapter3DataError) {
      console.error("Chapter3DataError", Chapter3DataError)
      return response.status(400).json({ message: Chapter3DataError.message });
    }

    const Chapter4InputData = UngSuatChoPhep(request.body, Chapter2Data[0]);
    const TinhToanNhanh = TinhToanCapNhanhCoBan(Chapter4InputData, Chapter2Data[0]);
    const TinhToanCham = TinhToanCapChamCoBan(Chapter4InputData, Chapter2Data[0]);

    if(recordData[0].chapter4_id) {
      // Lấy data từ bảng Chapter4
      const { data: Chapter4Data, error: Chapter4DataError } = await supabase.from('Chapter4').select('tinhtoannhanh_id, tinhtoancham_id').eq('id', recordData[0].chapter4_id);
      if(Chapter4DataError) {
        console.error("Chapter4DataError", Chapter4DataError)
        return response.status(400).json({ message: Chapter4DataError.message });
      }

      // Cập nhật dữ liệu chương 4
      const {data: insertChapter4, error: InsertChapter4Error } = await supabase.from('Chapter4').update(Chapter4InputData).eq('id',recordData[0].chapter4_id)
      if(InsertChapter4Error) {
        console.error("InsertChapter4Error", InsertChapter4Error)
        return response.status(400).json({ message: InsertChapter4Error.message });
      }

      // Cập nhật dữ liệu bảng tính toán nhanh
      const {data: insertTinhToanNhanh, error: InsertTinhToanNhanhError } = await supabase.from('TinhToanNhanh').update(TinhToanNhanh).eq('id',Chapter4Data[0].tinhtoannhanh_id)
      if(InsertTinhToanNhanhError) {
        console.error("InsertTinhToanNhanhError", InsertTinhToanNhanhError)
        return response.status(400).json({ message: InsertTinhToanNhanhError.message });
      }

      // Cập nhật dữ liệu bảng tính toán chậm
      const {data: insertTinhToanCham, error: InsertTinhToanChamError } = await supabase.from('TinhToanCham').update(TinhToanCham).eq('id',Chapter4Data[0].tinhtoancham_id)
      if(InsertTinhToanChamError) {
        console.error("InsertTinhToanChamError", InsertTinhToanChamError)
        return response.status(400).json({ message: InsertTinhToanChamError.message });
      }
    } else {
      // Tạo dữ liệu cho bảng tính toán cấp nhanh
      const CapNhanhId = uuidv4();
      const TinhToanCapNhanhWithId = {
        id: CapNhanhId,
        ...TinhToanNhanh
      }

      // Thêm dữ liệu ban đầu cho bảng Tính toán nhanh
      const {data: insertTinhToanNhanh, error: InsertTinhToanNhanhError } = await supabase.from('TinhToanNhanh').insert([TinhToanCapNhanhWithId])
      if(InsertTinhToanNhanhError) {
        console.error("InsertTinhToanNhanhError", InsertTinhToanNhanhError)
        return response.status(400).json({ message: InsertTinhToanNhanhError.message });
      }

      // Tạo dữ liệu cho bảng tính toán cấp chậm
      const CapChamId = uuidv4();
      const TinhToanCapChamWithId = {
        id: CapChamId,
        ...TinhToanCham
      }

      // Thêm dữ liệu ban đầu cho bảng Tính toán chậm
      const {data: insertTinhToanCham, error: InsertTinhToanChamError } = await supabase.from('TinhToanCham').insert([TinhToanCapChamWithId])
      if(InsertTinhToanChamError) {
        console.error("InsertTinhToanChamError", InsertTinhToanChamError)
        return response.status(400).json({ message: InsertTinhToanChamError.message });
      }

      // Tạo dữ liệu chương 4
      const Chapter4Id = uuidv4();
      const Chapter4InputDataWithId = {
        id: Chapter4Id,
        tinhtoannhanh_id: CapNhanhId,
        tinhtoancham_id: CapChamId,
        ...Chapter4InputData
      }

      // Thêm dữ liệu ban đầu chương 4
      const {data: insertChapter4, error: InsertChapter4Error } = await supabase.from('Chapter4').insert([Chapter4InputDataWithId])
      if(InsertChapter4Error) {
        console.error("InsertChapter4Error", InsertChapter4Error)
        return response.status(400).json({ message: InsertChapter4Error.message });
      }

      // Cập nhật khoá chương 4 trong HistoryRecord
      const { data: insertChapter4ID, error: InsertChapter4IDError } = await supabase.from('HistoryRecord').update({chapter4_id: Chapter4Id}).eq('id', record_id.id)
      if(InsertChapter4IDError) {
        console.error("InsertChapter4IDError", InsertChapter4IDError)
        return response.status(400).json({ message: InsertChapter4IDError.message });
      }

    }
    
    return response.status(200).json({ 
      ASoBoCham: TinhToanCham.aw1_so_bo, 
      ASoBoNhanh: TinhToanNhanh.aw1_so_bo,
      message: 'Đã tính toán xong chương 4',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

Chapter4Routes.route('/chapter4/secondcalculation/:recordid').post(async (request, response) => {
  const supabase = request.db;
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', record_id.id);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    // Lấy data từ bảng Chapter2
    const { data: Chapter2Data, error: Chapter2DataError } = await supabase.from('Chapter2').select('*').eq('id', recordData[0].chapter2_id);
    if(Chapter2DataError) {
      console.error("Chapter2DataError", Chapter2DataError)
      return response.status(400).json({ message: Chapter2DataError.message });
    }

    // Lấy data từ bảng Chapter3
    const { data: Chapter3Data, error: Chapter3DataError } = await supabase.from('Chapter3').select('*').eq('id', recordData[0].chapter3_id);
    if(Chapter3DataError) {
      console.error("Chapter3DataError", Chapter3DataError)
      return response.status(400).json({ message: Chapter3DataError.message });
    }

    // Lấy data từ bảng Chapter4
    const { data: Chapter4Data, error: Chapter4DataError } = await supabase.from('Chapter4').select('*').eq('id', recordData[0].chapter4_id);
    if(Chapter4DataError) {
      console.error("Chapter4DataError", Chapter4DataError)
      return response.status(400).json({ message: Chapter4DataError.message });
    }

    // Lấy data từ bảng tính toán nhanh
    const { data: TinhToanNhanhData, error: TinhToanNhanhDataError } = await supabase.from('TinhToanNhanh').select('*').eq('id', Chapter4Data[0].tinhtoannhanh_id);
    if(TinhToanNhanhDataError) {
      console.error("TinhToanNhanhDataError", TinhToanNhanhDataError)
      return response.status(400).json({ message: TinhToanNhanhDataError.message });
    }

    // Lấy data từ bảng tính toán chậm
    const { data: TinhToanChamData, error: TinhToanChamDataError } = await supabase.from('TinhToanCham').select('*').eq('id', Chapter4Data[0].tinhtoancham_id);
    if(TinhToanChamDataError) {
      console.error("TinhToanChamDataError", TinhToanChamDataError)
      return response.status(400).json({ message: TinhToanChamDataError.message });
    }

    const TinhToanNhanh = TinhToanCapNhanhLanHai(request.body, Chapter2Data[0], Chapter4Data[0]);
    const TinhToanCham = TinhToanCapChamLanHai(request.body, Chapter2Data[0], Chapter4Data[0]);

    const TinhToanNhanhTongHop1 = {
      ...TinhToanNhanhData[0],
      ...TinhToanNhanh,
    }

    const TinhToanChamTongHop1 = {
      ...TinhToanChamData[0],
      ...TinhToanCham,
    }

    const KichThuocNhanh = KichThuocBoTruyenNhanh(TinhToanNhanhTongHop1)
    const KichThuocCham = KichThuocBoTruyenCham(TinhToanChamTongHop1)

    const TinhToanNhanhTongHop2 = {
      ...TinhToanNhanhTongHop1,
      ...KichThuocNhanh
    }
    const TinhToanChamTongHop2 = {
      ...TinhToanChamTongHop1,
      ...KichThuocCham,
    }

    const KiemNghiemRangDoBenTiepXucCapNhanh = KiemNghiemRangVeDoBenTiepXucCapNhanh (TinhToanNhanhTongHop2, Chapter2Data[0], Chapter3Data[0], Chapter4Data[0])
    const KiemNghiemRangDoBenTiepXucCapCham = KiemNghiemRangVeDoBenTiepXucCapCham (TinhToanChamTongHop2, Chapter2Data[0], Chapter3Data[0], Chapter4Data[0])

    const TinhToanNhanhInputData = {
      khoangCachNghieng: TinhToanNhanhTongHop2.khoangCachNghieng,
      z1: TinhToanNhanhTongHop2.z1,
      z2: TinhToanNhanhTongHop2.z2,
      duong_kinh_dinh_rang_da1: TinhToanNhanhTongHop2.duong_kinh_dinh_rang_da1,
      duong_kinh_dinh_rang_da2: TinhToanNhanhTongHop2.duong_kinh_dinh_rang_da2,
      duong_kinh_chia_d1: TinhToanNhanhTongHop2.duong_kinh_chia_d1,
      duong_kinh_chia_d2: TinhToanNhanhTongHop2.duong_kinh_chia_d2,
      duong_kinh_lan_dw1: TinhToanNhanhTongHop2.duong_kinh_lan_dw1,
      duong_kinh_lan_dw2: TinhToanNhanhTongHop2.duong_kinh_lan_dw2,
      duong_kinh_co_so_db1: TinhToanNhanhTongHop2.duong_kinh_co_so_db1,
      duong_kinh_co_so_db2: TinhToanNhanhTongHop2.duong_kinh_co_so_db2,
      duong_kinh_day_rang_df1: TinhToanNhanhTongHop2.duong_kinh_day_rang_df1,
      duong_kinh_day_rang_df2: TinhToanNhanhTongHop2.duong_kinh_day_rang_df2,
    }

    const TinhToanChamInputData = {
      khoangCachThang: TinhToanChamTongHop2.khoangCachThang,
      z1: TinhToanChamTongHop2.z1,
      z2: TinhToanChamTongHop2.z2,
      duong_kinh_dinh_rang_da1: TinhToanChamTongHop2.duong_kinh_dinh_rang_da1,
      duong_kinh_dinh_rang_da2: TinhToanChamTongHop2.duong_kinh_dinh_rang_da2,
      duong_kinh_chia_d1: TinhToanChamTongHop2.duong_kinh_chia_d1,
      duong_kinh_chia_d2: TinhToanChamTongHop2.duong_kinh_chia_d2,
      duong_kinh_lan_dw1: TinhToanChamTongHop2.duong_kinh_lan_dw1,
      duong_kinh_lan_dw2: TinhToanChamTongHop2.duong_kinh_lan_dw2,
      duong_kinh_co_so_db1: TinhToanChamTongHop2.duong_kinh_co_so_db1,
      duong_kinh_co_so_db2: TinhToanChamTongHop2.duong_kinh_co_so_db2,
      duong_kinh_day_rang_df1: TinhToanChamTongHop2.duong_kinh_day_rang_df1,
      duong_kinh_day_rang_df2: TinhToanChamTongHop2.duong_kinh_day_rang_df2,
    }

    // // Cập nhật dữ liệu bảng tính toán nhanh
    const {data: insertTinhToanNhanh, error: InsertTinhToanNhanhError } = await supabase.from('TinhToanNhanh').update(TinhToanNhanhInputData).eq('id',Chapter4Data[0].tinhtoannhanh_id)
    if(InsertTinhToanNhanhError) {
      console.error("InsertTinhToanNhanhError", InsertTinhToanNhanhError)
      return response.status(400).json({ message: InsertTinhToanNhanhError.message });
    }

    // // Cập nhật dữ liệu bảng tính toán chậm
    const {data: insertTinhToanCham, error: InsertTinhToanChamError } = await supabase.from('TinhToanCham').update(TinhToanChamInputData).eq('id',Chapter4Data[0].tinhtoancham_id)
    if(InsertTinhToanChamError) {
      console.error("InsertTinhToanChamError", InsertTinhToanChamError)
      return response.status(400).json({ message: InsertTinhToanChamError.message });
    }

    return response.status(200).json({ 
      cham: {
        khoangCach: TinhToanChamTongHop2.khoangCachThang,
        z1: TinhToanChamTongHop2.z1,
        z2: TinhToanChamTongHop2.z2,
        duong_kinh_dinh_rang_da1: TinhToanChamTongHop2.duong_kinh_dinh_rang_da1,
        duong_kinh_dinh_rang_da2: TinhToanChamTongHop2.duong_kinh_dinh_rang_da2,
      },
      nhanh: {
        khoangCach: TinhToanNhanhTongHop2.khoangCachNghieng,
        z1: TinhToanNhanhTongHop2.z1,
        z2: TinhToanNhanhTongHop2.z2,
        duong_kinh_dinh_rang_da1: TinhToanNhanhTongHop2.duong_kinh_dinh_rang_da1,
        duong_kinh_dinh_rang_da2: TinhToanNhanhTongHop2.duong_kinh_dinh_rang_da2,
      },
      message: 'Đã tính toán xong chương 4',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

const SelectMaterial = (v, z1, z2, oh1, oh2) => {
  if(z1 <= 19 && z2 <= 19) {
    return 4; // Thep 15 Tham cacbon, toi, ram
  } else if(z1 < 40 && z2 < 40) {
    return 3; // Thep 45 Toi, ram
  } else {
    const diff1 = 500 - oh1; 
    const diff2 = 550 - oh2; 
    if(diff1 < diff2) {
      return 2; // Thep 45 toi cai thien
    } 
  }
  return 1; // Gang xam
}

function UngSuatChoPhep(Chapter4Input, Chapter2Data) {
  const Lg = Chapter4Function.ThoiGianPhucVu(Chapter2Data.thoi_gian_phuc_vu);
  const SHlim1 = Chapter4Function.UngSuatTiepXucChoPhep(Chapter4Input.HB1);
  const SHlim2 = Chapter4Function.UngSuatTiepXucChoPhep(Chapter4Input.HB2);
  const Flim1 = Chapter4Function.UngSuatUonChoPhepBd(Chapter4Input.HB1);
  const Flim2 = Chapter4Function.UngSuatUonChoPhepBd(Chapter4Input.HB2);
  const KFC = 1;
  const KHL1 = 1
  const KHL2 = 1;
  const KFL1 = 1;
  const KFL2 = 1;
  const SH1 = 1.1;
  const SF1 = 1.75;
  const SH2 = 1.1;
  const SF2 = 1.75;
  const NHO1 = Chapter4Function.SoCKThayDoiUsKhiThuTiepXuc(Chapter4Input.HB1);
  const NHO2 = Chapter4Function.SoCKThayDoiUsKhiThuTiepXuc(Chapter4Input.HB2);
  const NFO1 = 4000000;
  const NFO2 = 4000000;
  const NHE1 = Chapter4Function.NHE1(Chapter4Input.c, Lg, Chapter2Data.n1, Chapter2Data.t1_t, Chapter2Data.t2_t, Chapter2Data.t1, Chapter2Data.t2);
  const NHE2 = Chapter4Function.NHE2(NHE1, Chapter2Data.he_so_truyen_cap_nhanh);
  const mF = 6;
  const NFE1 = Chapter4Function.NFE1(Chapter4Input.c, Lg, Chapter2Data.n1, Chapter2Data.t1_t, Chapter2Data.t2_t, Chapter2Data.t1, Chapter2Data.t2, mF);
  const NFE2 = Chapter4Function.NFE2(NFE1, Chapter2Data.he_so_truyen_cap_nhanh);
  const o_H1 = Chapter4Function.UngSuatTiepXuc_O_H(SHlim1,KHL1, SH1);
  const o_H2 = Chapter4Function.UngSuatTiepXuc_O_H(SHlim2,KHL2, SH2);
  const o_F1 = Chapter4Function.UngSuatUon_O_F(Flim1,KFC,KFL1, SF1);
  const o_F2 = Chapter4Function.UngSuatUon_O_F(Flim2,KFC,KFL2, SF2);
  const o_H = Chapter4Function.UngSuatTiepXucChoPhepCapNhanh(o_H1,o_H2);
  const o_H_phay = o_H2;
  const o_H_max = Chapter4Function.UngSuatTiepXucQuaTaiChoPhep(Chapter4Input.Sch2);
  const o_F1_max = Chapter4Function.UngSuatUonQuaTaiChoPhep(Chapter4Input.Sch1);
  const o_F2_max = Chapter4Function.UngSuatUonQuaTaiChoPhep(Chapter4Input.Sch2);

  return {
    Sb1: Chapter4Input.Sb1,
    Sch1: Chapter4Input.Sch1,
    HB1: Chapter4Input.HB1,
    Sb2: Chapter4Input.Sb2,
    Sch2: Chapter4Input.Sch2,
    HB2: Chapter4Input.HB2,
    c: Chapter4Input.c,
    thoi_gian_phuc_vu_Lg: Lg,
    SHlim1: SHlim1,
    SHlim2: SHlim2,
    SH1: SH1,
    SH2: SH2,
    Flim1: Flim1,
    Flim2: Flim2,
    SF1: SF1,
    SF2: SF2,
    NHO1: NHO1,
    NHO2: NHO2,
    NFO1: NFO1,
    NFO2: NFO2,
    NHE1: NHE1,
    NHE2: NHE2,
    NFE1: NFE1,
    NFE2: NFE2,
    KFC:KFC,
    KHL1: KHL1,
    KHL2: KHL2,
    KFL1: KFL1,
    KFL2:KFL2,
    mf:mF,
    o_H1: o_H1, 
    o_H2: o_H2,
    o_F1: o_F1,
    o_F2: o_F2,
    o_H: o_H,
    o_H_phay: o_H_phay,
    o_H_max: o_H_max,
    o_F1_max: o_F1_max,
    o_F2_max: o_F2_max,
  }
}

function TinhToanCapNhanhCoBan(Chapter4Data, Chapter2Data) {
  const Ka_cap_nhanh = 43;
  const y_ba = 0.3
  const y_bd = Chapter4Function.Y_bd(y_ba, Chapter2Data.he_so_truyen_cap_nhanh);
  const KHB_cap_nhanh = Chapter4Function.KHB_cap_nhanh(y_bd);
  const aw1_so_bo = Chapter4Function.aw1_so_bo(Ka_cap_nhanh, Chapter2Data.he_so_truyen_cap_nhanh, Chapter2Data.t1_ti_so_truyen, KHB_cap_nhanh, Chapter4Data.o_H, y_ba);

  return {
    Ka_cap_nhanh: Ka_cap_nhanh,
    y_ba: y_ba,
    y_bd: y_bd,
    KHB_cap_nhanh: KHB_cap_nhanh,
    aw1_so_bo: aw1_so_bo,
  }
}

function TinhToanCapChamCoBan(Chapter4Data, Chapter2Data) {
  const Ka_cap_cham = 49.5;
  const y_ba = 0.3;
  const y_ba_cap_cham = Chapter4Function.Y_ba_cap_cham(y_ba);
  const y_bd = Chapter4Function.Y_bd(y_ba_cap_cham, Chapter2Data.he_so_truyen_cap_cham);
  const KHB_cap_cham = Chapter4Function.KHB_cap_cham(y_bd);
  const aw1_so_bo = Chapter4Function.aw1_so_bo(Ka_cap_cham, Chapter2Data.he_so_truyen_cap_cham, Chapter2Data.t2_ti_so_truyen, KHB_cap_cham, Chapter4Data.o_H_phay, y_ba_cap_cham);
  return {
    Ka_cap_cham: Ka_cap_cham,
    y_ba_cap_cham: y_ba_cap_cham,
    y_bd: y_bd,
    KHB_cap_cham: KHB_cap_cham,
    aw1_so_bo: aw1_so_bo
  }
}

function TinhToanCapNhanhLanHai(Chapter4Input, Chapter2Data, Chapter4Data) {
  const module_1 = Chapter4Function.module_1(Chapter4Input.khoangCachNghieng);
  const module_2 = Chapter4Function.module_2(Chapter4Input.khoangCachNghieng);
  const z1 = Chapter4Function.z1(40, Chapter4Input.khoangCachNghieng, Chapter4Input.mNghieng, Chapter2Data.he_so_truyen_cap_nhanh);
  const z2 = Chapter4Function.z2(Chapter2Data.he_so_truyen_cap_nhanh, z1);
  const cos_goc_B = Chapter4Function.cos_goc_B(z1, z2,Chapter4Input.khoangCachNghieng, Chapter4Input.mNghieng);
  const goc_B = Chapter4Function.tinh_goc_B(z1, z2,Chapter4Input.khoangCachNghieng, Chapter4Input.mNghieng);
  const u_m = Chapter4Function. ti_so_thuc (z1, z2);
  return {
    mNghieng: Chapter4Input.mNghieng,
    khoangCachNghieng: Chapter4Input.khoangCachNghieng,
    module_1: module_1,
    module_2: module_2,
    z1: z1,
    z2: z2,
    cos_goc_B: cos_goc_B,
    goc_B: goc_B,
    u_m: u_m
  }
}

function TinhToanCapChamLanHai(Chapter4Input, Chapter2Data, Chapter4Data) {
  const module_1 = Chapter4Function.module_1(Chapter4Input.khoangCachThang);
  const module_2 = Chapter4Function.module_2(Chapter4Input.khoangCachThang);
  const z1 = Chapter4Function.z1(0, Chapter4Input.khoangCachThang, Chapter4Input.mThang, Chapter2Data.he_so_truyen_cap_cham);
  const z2 = Chapter4Function.z2(Chapter2Data.he_so_truyen_cap_cham, z1);
  const cos_goc_B = 1;
  const goc_B = 0;
  const u_m = Chapter4Function.ti_so_thuc (z1, z2);
  return {
    mThang: Chapter4Input.mThang,
    khoangCachThang: Chapter4Input.khoangCachThang,
    module_1: module_1,
    module_2: module_2,
    z1: z1,
    z2: z2,
    cos_goc_B: cos_goc_B,
    goc_B: goc_B,
    u_m: u_m
  }
}

function KichThuocBoTruyenNhanh(TinhToanNhanh) {
  const dich_chinh_y = 0; 
  const khoang_cach_truc_chia_a = Chapter4Function.KhoangCachTrucChia(TinhToanNhanh.mNghieng,TinhToanNhanh.z1, TinhToanNhanh.z2, TinhToanNhanh.cos_goc_B);
  const chieu_rong_vanh_rang_bw = Chapter4Function.ChieuRongVanhRang(TinhToanNhanh.y_ba, TinhToanNhanh.khoangCachNghieng);
  
  const duong_kinh_chia_d1 = Chapter4Function.d1(TinhToanNhanh.mNghieng, TinhToanNhanh.z1, TinhToanNhanh.cos_goc_B);
  const duong_kinh_chia_d2 = Chapter4Function.d1(TinhToanNhanh.mNghieng, TinhToanNhanh.z2, TinhToanNhanh.cos_goc_B);
  const duong_kinh_lan_dw1 = Chapter4Function.dw(duong_kinh_chia_d1, dich_chinh_y, TinhToanNhanh.z1, TinhToanNhanh.z2);
  const duong_kinh_lan_dw2 = Chapter4Function.dw(duong_kinh_chia_d2, dich_chinh_y, TinhToanNhanh.z1, TinhToanNhanh.z2);
  const duong_kinh_dinh_rang_da1 = Chapter4Function.DuongKinhDinhRang(duong_kinh_chia_d1, TinhToanNhanh.mNghieng);
  const duong_kinh_dinh_rang_da2 = Chapter4Function.DuongKinhDinhRang(duong_kinh_chia_d2, TinhToanNhanh.mNghieng);
  const alpha = 20;
  const duong_kinh_co_so_db1 = Chapter4Function.DuongKinhCoSo(duong_kinh_chia_d1, alpha);
  const duong_kinh_co_so_db2 = Chapter4Function.DuongKinhCoSo(duong_kinh_chia_d2,alpha);
  const duong_kinh_day_rang_df1 = Chapter4Function.DuongKinhDayRang(duong_kinh_chia_d1, TinhToanNhanh.mNghieng);
  const duong_kinh_day_rang_df2 = Chapter4Function.DuongKinhDayRang(duong_kinh_chia_d2, TinhToanNhanh.mNghieng);
  const profin_goc = alpha;
  const goc_profin_rang = Chapter4Function.GocProfinRang(profin_goc, TinhToanNhanh.cos_goc_B)
  const goc_an_khop = Chapter4Function.GocAnKhop(khoang_cach_truc_chia_a, goc_profin_rang, TinhToanNhanh.khoangCachNghieng)
  

  return {
    dich_chinh_y: dich_chinh_y,
    khoang_cach_truc_chia_a: khoang_cach_truc_chia_a,
    chieu_rong_vanh_rang_bw: chieu_rong_vanh_rang_bw,
    duong_kinh_chia_d1: duong_kinh_chia_d1,
    duong_kinh_chia_d2: duong_kinh_chia_d2,
    duong_kinh_lan_dw1: duong_kinh_lan_dw1,
    duong_kinh_lan_dw2: duong_kinh_lan_dw2,
    duong_kinh_dinh_rang_da1: duong_kinh_dinh_rang_da1,
    duong_kinh_dinh_rang_da2: duong_kinh_dinh_rang_da2,
    duong_kinh_co_so_db1: duong_kinh_co_so_db1,
    duong_kinh_co_so_db2: duong_kinh_co_so_db2,
    duong_kinh_day_rang_df1: duong_kinh_day_rang_df1,
    duong_kinh_day_rang_df2: duong_kinh_day_rang_df2,
    profin_goc: profin_goc,
    goc_profin_rang: goc_profin_rang,
    goc_an_khop: goc_an_khop
  }
}

function KichThuocBoTruyenCham(TinhToanCham) {
  const dich_chinh_y = 0; 
  const khoang_cach_truc_chia_a = Chapter4Function.KhoangCachTrucChia(TinhToanCham.mThang, TinhToanCham.z1, TinhToanCham.z2, TinhToanCham.cos_goc_B);
  const chieu_rong_vanh_rang_bw = Chapter4Function.ChieuRongVanhRang(TinhToanCham.y_ba_cap_cham, TinhToanCham.khoangCachThang);

  const duong_kinh_chia_d1 = Chapter4Function.d1(TinhToanCham.mThang, TinhToanCham.z1, TinhToanCham.cos_goc_B);
  const duong_kinh_chia_d2 = Chapter4Function.d1(TinhToanCham.mThang, TinhToanCham.z2, TinhToanCham.cos_goc_B);
  const duong_kinh_lan_dw1 = Chapter4Function.dw(duong_kinh_chia_d1, dich_chinh_y, TinhToanCham.z1, TinhToanCham.z2);
  const duong_kinh_lan_dw2 = Chapter4Function.dw(duong_kinh_chia_d2, dich_chinh_y, TinhToanCham.z1, TinhToanCham.z2);
  const duong_kinh_dinh_rang_da1 = Chapter4Function.DuongKinhDinhRang(duong_kinh_chia_d1, TinhToanCham.mThang);
  const duong_kinh_dinh_rang_da2 = Chapter4Function.DuongKinhDinhRang(duong_kinh_chia_d2, TinhToanCham.mThang);
  const alpha = 20;
  const duong_kinh_co_so_db1 = Chapter4Function.DuongKinhCoSo(duong_kinh_chia_d1, alpha);
  const duong_kinh_co_so_db2 = Chapter4Function.DuongKinhCoSo(duong_kinh_chia_d2, alpha);
  const duong_kinh_day_rang_df1 = Chapter4Function.DuongKinhDayRang(duong_kinh_chia_d1, TinhToanCham.mThang);
  const duong_kinh_day_rang_df2 = Chapter4Function.DuongKinhDayRang(duong_kinh_chia_d2, TinhToanCham.mThang);
  const profin_goc = alpha;
  const goc_profin_rang = Chapter4Function.GocProfinRang(profin_goc, TinhToanCham.cos_goc_B);
  const goc_an_khop = Chapter4Function.GocAnKhop(khoang_cach_truc_chia_a, goc_profin_rang, TinhToanCham.khoangCachThang)

  return {
    dich_chinh_y: dich_chinh_y,
    khoang_cach_truc_chia_a: khoang_cach_truc_chia_a,
    chieu_rong_vanh_rang_bw: chieu_rong_vanh_rang_bw,
    duong_kinh_chia_d1: duong_kinh_chia_d1,
    duong_kinh_chia_d2: duong_kinh_chia_d2,
    duong_kinh_lan_dw1: duong_kinh_lan_dw1,
    duong_kinh_lan_dw2: duong_kinh_lan_dw2,
    duong_kinh_dinh_rang_da1: duong_kinh_dinh_rang_da1,
    duong_kinh_dinh_rang_da2: duong_kinh_dinh_rang_da2,
    duong_kinh_co_so_db1: duong_kinh_co_so_db1,
    duong_kinh_co_so_db2: duong_kinh_co_so_db2,
    duong_kinh_day_rang_df1: duong_kinh_day_rang_df1,
    duong_kinh_day_rang_df2: duong_kinh_day_rang_df2,
    profin_goc: profin_goc,
    goc_profin_rang: goc_profin_rang,
    goc_an_khop: goc_an_khop
  }
}

function KiemNghiemRangVeDoBenTiepXucCapNhanh(TinhToanNhanh, Chapter2Data, Chapter3Data, Chapter4Data ) {
  const he_so_ke_den_co_tinh_vat_lieu_Zm = 274;
  const tanb_b = Chapter4Function.Tanb_b(TinhToanNhanh.goc_profin_rang, TinhToanNhanh.goc_B);
  const goc_nghieng_cua_rang_beta_b = Chapter4Function.Beta_b(tanb_b);
  const tan_a = Chapter4Function.Tana(TinhToanNhanh.profin_goc);
  const cosb_b = Chapter4Function.Cosb_b(goc_nghieng_cua_rang_beta_b);
  const sin2atw = Chapter4Function.Sin2atw(TinhToanNhanh.goc_an_khop);
  const dH = 0.002;
  const g_o = Chapter4Function.g_o(TinhToanNhanh.mNghieng);
  const ZV = 1; 
  const he_so_ke_den_be_mat_tiep_xuc_ZH = Chapter4Function.HeSoKeDenBeMatTiepXuc(cosb_b, sin2atw);
  const he_so_trung_khop_doc_eb = Chapter4Function.HeSoTrungKhopDoc(TinhToanNhanh.chieu_rong_vanh_rang_bw,TinhToanNhanh.goc_B, TinhToanNhanh.mNghieng);
  const he_so_trung_khop_ngang_ea = Chapter4Function.HeSoTrungKhopNgang(TinhToanNhanh.z1, TinhToanNhanh.z2, TinhToanNhanh.cos_goc_B);
  const he_so_ke_den_trung_khop_rang_Ze = Chapter4Function.HeSoKeDenTrungKhopRangCapNhanh(he_so_trung_khop_ngang_ea);
  const duong_kinh_vong_lan_banh_nho_dw1 = Chapter4Function.DuongKinhVongLanBanhNho(TinhToanNhanh.khoangCachNghieng, TinhToanNhanh.u_m);
  const van_toc_vong_v = Chapter4Function.VanTocVong(TinhToanNhanh.duong_kinh_lan_dw1, Chapter2Data.n1);
  const cap_chinh_xac = 9; 
  const he_so_cac_doi_rang_K_Ha = Chapter4Function.HeSoCacDoiRang(van_toc_vong_v);
  const he_so_tren_chieu_rong_vanh_rang_K_Hb = Chapter4Function.HeSoTrenChieuRongVanhRangCapNhanh(TinhToanNhanh.y_bd);
  const K_xH = 1;
  const Z_R = 0.95;
  const v_H = Chapter4Function.v_H(dH, g_o, van_toc_vong_v, TinhToanNhanh.khoangCachNghieng, TinhToanNhanh.u_m);
  const he_so_tai_trong_vung_an_khop_KHv = Chapter4Function.HeSoTaiTrongVungAnKhop(v_H, TinhToanNhanh.chieu_rong_vanh_rang_bw, TinhToanNhanh.duong_kinh_lan_dw1, Chapter2Data.t1_ti_so_truyen, he_so_tren_chieu_rong_vanh_rang_K_Hb, he_so_cac_doi_rang_K_Ha);
  const he_so_tai_trong_tiep_xuc_KH = Chapter4Function.HeSoTaiTrongTiepXuc(he_so_tren_chieu_rong_vanh_rang_K_Hb, he_so_cac_doi_rang_K_Ha, he_so_tai_trong_vung_an_khop_KHv);
  const ung_suat_tiep_xuc_mat_rang_sH = Chapter4Function.UngSuatTiepXucOMatRang(he_so_ke_den_co_tinh_vat_lieu_Zm, he_so_ke_den_be_mat_tiep_xuc_ZH, he_so_ke_den_trung_khop_rang_Ze, Chapter2Data.t1_ti_so_truyen, he_so_tai_trong_tiep_xuc_KH, TinhToanNhanh.u_m, TinhToanNhanh.chieu_rong_vanh_rang_bw, TinhToanNhanh.duong_kinh_lan_dw1);
  const sH_cuoi = Chapter4Function.sH_cuoi(Chapter4Data.o_H, ZV, K_xH, Z_R);

  const K_Fb = Chapter4Function.KfbCapNhanh(TinhToanNhanh.y_bd);
  const K_Fa = Chapter4Function.Kfa(van_toc_vong_v);
  const dF = 0.006;
  const Vf = Chapter4Function.Vf(dF, g_o, van_toc_vong_v, TinhToanNhanh.khoangCachNghieng, TinhToanNhanh.u_m);

  const K_fv = Chapter4Function.Kfv(Vf, TinhToanNhanh.chieu_rong_vanh_rang_bw, TinhToanNhanh.duong_kinh_lan_dw1, Chapter2Data.t1_ti_so_truyen, K_Fb, K_Fa);
  const KF = Chapter4Function.KF(K_Fb, K_Fa, K_fv);
  const Ye = Chapter4Function.Ye(he_so_trung_khop_ngang_ea);
  const Yb = Chapter4Function.Yb(TinhToanNhanh.goc_B);
  const YR = 1;
  const KxF = 1;
  const Kqt = 2.2;
  const so_rang_tuong_duong_zv1 = Chapter4Function.Zv1(TinhToanNhanh.z1, TinhToanNhanh.cos_goc_B);
  const so_rang_tuong_duong_zv2 = Chapter4Function.Zv1(TinhToanNhanh.z2, TinhToanNhanh.cos_goc_B);
  const Ys = Chapter4Function.Ys(TinhToanNhanh.mNghieng);
  const Yf1 = 3.7;
  const Yf2 = Chapter4Function.YF(so_rang_tuong_duong_zv2);
  const sF1 = Chapter4Function.sF1(Chapter2Data.t1_ti_so_truyen, KF, Ye, Yb, Yf1, TinhToanNhanh.chieu_rong_vanh_rang_bw, TinhToanNhanh.duong_kinh_lan_dw1, TinhToanNhanh.mNghieng);
  const sF2 = Chapter4Function.sF2(sF1, Yf2, Yf1);
  const ung_suat_uon_cho_phep_1 = Chapter4Function.UngSuatUonChoPhep(Chapter4Data.o_F1, YR, Ys, KxF);
  const ung_suat_uon_cho_phep_2 = Chapter4Function.UngSuatUonChoPhep(Chapter4Data.o_F2, YR, Ys, KxF);
  const s_Hmax = Chapter4Function.sHmax(ung_suat_tiep_xuc_mat_rang_sH, Kqt);
  const sF1_max = Chapter4Function.sF1max(sF1, Kqt);
  const sF2_max = Chapter4Function.sF2max(sF2, Kqt);

  return {
    he_so_ke_den_co_tinh_vat_lieu_Zm: he_so_ke_den_co_tinh_vat_lieu_Zm,
    tanb_b: tanb_b,
    goc_nghieng_cua_rang_beta_b: goc_nghieng_cua_rang_beta_b,
    tan_a: tan_a,
    cosb_b: cosb_b,
    sin2atw: sin2atw,
    dH: dH,
    g_o: g_o,
    Z_V: ZV,
    he_so_ke_den_be_mat_tiep_xuc_ZH: he_so_ke_den_be_mat_tiep_xuc_ZH,
    he_so_trung_khop_doc_eb: he_so_trung_khop_doc_eb,
    he_so_trung_khop_ngang_ea: he_so_trung_khop_ngang_ea,
    he_so_ke_den_trung_khop_rang_Ze: he_so_ke_den_trung_khop_rang_Ze,
    duong_kinh_vong_lan_banh_nho_dw1: duong_kinh_vong_lan_banh_nho_dw1,
    van_toc_vong_v: van_toc_vong_v,
    cap_chinh_xac: cap_chinh_xac,
    he_so_cac_doi_rang_K_Ha: he_so_cac_doi_rang_K_Ha,
    he_so_tren_chieu_rong_vanh_rang_K_Hb: he_so_tren_chieu_rong_vanh_rang_K_Hb,
    K_xH: K_xH,
    Z_R: Z_R, 
    v_H: v_H,
    he_so_tai_trong_vung_an_khop_KHv: he_so_tai_trong_vung_an_khop_KHv,
    he_so_tai_trong_tiep_xuc_KH: he_so_tai_trong_tiep_xuc_KH,
    ung_suat_tiep_xuc_mat_rang_sH: ung_suat_tiep_xuc_mat_rang_sH,
    sH_cuoi: sH_cuoi,
    K_Fb: K_Fb,
    K_Fa: K_Fa,
    dF: dF,
    Vf: Vf,
    K_fv: K_fv,
    KF: KF,
    Ye: Ye,
    Yb: Yb,
    YR: YR,
    KxF: KxF,
    Kqt: Kqt,
    so_rang_tuong_duong_zv1: so_rang_tuong_duong_zv1,
    so_rang_tuong_duong_zv2: so_rang_tuong_duong_zv2,
    Ys: Ys,
    Yf1: Yf1,
    Yf2: Yf2, 
    sF1: sF1,
    sF2: sF2,
    ung_suat_uon_cho_phep_1: ung_suat_uon_cho_phep_1,
    ung_suat_uon_cho_phep_2: ung_suat_uon_cho_phep_2,
    s_Hmax: s_Hmax,
    sF1_max: sF1_max,
    sF2_max: sF2_max
  }
}

function KiemNghiemRangVeDoBenTiepXucCapCham(TinhToanCham, Chapter2Data, Chapter3Data, Chapter4Data) {
  const he_so_ke_den_co_tinh_vat_lieu_Zm = 274;
  const tanb_b = Chapter4Function.Tanb_b(TinhToanCham.goc_profin_rang, TinhToanCham.goc_B);
  const goc_nghieng_cua_rang_beta_b = Chapter4Function.Beta_b(tanb_b);
  const tan_a = Chapter4Function.Tana(TinhToanCham.profin_goc);
  const cosb_b = Chapter4Function.Cosb_b(goc_nghieng_cua_rang_beta_b);
  const sin2atw = Chapter4Function.Sin2atw(TinhToanCham.goc_an_khop);
  const dH = 0.006;
  const g_o = Chapter4Function.g_o(TinhToanCham.mThang);
  const ZV = 1; 
  const he_so_ke_den_be_mat_tiep_xuc_ZH = Chapter4Function.HeSoKeDenBeMatTiepXuc(cosb_b, sin2atw);
  const he_so_trung_khop_doc_eb = Chapter4Function.HeSoTrungKhopDoc(TinhToanCham.chieu_rong_vanh_rang_bw,TinhToanCham.goc_B, TinhToanCham.mThang);
  const he_so_trung_khop_ngang_ea = Chapter4Function.HeSoTrungKhopNgang(TinhToanCham.z1, TinhToanCham.z2, TinhToanCham.cos_goc_B);
  const he_so_ke_den_trung_khop_rang_Ze = Chapter4Function.HeSoKeDenTrungKhopRangCapCham(he_so_trung_khop_ngang_ea);
  const duong_kinh_vong_lan_banh_nho_dw1 = TinhToanCham.duong_kinh_lan_dw1;
  const van_toc_vong_v = Chapter4Function.VanTocVong(TinhToanCham.duong_kinh_lan_dw1, Chapter2Data.n2);
  const cap_chinh_xac = 9; 
  const he_so_cac_doi_rang_K_Ha = Chapter4Function.HeSoCacDoiRang(van_toc_vong_v);
  const he_so_tren_chieu_rong_vanh_rang_K_Hb = Chapter4Function.HeSoTrenChieuRongVanhRangCapCham(TinhToanCham.y_bd);
  const K_xH = 1;
  const Z_R = 0.95; 
  const v_H = Chapter4Function.v_H(dH, g_o, van_toc_vong_v, TinhToanCham.khoangCachThang, TinhToanCham.u_m);
  const he_so_tai_trong_vung_an_khop_KHv = Chapter4Function.HeSoTaiTrongVungAnKhop(v_H, TinhToanCham.chieu_rong_vanh_rang_bw, TinhToanCham.duong_kinh_lan_dw1, Chapter2Data.t2_ti_so_truyen, he_so_tren_chieu_rong_vanh_rang_K_Hb, he_so_cac_doi_rang_K_Ha);
  const he_so_tai_trong_tiep_xuc_KH = Chapter4Function.HeSoTaiTrongTiepXuc(he_so_tren_chieu_rong_vanh_rang_K_Hb, he_so_cac_doi_rang_K_Ha, he_so_tai_trong_vung_an_khop_KHv);
  const ung_suat_tiep_xuc_mat_rang_sH = Chapter4Function.UngSuatTiepXucOMatRang(he_so_ke_den_co_tinh_vat_lieu_Zm, he_so_ke_den_be_mat_tiep_xuc_ZH, he_so_ke_den_trung_khop_rang_Ze, Chapter2Data.t2_ti_so_truyen, he_so_tai_trong_tiep_xuc_KH, TinhToanCham.u_m, TinhToanCham.chieu_rong_vanh_rang_bw, TinhToanCham.duong_kinh_lan_dw1);
  const sH_cuoi = Chapter4Function.sH_cuoi(Chapter4Data.o_H_phay, ZV, K_xH, Z_R);

  const K_Fb = Chapter4Function.KfbCapCham(TinhToanCham.y_bd);
  const K_Fa = Chapter4Function.Kfa(van_toc_vong_v);
  const dF = 0.016;
  const Vf = Chapter4Function.Vf(dF, g_o, van_toc_vong_v, TinhToanCham.khoangCachThang, TinhToanCham.u_m)
  const K_fv = Chapter4Function.Kfv(Vf, TinhToanCham.chieu_rong_vanh_rang_bw, TinhToanCham.duong_kinh_lan_dw1, Chapter2Data.t2_ti_so_truyen, K_Fb, K_Fa);
  const KF = Chapter4Function.KF(K_Fb, K_Fa, K_fv);
  const Ye = Chapter4Function.Ye(he_so_trung_khop_ngang_ea);
  const Yb = Chapter4Function.Yb(TinhToanCham.goc_B);
  const YR = 1;
  const KxF = 1;
  const Kqt = 2.2;
  const Ys = Chapter4Function.Ys(TinhToanCham.mThang);
  const so_rang_tuong_duong_zv1 = 105.6540;
  const so_rang_tuong_duong_zv2 = 275.1406;
  const Yf1 = 3.7;
  const Yf2 = Chapter4Function.YF(so_rang_tuong_duong_zv2);
  const sF1 = Chapter4Function.sF1(Chapter2Data.t2_ti_so_truyen, KF, Ye, Yb, Yf1, TinhToanCham.chieu_rong_vanh_rang_bw, TinhToanCham.duong_kinh_lan_dw1, TinhToanCham.mThang);
  const sF2 = Chapter4Function.sF2(sF1, Yf2, Yf1);
  const ung_suat_uon_cho_phep_1 = Chapter4Function.UngSuatUonChoPhep(Chapter4Data.o_F1, YR, Ys, KxF);
  const ung_suat_uon_cho_phep_2 = Chapter4Function.UngSuatUonChoPhep(Chapter4Data.o_F2, YR, Ys, KxF);
  const s_Hmax = Chapter4Function.sHmax(ung_suat_tiep_xuc_mat_rang_sH, Kqt);
  const sF1_max = Chapter4Function.sF1max(sF1, Kqt);
  const sF2_max = Chapter4Function.sF2max(sF2, Kqt);

  return {
    he_so_ke_den_co_tinh_vat_lieu_Zm: he_so_ke_den_co_tinh_vat_lieu_Zm,
    tanb_b: tanb_b,
    goc_nghieng_cua_rang_beta_b: goc_nghieng_cua_rang_beta_b,
    tan_a: tan_a, 
    cosb_b: cosb_b,
    sin2atw: sin2atw,
    dH:dH,
    g_o:g_o,
    ZV: ZV,
    he_so_ke_den_be_mat_tiep_xuc_ZH: he_so_ke_den_be_mat_tiep_xuc_ZH,
    he_so_trung_khop_doc_eb: he_so_trung_khop_doc_eb,
    he_so_trung_khop_ngang_ea: he_so_trung_khop_ngang_ea,
    he_so_ke_den_trung_khop_rang_Ze: he_so_ke_den_trung_khop_rang_Ze,
    duong_kinh_vong_lan_banh_nho_dw1: duong_kinh_vong_lan_banh_nho_dw1,
    van_toc_vong_v: van_toc_vong_v,
    cap_chinh_xac: cap_chinh_xac,
    he_so_cac_doi_rang_K_Ha: he_so_cac_doi_rang_K_Ha,
    he_so_tren_chieu_rong_vanh_rang_K_Hb: he_so_tren_chieu_rong_vanh_rang_K_Hb,
    K_xH: K_xH,
    Z_R: Z_R,
    v_H: v_H, 
    he_so_tai_trong_vung_an_khop_KHv: he_so_tai_trong_vung_an_khop_KHv,
    he_so_tai_trong_tiep_xuc_KH: he_so_tai_trong_tiep_xuc_KH,
    ung_suat_tiep_xuc_mat_rang_sH: ung_suat_tiep_xuc_mat_rang_sH,
    sH_cuoi: sH_cuoi,
    K_Fb: K_Fb,
    K_Fa: K_Fa,
    dF: dF,
    Vf: Vf,
    K_fv: K_fv,
    KF: KF,
    Ye: Ye,
    Yb: Yb,
    YR: YR,
    KxF: KxF,
    Kqt: Kqt,
    Ys: Ys,
    so_rang_tuong_duong_zv1: so_rang_tuong_duong_zv1,
    so_rang_tuong_duong_zv2: so_rang_tuong_duong_zv2,
    Yf1: Yf1,
    Yf2: Yf2,
    sF1: sF1,
    sF2: sF2,
    ung_suat_uon_cho_phep_1: ung_suat_uon_cho_phep_1,
    ung_suat_uon_cho_phep_2: ung_suat_uon_cho_phep_2,
    s_Hmax: s_Hmax,
    sF1_max: sF1_max,
    sF2_max: sF2_max
  }
}

module.exports = Chapter4Routes;