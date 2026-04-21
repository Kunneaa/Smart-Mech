const express = require('express')
const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../config.env' });

let HistoryRoutes = express.Router();

function getSelectedMonitorId(record) {
  return record.monitor_id || record.engine_id;
}

HistoryRoutes.route('/fetchcalculation/:recordid').post(async (request, response) => {
  const db = request.db;
    const record_id = jwt.decode(request.params.recordid, process.env.SECRET_KEY);

    try {
      // Lấy data từ history record
      const { data: recordData, error: recordDataError } = await db.from('HistoryRecord').select('*').eq('id', record_id.id);
      if (recordDataError) {
        console.error("recordDataError", recordDataError)
        return response.status(400).json({ message: recordDataError.message });
      }

      // Lấy data động cơ
      const selectedMonitorId = getSelectedMonitorId(recordData[0]);
      const { data: monitorData, error: monitorDataError } = await db.from('Monitor').select('*').eq('id', selectedMonitorId);
      if(monitorDataError) {
        console.error("monitorDataError", monitorDataError)
        return response.status(400).json({ message: monitorDataError.message });
      }

      // Lấy data từ bảng Chapter3
      const { data: Chapter3Data, error: Chapter3DataError } = await db.from('Chapter3').select('so_mat_xich, v, z1, z2, oh1, oh2').eq('id', recordData[0].chapter3_id);
      if(Chapter3DataError) {
        console.error("Chapter3DataError", Chapter3DataError)
        return response.status(400).json({ message: Chapter3DataError.message });
      }

      // Lấy data từ bảng Chapter4
      const { data: Chapter4Data, error: Chapter4DataError } = await db.from('Chapter4').select('tinhtoannhanh_id, tinhtoancham_id').eq('id', recordData[0].chapter4_id);
      if(Chapter4DataError) {
        console.error("Chapter4DataError", Chapter4DataError)
        return response.status(400).json({ message: Chapter4DataError.message });
      }

      // Lấy data từ bảng Tính Toán Nhanh
      const { data: NhanhData, error: NhanhDataError } = await db.from('TinhToanNhanh').select('khoangCachNghieng, z1, z2, duong_kinh_dinh_rang_da1, duong_kinh_dinh_rang_da2').eq('id', Chapter4Data[0].tinhtoannhanh_id);
      if(NhanhDataError) {
        console.error("NhanhDataError", NhanhDataError)
        return response.status(400).json({ message: NhanhDataError.message });
      }

      // Lấy data từ bảng Tính Toán Chậm
      const { data: ChamData, error: ChamDataError } = await db.from('TinhToanCham').select('khoangCachThang, z1, z2, duong_kinh_dinh_rang_da1, duong_kinh_dinh_rang_da2').eq('id', Chapter4Data[0].tinhtoancham_id);
      if(ChamDataError) {
        console.error("ChamDataError", ChamDataError)
        return response.status(400).json({ message: ChamDataError.message });
      }

      // Lấy data từ bảng Chapter5
      const { data: Chapter5Data, error: Chapter5DataError } = await db.from('Chapter5').select('table1, table2, table3').eq('id', recordData[0].chapter5_id);
      if(Chapter5DataError) {
        console.error("Chapter5DataError", Chapter5DataError)
        return response.status(400).json({ message: Chapter5DataError.message });
      }

      const material = SelectMaterial(Chapter3Data[0].v, Chapter3Data[0].z1, Chapter3Data[0].z2, Chapter3Data[0].oh1, Chapter3Data[0].oh2)
      const returnData = {
        monitor: monitorData[0],
        chapter3: Chapter3Data[0],
        tinhToanNhanh: NhanhData[0],
        tinhToanCham: ChamData[0],      
        material: material,
        table1: Chapter5Data[0].table1,
        table2: Chapter5Data[0].table2,
        table3: Chapter5Data[0].table3
      }

      return response.status(200).json({ 
        returnData: returnData,
        message: 'Đã lấy xong data pdf',
        success: true
      });
    } catch(error) {
      return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
})

HistoryRoutes.route('/fetchhistory/:userid').get(async (request, response) => {
  const supabase = request.db;
  const decoded = jwt.verify(request.params.userid, process.env.SECRET_KEY);
  const userid = decoded.id;

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('id, name, created_at').eq('user_id', userid);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    const formattedRecords = recordData.map(record => {
      const { created_at, time } = formatDateAndTime(record.created_at);
      return {
        ...record,
        created_at, 
        time      
      };
    });

    return response.status(200).json({ 
      record: formattedRecords,
      message: 'Đã lấy xong record data',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

HistoryRoutes.route('/fetchsecondcalculation/:recordid').post(async (request, response) => {
  const db = request.db;

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await db.from('HistoryRecord').select('*').eq('id', request.params.recordid);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    // Lấy data động cơ
    const selectedMonitorId = getSelectedMonitorId(recordData[0]);
    const { data: monitorData, error: monitorDataError } = await db.from('Monitor').select('*').eq('id', selectedMonitorId);
    if(monitorDataError) {
      console.error("monitorDataError", monitorDataError)
      return response.status(400).json({ message: monitorDataError.message });
    }

    // Lấy data từ bảng Chapter3
    const { data: Chapter3Data, error: Chapter3DataError } = await db.from('Chapter3').select('so_mat_xich, v, z1, z2, oh1, oh2').eq('id', recordData[0].chapter3_id);
    if(Chapter3DataError) {
      console.error("Chapter3DataError", Chapter3DataError)
      return response.status(400).json({ message: Chapter3DataError.message });
    }

    // Lấy data từ bảng Chapter4
    const { data: Chapter4Data, error: Chapter4DataError } = await db.from('Chapter4').select('tinhtoannhanh_id, tinhtoancham_id').eq('id', recordData[0].chapter4_id);
    if(Chapter4DataError) {
      console.error("Chapter4DataError", Chapter4DataError)
      return response.status(400).json({ message: Chapter4DataError.message });
    }

    // Lấy data từ bảng Tính Toán Nhanh
    const { data: NhanhData, error: NhanhDataError } = await db.from('TinhToanNhanh').select('khoangCachNghieng, z1, z2, duong_kinh_dinh_rang_da1, duong_kinh_dinh_rang_da2').eq('id', Chapter4Data[0].tinhtoannhanh_id);
    if(NhanhDataError) {
      console.error("NhanhDataError", NhanhDataError)
      return response.status(400).json({ message: NhanhDataError.message });
    }

    // Lấy data từ bảng Tính Toán Chậm
    const { data: ChamData, error: ChamDataError } = await db.from('TinhToanCham').select('khoangCachThang, z1, z2, duong_kinh_dinh_rang_da1, duong_kinh_dinh_rang_da2').eq('id', Chapter4Data[0].tinhtoancham_id);
    if(ChamDataError) {
      console.error("ChamDataError", ChamDataError)
      return response.status(400).json({ message: ChamDataError.message });
    }

    // Lấy data từ bảng Chapter5
    const { data: Chapter5Data, error: Chapter5DataError } = await db.from('Chapter5').select('table1, table2, table3').eq('id', recordData[0].chapter5_id);
    if(Chapter5DataError) {
      console.error("Chapter5DataError", Chapter5DataError)
      return response.status(400).json({ message: Chapter5DataError.message });
    }

    const material = SelectMaterial(Chapter3Data[0].v, Chapter3Data[0].z1, Chapter3Data[0].z2, Chapter3Data[0].oh1, Chapter3Data[0].oh2)
    const returnData = {
      monitor: monitorData[0],
      chapter3: Chapter3Data[0],
      tinhToanNhanh: NhanhData[0],
      tinhToanCham: ChamData[0],      
      material: material,
      table1: Chapter5Data[0].table1,
      table2: Chapter5Data[0].table2,
      table3: Chapter5Data[0].table3
    }

    return response.status(200).json({ 
      returnData: returnData,
      message: 'Đã lấy xong data pdf',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

HistoryRoutes.route('/deleterecord/:recordid').get(async (request, response) => {
  const supabase = request.db;
  const recordId = request.params.recordid;

  try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('id', recordId);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    if (!recordData || recordData.length === 0) {
      return response.status(404).json({
        message: 'Không tìm thấy record cần xoá',
        success: false
      });
    }

    if(recordData[0].chapter4_id) {
      // Lấy data từ chương 4
      const { data: Chapter4Data, error: Chapter4DataError } = await supabase.from('Chapter4').select('tinhtoannhanh_id, tinhtoancham_id').eq('id', recordData[0].chapter4_id);
      if (Chapter4DataError) {
        console.error("Chapter4DataError", Chapter4DataError)
        return response.status(400).json({ message: Chapter4DataError.message });
      }

      // Xoá bảng tính toán nhanh
      const { data: nhanhData, error: nhanhDataError } = await supabase.from('TinhToanNhanh').delete().eq('id', Chapter4Data[0].tinhtoannhanh_id);
      if (nhanhDataError) {
        console.error("nhanhDataError", nhanhDataError)
        return response.status(400).json({ message: nhanhDataError.message });
      }

      // Xoá bảng tính toán chậm
      const { data: chamData, error: chamDataError } = await supabase.from('TinhToanCham').delete().eq('id', Chapter4Data[0].tinhtoancham_id);
      if (chamDataError) {
        console.error("chamDataError", chamDataError)
        return response.status(400).json({ message: chamDataError.message });
      }
    }

    if(recordData[0].chapter3_id) {
      // Xoá chương 3
      const { data: deleteChapter3, error: deleteChapterError } = await supabase.from('Chapter3').delete().eq('id', recordData[0].chapter3_id);
      if (deleteChapterError) {
        console.error("deleteChapterError", deleteChapterError)
        return response.status(400).json({ message: deleteChapterError.message });
      }
    }

    if(recordData[0].chapter2_id) {
      // Xoá chương 2
      const { data: deleteChapter2, error: deleteChapter2Error } = await supabase.from('Chapter2').delete().eq('id', recordData[0].chapter2_id);
      if (deleteChapter2Error) {
        console.error("deleteChapter2Error", deleteChapter2Error)
        return response.status(400).json({ message: deleteChapter2Error.message });
      }
    }

    if(recordData[0].chapter5_id) {
      // Xoá chương 5
      const { data: deleteChapter5, error: deleteChapter5Error } = await supabase.from('Chapter5').delete().eq('id', recordData[0].chapter5_id);
      if (deleteChapter5Error) {
        console.error("deleteChapter5Error", deleteChapter5Error)
        return response.status(400).json({ message: deleteChapter5Error.message });
      }
    }

    // Xoá record lịch sử sau khi đã xoá các bảng liên quan
    const { data: deleteHistoryRecord, error: deleteHistoryRecordError } = await supabase
      .from('HistoryRecord')
      .delete()
      .eq('id', recordId);

    if (deleteHistoryRecordError) {
      console.error("deleteHistoryRecordError", deleteHistoryRecordError)
      return response.status(400).json({ message: deleteHistoryRecordError.message });
    }

    return response.status(200).json({ 
      message: 'Đã xoá thành công',
      success: true
    });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
})

HistoryRoutes.route('/countrecord/:userid').get(async (request, response) => {
  const supabase = request.db;
  const decoded = jwt.verify(request.params.userid, process.env.SECRET_KEY);

   try {
    // Lấy data từ history record
    const { data: recordData, error: recordDataError } = await supabase.from('HistoryRecord').select('*').eq('user_id', decoded.id);
    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    } 

    const totalRecords = recordData.length;
    response.status(200).json({
      total: totalRecords,
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

function formatDateAndTime(timestamp) {
  const date = new Date(timestamp);

  const weekdayMap = {
    'Chủ Nhật': 'CN',
    'Thứ Hai': 'T2',
    'Thứ Ba': 'T3',
    'Thứ Tư': 'T4',
    'Thứ Năm': 'T5',
    'Thứ Sáu': 'T6',
    'Thứ Bảy': 'T7',
  };

  const weekdayFull = date.toLocaleDateString('vi-VN', { weekday: 'long' });
  const weekday = weekdayMap[weekdayFull] || weekdayFull;

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  return {
    created_at: `${weekday} ${day}.${month}.${year}`,
    time: `${hour}:${minute}`
  };
}




module.exports = HistoryRoutes;