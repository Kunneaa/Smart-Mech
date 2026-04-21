const PI = 3.141592653589;

class Chapter2 {
  cong_suat_truc_cong_tac = (f, v) => {
    return Number(f) * Number(v) / 1000;
  }

  hieu_suat_chung = (nk, nol, nbr, nx) => {
    let result = Number(nk) * Math.pow(Number(nol), 4) * Math.pow(Number(nbr), 3) * Number(nx);
    return Number(result.toFixed(12));
  }

  cong_suat_tuong_duong_truc_cong_tac = (Plv, T1_T, T2_T, t1, t2) => {
    let result = Number(Plv)* Math.sqrt((Math.pow(Number(T1_T), 2) * t1 + Math.pow(Number(T2_T), 2) * t2) / (Number(t1) + Number(t2)))
    return Number(result.toFixed(12));
  }

  cong_suat_can_thiet_tren_truc_dong_co = (Peq, n) => {
    let result = Number(Peq) / Number(n);
    return Number(result.toFixed(12));
  }

  so_vong_quay_truc_cong_tac = (v, D) => {
    let result = 60000 * v / (PI * D);
    return Number(result.toFixed(12));
  }

  so_vong_quay_so_bo = (nlv, usb) => {
    let result = Number(nlv) * Number(usb);
    return Number(result.toFixed(12));
  }

  ty_so_truyen_chung = (ndc, nlv) => {
    let result = Number(ndc) / Number(nlv);
    return Number(result.toFixed(12));
  }

  he_so_truyen_dong_hop = (uh) => {
    return Number(uh.toFixed(12));
  }

  he_so_truyen_cap_nhanh = (uh) => {
    const data = {
      6: 2.54, 
      8: 3.08, 
      10: 3.58,
      12: 4.05,
      14: 4.49,
      16: 4.91,
      18: 5.31,
      20: 5.69,
      22: 6.07,
      24: 6.42,
      26: 6.77,
      28: 7.12,
      30: 7.45,
    }
    return Number(data[uh]);
  }

  he_so_truyen_cap_cham = (uh) => {
    const data = {
      6: 2.36, 
      8: 2.60, 
      10: 2.79,
      12: 2.97,
      14: 3.12,
      16: 3.26,
      18: 3.39,
      20: 3.51,
      22: 3.63,
      24: 3.74,
      26: 3.84,
      28: 3.94,
      30: 4.03,
    }
    return Number(data[uh]);
  }

  he_so_truyen_dong_xich = (ty_so_truyen_chung, he_so_truyen_cap_nhanh, he_so_truyen_cap_cham) => {
    const result = Number(ty_so_truyen_chung) / (Number(he_so_truyen_cap_nhanh) * Number(he_so_truyen_cap_cham));
    return Number(result.toFixed(12));
  }

  Pbt = (Plv, eta_ol) => {
    const result = Number(Plv) / Number(eta_ol);
    return Number(result.toFixed(12));
  }

  P3 = (Pbt, eta_x, eta_ol) => {
    const result = Number(Pbt) / (Number(eta_x) * Number(eta_ol));
    return Number(result.toFixed(12));
  }

  P2 = (P3, eta_brt, eta_ol) => {
    const result = Number(P3) / (Number(eta_brt) * Number(eta_ol));
    return Number(result.toFixed(12));
  }

  P1 = (P2, eta_brt, eta_ol) => {
    const result = Number(P2) / (Number(eta_brt) * Number(eta_ol));
    return Number(result.toFixed(12));
  }

  Pm = (P1, eta_k) => {
    const result = Number(P1) / Number(eta_k);
    return Number(result.toFixed(12));
  }

  ndc = (ndc) => {
    return Number(ndc.toFixed(12));
  }

  n1 = (n1) => {
    return Number(n1.toFixed(12));
  }

  n2 = (n1, u1) => {
    const result = Number(n1) / Number (u1);
    return Number(result.toFixed(12));
  }

  n3 = (n2, u2) => {
    const result = Number(n2) / Number(u2);
    return Number(result.toFixed(12));
  }

  nbt = (n3, ux) => {
    const result = Number (n3) / Number(ux);
    return Number(result.toFixed(12));
  }

  T1_ti_so_truyen = (P1, n1) => {
    const result = (9.55 * Math.pow(10, 6) * Number(P1)) / Number(n1);
    return Number(result.toFixed(12));
  }

  Tm = (T1) => {
    return Number(T1.toFixed(12));
  }

  T2_ti_so_truyen = (P2, n2) => {
    const result = (9.55 * Math.pow(10, 6) * Number(P2)) / Number(n2);
    return Number(result.toFixed(12));
  }

  T3_ti_so_truyen = (P3, n3) => {
    const result = (9.55 * Math.pow(10, 6) * Number(P3)) / Number(n3);
    return Number(result.toFixed(12));
  }

  Tbt_ti_so_truyen = (Pbt, nbt) => {
    const result = (9.55 * Math.pow(10, 6) * Number(Pbt)) / Number(nbt);
    return Number(result.toFixed(12));
  }
}

module.exports = Chapter2;