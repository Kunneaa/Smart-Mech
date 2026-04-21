
class Chapter4 {
  ThoiGianPhucVu = (tg) => {
    return tg * 300 * 2 * 8;
  }

  UngSuatTiepXucChoPhep = (HB) => {
    return 2 * Number(HB) + 70;
  }

  UngSuatUonChoPhepBd = (HB) => {
    return 1.8 * Number(HB);
  }

  UngSuatTiepXuc_O_H = (o_Hlim1,KHL, SH) => {
    return (o_Hlim1*KHL)/SH;
  }

  UngSuatUon_O_F = (o_Flim,KFC,KFL, SF) => {
    return (o_Flim*KFC*KFL)/SF;
  }

  UngSuatTiepXucChoPhepCapNhanh = (o_H1,o_H2) => {
    return (o_H1 + o_H2)/2;
  }

  UngSuatTiepXucQuaTaiChoPhep = (sch2) => {
    return 2.8*sch2;
  }

  UngSuatUonQuaTaiChoPhep = (sch) => {
    return 0.8*sch;
  }


  SoCKThayDoiUsKhiThuTiepXuc = (HB) => {
    return 30 * Math.pow(HB, 2.4);
  }

  NHE1 = (c, Lg, n1, t1_t, t2_t, t1, t2) => {
    return 60 * c * Lg * n1 * (Math.pow(t1_t, 3) * t1 + Math.pow(t2_t, 3) * t2)/(t1 + t2);
  }

  NHE2 = (NHE1, u1) => {
    return NHE1/u1;
  }

  NFE1 = (c, Lg, n1, t1_t, t2_t, t1, t2, mF) => {
    return 60 * c * Lg * n1 * (Math.pow(t1_t, mF) * t1 + Math.pow(t2_t, mF) * t2)/(t1 + t2);
  }

  NFE2 = (NFE1, u1) => {
    return NFE1/u1;
  }

  Y_bd = (y_ba, u) => {
    return 0.53 *(u+1) *y_ba
  }

  KHB_cap_nhanh = (y_bd) => {
    let y_bd_lam_tron =  Math.round(y_bd * 10) / 10;
    const table = [
      { y_bd_lam_tron: 0.2, KHB: 1.02},
      { y_bd_lam_tron: 0.4, KHB: 1.05},
      { y_bd_lam_tron: 0.6, KHB: 1.07},
      { y_bd_lam_tron: 0.8, KHB: 1.12},
      { y_bd_lam_tron: 1,   KHB: 1.15},
      { y_bd_lam_tron: 1.2, KHB: 1.2},
      { y_bd_lam_tron: 1.4, KHB: 1.24},
      { y_bd_lam_tron: 1.6, KHB: 1.28}
  ];
    const row = table.find(entry => entry.y_bd_lam_tron === y_bd_lam_tron);
    return row.KHB;
  }

  aw1_so_bo = (Ka, u, T1, KHB, o_H, y_ba ) =>{
    return Ka *(u+1) *Math.cbrt((T1*KHB)/(2*Math.pow(o_H,2)*u*y_ba));
  }

  Y_ba_cap_cham = (y_ba) =>{
    let y_ba_cap_cham = y_ba+0.3*y_ba;
    return Math.round(y_ba_cap_cham * 10) / 10;
  }

  KHB_cap_cham = (y_bd) => {
    let y_bd_lam_tron =  Math.round(y_bd * 10) / 10;
    const table = [
      { y_bd_lam_tron: 0.2, KHB: 1.0},
      { y_bd_lam_tron: 0.4, KHB: 1.01},
      { y_bd_lam_tron: 0.6, KHB: 1.02},
      { y_bd_lam_tron: 0.8, KHB: 1.02},
      { y_bd_lam_tron: 1,   KHB: 1.03},
      { y_bd_lam_tron: 1.2, KHB: 1.04},
      { y_bd_lam_tron: 1.4, KHB: 1.05},
      { y_bd_lam_tron: 1.6, KHB: 1.06}
  ];
    const row = table.find(entry => entry.y_bd_lam_tron === y_bd_lam_tron);
    return row.KHB;
  }

  module_1 = (aw) => {
    return 0.01*aw;
  }
  module_2 = (aw) => {
    return 0.02*aw;
  }

  z1 = (goc, aw, m, u) => {
    const angleRad = goc * Math.PI / 180;
    return Math.round((2*aw*Math.cos(angleRad))/(m*(u+1)));
  }

  z2 = (u, z1) => {
    return Math.round(z1*u);
  }

  cos_goc_B = (z1, z2, aw, m) => {
    return (m*(z1 + z2))/(2*aw);
  }

  tinh_goc_B = (z1, z2, aw, m) => {
    const goc_B = (m*(z1 + z2))/(2*aw);
    const goc_B_radian =  Math.acos(goc_B);
    return  goc_B_radian * 180 / Math.PI;
  }

  ti_so_thuc = (z1, z2) => {
    return z2/z1;
  }

  KhoangCachTrucChia = (m, z1, z2, cosb) => {
    return 0.5*m*(z1+z2)/cosb;
  }

  ChieuRongVanhRang = (y_ba, a_w1) => {
    return y_ba * a_w1;
  }

  d1 = (m, z1, cosB) => {
    return (m * z1) / cosB;
  }

  dw = (d1, y, z1, z2) => {
    return d1 * (1 + (2 * y) / (z1 + z2));
  }

  DuongKinhDinhRang = (d, m) => {
    return d + 2*m;
  }

  DuongKinhCoSo = (d, alpha) => {
    return d * Math.cos(alpha * Math.PI / 180);
  }

  DuongKinhDayRang = (d, m) => {
    return d - 2.5 * m
  }

  GocProfinRang = (alpha, cosB) => {
    const degToRad = Math.PI / 180;
    const radToDeg = 180 / Math.PI;
    const at = (Math.atan(Math.tan(alpha * degToRad) / cosB));
    return at * radToDeg;
  }

  GocAnKhop = (a, at, aw) => {
    const degToRad = Math.PI / 180;
    const radToDeg = 180 / Math.PI;
    const atw = Math.acos(a * Math.cos(at * degToRad) / aw); 
    return atw * radToDeg;
  }

  Tanb_b = (alpha_t, beta) => {
    return Math.cos(alpha_t * Math.PI / 180) * Math.tan(beta * Math.PI / 180);
  }

  Beta_b = (tanb_b) => {
    return Math.atan(tanb_b) * 180 / Math.PI;
  }

  Tana = (alpha) => {
    return Math.tan(alpha * Math.PI / 180);
  }

  Cosb_b = (beta_b) => {
    return Math.cos(beta_b * Math.PI / 180);
  }

  Sin2atw = (goc_an_khop) => {
    return Math.sin(2 * goc_an_khop * Math.PI / 180);
  }

  g_o = (m) => {
    if (m <= 3.55) 
        return 73;
    else 
        return 82;
  }

  HeSoKeDenBeMatTiepXuc = (cosb_b, sin2atw) => {
    return Math.sqrt(2 * cosb_b / sin2atw);
  }

  HeSoTrungKhopDoc = (bw, beta, m) => {
    return bw * Math.sin(beta * Math.PI / 180) / (Math.PI * m);
  }

  HeSoTrungKhopNgang = (z1, z2, cos_beta) => {
    return (1.88 - 3.2 *(1/z1 + 1/z2)) * cos_beta;
  }

  HeSoKeDenTrungKhopRangCapNhanh = (ea) => {
    return Math.sqrt(1/ea);
  }

  HeSoKeDenTrungKhopRangCapCham = (ea) => {
    return Math.sqrt((4-ea)/3);
  }

  DuongKinhVongLanBanhNho = (aw1, u) => {
    return 2*aw1/(u+1);
  }

  VanTocVong = (dw1, n) => {
    return (Math.PI * dw1 * n)/60000;
  }

  HeSoCacDoiRang = (v) => {
    if (v<= 2.5) 
        return 1.13; 
    else return 1.16;
  }

  HeSoTrenChieuRongVanhRangCapNhanh = (y_bd) => {
    const y_bd_fixed = Math.round(y_bd * 10) / 10;
    const data = {
        0.2 : 1.02,
        0.4 : 1.05,
        0.6 : 1.07,
        0.8 : 1.12, 
        1 : 1.15,
        1.2 : 1.2, 
        1.4 : 1.24, 
        1.6 : 1.28
    }
    return Number(data[y_bd_fixed])
  }

  HeSoTrenChieuRongVanhRangCapCham = (y_bd) => {
    const y_bd_fixed = Math.round(y_bd * 10) / 10;
    const data = {
        0.2 : 1.0,
        0.4 : 1.01,
        0.6 : 1.02,
        0.8 : 1.02, 
        1 : 1.03,
        1.2 : 1.04, 
        1.4 : 1.05, 
        1.6 : 1.06
    }
    return Number(data[y_bd_fixed])
  }

  v_H = (dH,g_o, v, aw1, u) => {
    return dH * g_o * v * Math.sqrt(aw1/u);
  }

  HeSoTaiTrongVungAnKhop = (v_H, bw, dw1, T1, K_Hb, K_Ha) => {
    return 1 + (v_H * bw * dw1) / (2 * T1 * K_Hb * K_Ha);
  }

  HeSoTaiTrongTiepXuc = (K_Hb, K_Ha, K_Hv) => {
    return K_Hb * K_Ha * K_Hv
  }

  UngSuatTiepXucOMatRang = (ZM, ZH, ZE, T1, KH, u, bw, dw1) => {
    return ZM * ZH * ZE * Math.sqrt((2 * T1 * KH * (u + 1)) / (bw * u * Math.pow(dw1, 2)));
  }

  sH_cuoi = (UngSuatTiepXuc_O_H, ZV, KxH, ZR) => {
    return UngSuatTiepXuc_O_H * ZV * KxH * ZR;
  }

  KfbCapNhanh = (psi_bd) => {
    const table = [
      { psi: 0.2, value: 1.17 },
      { psi: 0.4, value: 1.21 },
      { psi: 0.6, value: 1.17 },
      { psi: 0.8, value: 1.12 },
      { psi: 1.0, value: 1.06 },
      { psi: 1.2, value: 1.01 },
      { psi: 1.4, value: 1.05 },
      { psi: 1.6, value: 1.07 }
    ];
  
    for (let i = table.length - 1; i >= 0; i--) {
      if (psi_bd >= table[i].psi) {
        return table[i].value;
      }
    }
  }

  KfbCapCham = (psi_bd) => {
    const psi_bd_fixed = Math.round(psi_bd * 10) / 10;
    const table = [
      { psi: 0.2, value: 1.01 },
      { psi: 0.4, value: 1.03 },
      { psi: 0.6, value: 1.05 },
      { psi: 0.8, value: 1.03 },
      { psi: 1.0, value: 1.01 },
      { psi: 1.2, value: 1.06 },
      { psi: 1.4, value: 1.10 },
      { psi: 1.6, value: 1.15 }
    ];
  
    for (let i = table.length - 1; i >= 0; i--) {
      if (psi_bd_fixed >= table[i].psi) {
        return table[i].value;
      }
    }
  }

  Kfa = (v) => {
    const table = [
      { v: 2.5, Kfa: 1.37 },
      { v: 5,   Kfa: 1.40 },
    ];
  
    for (let row of table) {
      if (v <= row.v) {
        return row.Kfa ?? "N/A"; 
      }
    }
  }

  Vf = (dF, go, v, aw1, um) => {
    return dF * go * v * Math.sqrt(aw1 / um);
  } 

  Kfv = (Vf, bw, dw1, T1, Kfb, Kfa) => {
    return 1 + ((Vf * bw * dw1) / (2 * T1 * Kfb * Kfa));
  }

  KF = (Kfb, Kfa, Kfv) => {
    return Kfb * Kfa * Kfv;
  }

  Ye = (ea) => {
    return 1 / ea;
  }

  Yb = (B) => {
    return 1 - B / 140;
  }

  Zv1 = (z1, cosB) => {
    return z1 / Math.pow(cosB, 3);
  }

  YF = (zv) => {
    const table = [
      { zv: 17, YF: 4.26 },
      { zv: 20, YF: 4.08 },
      { zv: 22, YF: 4 },
      { zv: 25, YF: 3.9 },
      { zv: 30, YF: 3.8 },
      { zv: 40, YF: 3.7 },
      { zv: 50, YF: 3.65 },
      { zv: 60, YF: 3.62 },
      { zv: 80, YF: 3.61 },
      { zv: 100, YF: 3.6 },
      { zv: 150, YF: 3.6 }
    ];
  
    const filtered = table.filter(entry => entry.zv <= zv);
    if (filtered.length === 0) return "Out of range";

    const result = filtered.reduce((max, entry) => entry.zv > max.zv ? entry : max);
    return result.YF;
  }

  Ys = (m) => {
    return 1.08 - 0.0695 * Math.log(m);
  }

    sF1 = (T1, KF, Ye, Yb, YF1, bw, dw1, m) => {
    return (2 * T1 * KF * Ye * Yb * YF1) / (bw * dw1 * m);
  }

  sF2 = (sF1, YF2, YF1) => {
    return (sF1 * YF2) / (YF1);
  }

  UngSuatUonChoPhep = (oF, YR, Ys, KxF) => {
    return oF * YR * Ys * KxF;
  }

  sHmax = (sH, Kqt) => {
    return sH * Math.sqrt(Kqt);
  }

  sF1max = (sF1, Kqt) => {
    return sF1 * Kqt;
  }

  sF2max = (sF2, Kqt) => {
    return sF2 * Kqt;
  }
}

module.exports = Chapter4;