const express = require('express');
const MachineCalculatorFactory = require('../MachineCalculator');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../config.env' });

const Chapter2Routes = express.Router();
const Chapter2Function = MachineCalculatorFactory.getChapter('Chapter2');
const HISTORY_TOKEN_ERROR = 'recordid không hợp lệ hoặc đã hết hạn';
const USER_TOKEN_ERROR = 'Token user không hợp lệ hoặc đã hết hạn';

function decodeToken(token, secret) {
  return jwt.decode(token, secret);
}

function getTokenId(token, secret, errorMessage) {
  const decoded = decodeToken(token, secret);
  if (!decoded || !decoded.id) {
    return { error: errorMessage };
  }

  return { id: decoded.id };
}

function buildChapter2Payload(chapter2Data) {
  return {
    message: 'Đã tính toán thành công',
    record_id: chapter2Data.recordId,
    monitor_list: chapter2Data.monitorList,
  };
}

async function fetchSingleRow(db, tableName, filterField, filterValue, columns = '*') {
  const { data, error } = await db.from(tableName).select(columns).eq(filterField, filterValue);
  return {
    data: data && data.length > 0 ? data[0] : null,
    error,
  };
}

Chapter2Routes.post('/chapter2/:userid/:recordid?', async (request, response) => {
  const db = request.db;
  const userToken = getTokenId(request.params.userid, process.env.SECRET_KEY, USER_TOKEN_ERROR);
  const { recordid } = request.params;

  try {
    if (userToken.error) {
      return response.status(401).json({ message: userToken.error });
    }

    const inputChapter2Data = Chapter2FirstCalculation(request.body);

    const { data: monitorData, error } = await db
      .from('Monitor')
      .select('*')
      .gte('cong_suat', inputChapter2Data.cong_suat_can_thiet_tren_truc_dong_co)
      .gte('van_toc_vong_quay', inputChapter2Data.so_vong_quay_so_bo);

    if (error) {
      console.error(error);
      return response.status(400).json({ message: error.message });
    }

    const monitorList = MonitorSelect(monitorData);

    if (recordid) {
      const recordToken = getTokenId(recordid, process.env.SECRET_KEY, HISTORY_TOKEN_ERROR);
      if (recordToken.error) {
        return response.status(400).json({ message: recordToken.error });
      }

      const { data: existingRecord, error: fetchError } = await fetchSingleRow(
        db,
        'HistoryRecord',
        'id',
        recordToken.id,
        'chapter2_id'
      );

      if (fetchError) {
        throw fetchError;
      }

      if (existingRecord) {
        const { error: updateError } = await db
          .from('Chapter2')
          .update(inputChapter2Data)
          .eq('id', existingRecord.chapter2_id);

        if (updateError) {
          return response.status(400).json({ message: updateError.message });
        }

        return response.status(200).json({
          ...buildChapter2Payload({ recordId: recordid, monitorList }),
          message: 'Đã cập nhật dữ liệu thành công',
        });
      }
    }

    const chapter2Id = uuidv4();
    const newChapter2 = {
      id: chapter2Id,
      ...inputChapter2Data,
    };

    const { error: insertChapterError } = await db
      .from('Chapter2')
      .insert([newChapter2]);

    if (insertChapterError) {
      console.error('Insert Chapter2 Error:', insertChapterError);
      return response.status(400).json({ message: insertChapterError.message });
    }

    const historyRecordId = uuidv4();
    const encryptedRecordId = jwt.sign(
      { id: historyRecordId },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    const newHistoryRecord = {
      id: historyRecordId,
      chapter2_id: chapter2Id,
      user_id: userToken.id,
    };

    const { error: insertHistoryError } = await db
      .from('HistoryRecord')
      .insert([newHistoryRecord]);

    if (insertHistoryError) {
      return response.status(400).json({ message: insertHistoryError.message });
    }

    return response.status(201).json({
      ...buildChapter2Payload({ recordId: encryptedRecordId, monitorList }),
    });

  } catch (err) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});


Chapter2Routes.get('/chapter2/:recordid', async (request, response) => {
  const db = request.db;
  const recordToken = getTokenId(request.params.recordid, process.env.SECRET_KEY, HISTORY_TOKEN_ERROR);

  try {
    if (recordToken.error) {
      return response.status(400).json({ message: recordToken.error });
    }

    const { data: recordData, error: recordDataError } = await db.from('HistoryRecord').select('*').eq('id', recordToken.id);

    if (!recordData || recordData.length === 0) {
      return response.status(404).json({ message: 'Không tìm thấy record chương 2' });
    }

    const { data: chapter2data, error: chapter2DataError } = await db.from('Chapter2').select('*').eq('id', recordData[0].chapter2_id);
    
    if (recordDataError) {
      return response.status(400).json({ message: recordDataError.message });
    }
    
    if (chapter2DataError) {
      return response.status(400).json({ message: chapter2DataError.message });
    }

    if (!chapter2data || chapter2data.length === 0) {
      return response.status(404).json({ message: 'Không tìm thấy dữ liệu Chapter2' });
    }

    const chapter2 = chapter2data[0];
    const { data: monitorData, error: monitorDataError } = await db
      .from('Monitor')
      .select('*')
      .gte('cong_suat', chapter2.cong_suat_can_thiet_tren_truc_dong_co)
      .gte('van_toc_vong_quay', chapter2.so_vong_quay_so_bo);

    if (monitorDataError) {
      return response.status(400).json({ message: monitorDataError.message });
    }

    const monitorList = MonitorSelect(monitorData || []);

    return response.status(200).json({
      message: 'Đã lấy dữ liệu chương 2 thành công',
      chapter2data,
      monitor_list: monitorList,
    });
    
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }

})

const updateMonitorSelection = async (request, response) => {
  const db = request.db;
  const recordToken = getTokenId(request.params.record_id, process.env.SECRET_KEY, HISTORY_TOKEN_ERROR);
  const { selectMonitorID, selectEngineID } = request.body;
  const selectedMonitorId = selectMonitorID || selectEngineID;

  try {
    if (recordToken.error) {
      return response.status(400).json({ message: recordToken.error });
    }

    if (!selectedMonitorId) {
      return response.status(400).json({ message: 'Thiếu selectMonitorID trong request body' });
    }

    const { data: recordData, error: recordDataError } = await db.from('HistoryRecord').select('*').eq('id', recordToken.id);

    if (recordDataError) {
      console.error("recordDataError", recordDataError)
      return response.status(400).json({ message: recordDataError.message });
    }

    if (!recordData || recordData.length === 0) {
      return response.status(404).json({ message: 'Không tìm thấy HistoryRecord tương ứng' });
    }

    const { data: monitorData, error: monitorDataError } = await db.from('Monitor').select('*').eq('id', selectedMonitorId);
    
    if (monitorDataError) {
      console.error("monitorDataError", monitorDataError)
      return response.status(400).json({ message: monitorDataError.message });
    }

    if (!monitorData || monitorData.length === 0) {
      return response.status(404).json({ message: 'Không tìm thấy Monitor theo selectMonitorID đã chọn' });
    }

    const { data: chapter2data, error: chapter2DataError } = await db.from('Chapter2').select('*').eq('id', recordData[0].chapter2_id);

    if(chapter2DataError) {
      console.error("chapter2DataError", chapter2DataError)
      return response.status(400).json({ message: chapter2DataError.message });
    }

    if (!chapter2data || chapter2data.length === 0) {
      return response.status(404).json({ message: 'Không tìm thấy dữ liệu Chapter2 của record' });
    }

    // Gọi hàm tính toán phân phối tỉ số truyền
    const updateChapter2Data = Chapter2SecondCalculation(chapter2data[0], monitorData[0]);

    // Tính toán và cập nhật dữ liệu
    const { error: updataDataError } = await db.from('Chapter2').update(updateChapter2Data).eq('id', recordData[0].chapter2_id);

    if(updataDataError) {
      console.error("updataDataError", updataDataError)
      return response.status(400).json({ message: updataDataError.message });
    }

    const { error: updateMonitorIdError } = await db
      .from('HistoryRecord')
      .update({ monitor_id: selectedMonitorId, engine_id: selectedMonitorId })
      .eq('id', recordToken.id);

    if(updateMonitorIdError) {
      console.error("updateMonitorIdError", updateMonitorIdError)
      return response.status(400).json({ message: updateMonitorIdError.message });
    }
    return response.status(200).json({ message: 'Đã tính toán và cập nhật thành công chương 2' });
  } catch(error) {
    return response.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
}

Chapter2Routes.post('/chapter2/update/monitor/:record_id', updateMonitorSelection);
Chapter2Routes.post('/chapter2/update/engine/:record_id', updateMonitorSelection);

function Chapter2FirstCalculation(input) {
  const luc_vong_bang_tai = Number(input.f);
  const van_toc_bang_tai = Number(input.v);
  const duong_kinh_tang_dan = Number(input.D);
  const thoi_gian_phuc_vu = Number(input.L);
  const t1 = Number(input.t1);
  const t2 = Number(input.t2);
  const t1_momen = input.T1;
  const t2_momen = input.T2;
  const t1_t = Number(input.T1_numeric);
  const t2_t = Number(input.T2_numeric);
  const hieu_suat_noi_truc = Number(input.nk);
  const hieu_suat_o_lan = Number(input.nol);
  const hieu_suat_banh_rang = Number(input.nbr);
  const hieu_suat_xich = Number(input.nx);
  const ty_so_truyen_hop_giam_toc = Number(input.uh);
  const ty_so_truyen_xich = Number(input.ux);
  const ty_so_truyen_so_bo = Number(input.usb);
  const cong_suat_truc_cong_tac = Chapter2Function.cong_suat_truc_cong_tac(luc_vong_bang_tai, van_toc_bang_tai);
  const hieu_suat_chung = Chapter2Function.hieu_suat_chung(hieu_suat_noi_truc, hieu_suat_o_lan, hieu_suat_banh_rang, hieu_suat_xich);
  const cong_suat_tuong_duong_truc_cong_tac = Chapter2Function.cong_suat_tuong_duong_truc_cong_tac(cong_suat_truc_cong_tac, t1_t, t2_t, t1, t2);
  const cong_suat_can_thiet_tren_truc_dong_co = Chapter2Function.cong_suat_can_thiet_tren_truc_dong_co(cong_suat_tuong_duong_truc_cong_tac, hieu_suat_chung);
  const so_vong_quay_truc_cong_tac = Chapter2Function.so_vong_quay_truc_cong_tac(van_toc_bang_tai, duong_kinh_tang_dan)
  const so_vong_quay_so_bo = Chapter2Function.so_vong_quay_so_bo(so_vong_quay_truc_cong_tac, ty_so_truyen_so_bo)

  return {
    luc_vong_bang_tai,
    van_toc_bang_tai,
    duong_kinh_tang_dan,
    thoi_gian_phuc_vu,
    t1,
    t2,
    t1_momen: t1_momen,
    t2_momen: t2_momen,
    t1_t,
    t2_t,
    hieu_suat_noi_truc,
    hieu_suat_o_lan,
    hieu_suat_banh_rang,
    hieu_suat_xich,
    ty_so_truyen_hop_giam_toc,
    ty_so_truyen_xich,
    ty_so_truyen_so_bo,
    cong_suat_truc_cong_tac,
    hieu_suat_chung,
    cong_suat_tuong_duong_truc_cong_tac,
    cong_suat_can_thiet_tren_truc_dong_co,
    so_vong_quay_truc_cong_tac,
    so_vong_quay_so_bo,
  };
}

function MonitorSelect(monitorData) {
  const monitors = [...monitorData].sort((a, b) => {
    if (a.cong_suat === b.cong_suat) {
      return a.van_toc_vong_quay - b.van_toc_vong_quay;
    }
    return a.cong_suat - b.cong_suat;
  });
  return monitors.slice(0, 3);
}

function Chapter2SecondCalculation(Chapter2Input, MonitorInput) {
  const ty_so_truyen_chung = 
    Chapter2Function.ty_so_truyen_chung(MonitorInput.van_toc_vong_quay, Chapter2Input.so_vong_quay_truc_cong_tac);

  const he_so_truyen_cap_nhanh =
    Chapter2Function.he_so_truyen_cap_nhanh(Chapter2Input.ty_so_truyen_hop_giam_toc);

  const he_so_truyen_cap_cham = 
    Chapter2Function.he_so_truyen_cap_cham(Chapter2Input.ty_so_truyen_hop_giam_toc);

  const he_so_truyen_dong_xich =
    Chapter2Function.he_so_truyen_dong_xich(ty_so_truyen_chung, he_so_truyen_cap_nhanh, he_so_truyen_cap_cham);

  const he_so_truyen_dong_hop = Chapter2Function.he_so_truyen_dong_hop(Chapter2Input.ty_so_truyen_hop_giam_toc);

  const Pbt = Chapter2Function.Pbt(Chapter2Input.cong_suat_truc_cong_tac, Chapter2Input.hieu_suat_o_lan);

  const P3 = Chapter2Function.P3(Pbt, Chapter2Input.hieu_suat_xich, Chapter2Input.hieu_suat_o_lan);

  const P2 = Chapter2Function.P2(P3, Chapter2Input.hieu_suat_banh_rang, Chapter2Input.hieu_suat_o_lan);

  const P1 = Chapter2Function.P1(P2, Chapter2Input.hieu_suat_banh_rang, Chapter2Input.hieu_suat_o_lan);

  const Pm = Chapter2Function.Pm(P1, Chapter2Input.hieu_suat_noi_truc);

  const ndc = Chapter2Function.ndc(MonitorInput.van_toc_vong_quay);

  const n1 = Chapter2Function.n1(MonitorInput.van_toc_vong_quay);

  const n2 = Chapter2Function.n2(n1, he_so_truyen_cap_nhanh);

  const n3 = Chapter2Function.n3(n2, he_so_truyen_cap_cham);

  const nbt = Chapter2Function.nbt(n3, he_so_truyen_dong_xich);

  const T1_ti_so_truyen = Chapter2Function.T1_ti_so_truyen(P1, MonitorInput.van_toc_vong_quay);

  const Tm = Chapter2Function.Tm(T1_ti_so_truyen);

  const T2_ti_so_truyen = Chapter2Function.T2_ti_so_truyen(P2, n2);

  const T3_ti_so_truyen = Chapter2Function.T3_ti_so_truyen(P3, n3);

  const Tbt_ti_so_truyen = Chapter2Function.Tbt_ti_so_truyen(Pbt,nbt);

  return {
    ty_so_truyen_chung: ty_so_truyen_chung,
    he_so_truyen_dong_hop: he_so_truyen_dong_hop,
    he_so_truyen_cap_nhanh: he_so_truyen_cap_nhanh,
    he_so_truyen_cap_cham: he_so_truyen_cap_cham,
    he_so_truyen_dong_xich: he_so_truyen_dong_xich,
    pbt: Pbt,
    p3: P3,
    p2: P2,
    p1: P1,
    pm: Pm,
    ndc: ndc,
    n1: n1,
    n2: n2,
    n3: n3,
    nbt: nbt,
    t1_ti_so_truyen: T1_ti_so_truyen,
    tm: Tm,
    t2_ti_so_truyen: T2_ti_so_truyen,
    t3_ti_so_truyen: T3_ti_so_truyen,
    tbt_ti_so_truyen: Tbt_ti_so_truyen
  }
}

module.exports = Chapter2Routes;