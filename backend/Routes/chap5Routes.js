const express = require('express')
const MachineCalculatorFactory = require('../MachineCalculator');
const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../config.env' });

let Chapter5Routes = express.Router();
const Chapter5Function = MachineCalculatorFactory.getChapter("Chapter5");

function hasRequiredChapter2Data(chapter2) {
  const requiredFields = ['t1_ti_so_truyen', 't2_ti_so_truyen', 't3_ti_so_truyen'];
  return requiredFields.every((field) => Number.isFinite(Number(chapter2?.[field])));
}

Chapter5Routes.route('/chapter5/:recordid').post(async (request, response) => {
  const supabase = request.db;
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try {
    if (!record_id || !record_id.id) {
      return response.status(400).json({ message: 'recordid không hợp lệ hoặc đã hết hạn' });
    }

    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', record_id.id);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    if (!recordData || recordData.length === 0) {
      return response.status(404).json({ message: 'Không tìm thấy HistoryRecord tương ứng' });
    }

    // Lấy data từ bảng Chapter2
    const { data: Chapter2Data, error: Chapter2DataError } = await supabase.from('Chapter2').select('*').eq('id', recordData[0].chapter2_id);
    if(Chapter2DataError) {
      console.error("Chapter2DataError", Chapter2DataError)
      return response.status(400).json({ message: Chapter2DataError.message });
    }

    if (!Chapter2Data || Chapter2Data.length === 0) {
      return response.status(404).json({ message: 'Không tìm thấy dữ liệu Chapter2 của record' });
    }

    if (!hasRequiredChapter2Data(Chapter2Data[0])) {
      return response.status(400).json({
        message: 'Dữ liệu Chapter2 chưa đủ để tính Chapter5. Vui lòng hoàn tất chọn monitor ở Chapter2 trước.',
      });
    }

    const TinhToan = TinhToanTruc(request.body, Chapter2Data[0]);

    if(recordData[0].chapter5_id) {
      // Cập nhật dữ liệu chương 5
      const {data: insertChapter5, error: InsertChapter5Error } = await supabase.from('Chapter5').update(TinhToan).eq('id',recordData[0].chapter5_id)
      if(InsertChapter5Error) {
        console.error("InsertChapter5Error", InsertChapter5Error)
        return response.status(400).json({ message: InsertChapter5Error.message });
      }
    } else {
      const Chapter5Id = uuidv4();
      const Chapter5InputDataWithId = {
        id: Chapter5Id,
        ...TinhToan
      }

      // Thêm dữ liệu ban đầu chương 5
      const {data: insertChapter5, error: InsertChapter5Error } = await supabase.from('Chapter5').insert([Chapter5InputDataWithId])
      if(InsertChapter5Error) {
        console.error("InsertChapter5Error", InsertChapter5Error)
        return response.status(400).json({ message: InsertChapter5Error.message });
      }

      // Cập nhật khoá chương 5 trong HistoryRecord
      const { data: insertChapter5ID, error: InsertChapter5IDError } = await supabase.from('HistoryRecord').update({chapter5_id: Chapter5Id}).eq('id', record_id.id)
      if(InsertChapter5IDError) {
        console.error("InsertChapter5IDError", InsertChapter5IDError)
        return response.status(400).json({ message: InsertChapter5IDError.message });
      }
    }

    return response.status(200).json({ 
      lmd_min: TinhToan.lmd_min, 
      lmd_max: TinhToan.lmd_max,
      message: 'Đã tính toán xong chương 5',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

Chapter5Routes.route('/chapter5/secondcalculation/:recordid').post( async (request, response) => {
  const supabase = request.db;
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', record_id.id);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    const TinhToan = TinhToanTrucLan2(request.body);

    // Thêm dữ liệu chương 5
    const {data: insertChapter5, error: InsertChapter5Error } = await supabase.from('Chapter5').update([TinhToan]).eq('id', recordData[0].chapter5_id)
    if(InsertChapter5Error) {
      console.error("InsertChapter5Error", InsertChapter5Error)
      return response.status(400).json({ message: InsertChapter5Error.message });
    }

    return response.status(200).json({ 
      Table1: TinhToan.table1,
      Table2: TinhToan.table2,
      Table3: TinhToan.table3,
      message: 'Đã tính toán xong chương 5',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

Chapter5Routes.route('/chapter5/saverecord/:recordid').post(async (request, response) => {
  const supabase = request.db;
  const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

  try {
    const inputData = {
      name: request.body.recordname
    }

    // Cập nhật dữ liệu trong HistoryRecord
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').update([inputData]).eq('id', record_id.id);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    return response.status(200).json({ 
      message: 'Đã cập nhật tên tính toán',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

function TinhToanTruc(userInput, Chapter2Data) {
  const us_xoan = userInput.tau; // người dùng chọn
  const duong_kinh_so_bo_truc_d1 = Chapter5Function.duong_kinh_so_bo_truc_d1(Chapter2Data.t1_ti_so_truyen, us_xoan);
  const duong_kinh_so_bo_truc_d2 = Chapter5Function.duong_kinh_so_bo_truc(Chapter2Data.t2_ti_so_truyen, us_xoan);
  const duong_kinh_so_bo_truc_d3 = Chapter5Function.duong_kinh_so_bo_truc(Chapter2Data.t3_ti_so_truyen, us_xoan);
  const bo1 = Chapter5Function.chieu_rong_o_lan(duong_kinh_so_bo_truc_d1);
  const bo2 = Chapter5Function.chieu_rong_o_lan(duong_kinh_so_bo_truc_d2);
  const bo3 = Chapter5Function.chieu_rong_o_lan(duong_kinh_so_bo_truc_d3);

  if (bo1 === null || bo2 === null || bo3 === null) {
    throw new Error('Không xác định được chiều rộng ổ lăn từ dữ liệu đầu vào');
  }
  const k1 = userInput.k1; // người dùng chọn từ khoảng quy định theo sách 8..15
  const k2 = userInput.k2; // người dùng chọn từ khoảng quy định theo sách 5..15
  const k3 = userInput.k3; // người dùng chọn từ khoảng quy định theo sách 10..20
  const h_n = userInput.h_n; // người dùng chọn từ khoảng quy định theo sách 15..20
  const chieu_dai_nua_khoi_noi_mayo = Chapter5Function.chieu_dai_nua_khoi_noi_mayo(duong_kinh_so_bo_truc_d1);
  const lmd_min = Chapter5Function.lmd_min(duong_kinh_so_bo_truc_d3);
  const lmd_max = Chapter5Function.lmd_max(duong_kinh_so_bo_truc_d3);
  // const lmd = 95; // chọn từ khoảng lmd_min...lmd_max
  const lm22 = Chapter5Function.lm(duong_kinh_so_bo_truc_d2);
  const lm23 = Chapter5Function.lm(duong_kinh_so_bo_truc_d3);
  const l22 = Chapter5Function.l22(lm22, bo2, k1, k2);
  const l23 = Chapter5Function.l23(l22, lm22, lm23, k1);
  const l24 = Chapter5Function.l24 (l23, l22);
  const l21 = Chapter5Function.l21 (l23);
  const lm12 = chieu_dai_nua_khoi_noi_mayo;
  const l11 = l21;
  const l12 = Chapter5Function.l12(lm12, bo1, k3, h_n);
  const l13 = l22;
  const l14 = l24;
  const lm33 = Chapter5Function.lm(duong_kinh_so_bo_truc_d3);
  const l31 = l21;
  const l32 = l23;
  const l33 = Chapter5Function.l33(lm33, bo3, l31, k3, h_n); 

  return {
    us_xoan: us_xoan,
    duong_kinh_so_bo_truc_d1: duong_kinh_so_bo_truc_d1,
    duong_kinh_so_bo_truc_d2: duong_kinh_so_bo_truc_d2,
    duong_kinh_so_bo_truc_d3: duong_kinh_so_bo_truc_d3,
    bo1: bo1,
    bo2: bo2,
    bo3: bo3,
    k1: k1,
    k2: k2,
    k3: k3,
    h_n: h_n,
    chieu_dai_nua_khoi_noi_mayo: chieu_dai_nua_khoi_noi_mayo,
    lmd_min: lmd_min,
    lmd_max: lmd_max,
    lm22: lm22,
    lm23: lm23,
    l21: l21,
    l22: l22,
    l23: l23,
    l24: l24,
    lm12: lm12,
    l11: l11,
    l12: l12,
    l13: l13,
    l14: l14,
    lm33: lm33,
    l31: l31,
    l32: l32,
    l33: l33
  }
}

function TinhToanTrucLan2(userInput) {
  const table1b = [
    ["", "A", "B", "C", "D", "E"],
    ["Mxy", 0, 196339.26, 206049.6, 0, 0],
    ["Mtd", 0, 205668.56, 214957.87, 122481.87, 122481.87],
    ["duong kinh truc", 0, 31.96, 32.43, 26.89, 26.89],
    ["chon lai duong kinh truc", 30, 34, 34, 30, 28]
  ];

  const table2b = [
    ["", "A", "B", "C", "D", "E"],
    ["Mxy", 0, 431204.7840, 793218.3965, 387583.0422, 0],
    ["Mtd", 0, 467916.8280, 872484.8385, 428052.8084, 0],
    ["duong kinh truc", 0, 45.40, 55.88, 44.07, 0],
    ["chon lai duong kinh truc", 45, 48, 60, 48, 45]
  ];

  const table3b = [
    ["", "A", "B", "C", "D"],
    ["Mxy", 0, 530799.20, 888599.91, 0],
    ["Mtd", 909993, 1053486.69, 1271886.87, 0],
    ["duong kinh truc", 60.92, 63.97, 68.11, 0],
    ["chon lai duong kinh truc", 63, 65, 70, 65]
  ];

  return {
    lmd: userInput.lmd,
    table1: JSON.stringify(table1b),
    table2: JSON.stringify(table2b),
    table3: JSON.stringify(table3b)
  }
}

module.exports = Chapter5Routes;