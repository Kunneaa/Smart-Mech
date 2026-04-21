const PI = 3.141592653589;

class Chapter3 {
  Z1 = (ux) => {
    let result = 29 - 2 * Number(ux);
    return result;
  };
  
  Z2 = (ux, z1) => {
    let result = Number(ux) * Number(z1);
    return Math.round(result);
  };
  
  kz = (Z01, Z1) => {
    let result = Number(Z01) / Number(Z1);
    return result;
  }
  
  kn = (n01, n3) => {
    let result = Number(n01) / Number(n3);
    return result;
  }
  
  k = (k0, ka, kdc, kbt, kd, kc) => {
    let result = Number(k0) * Number(ka) * Number(kdc) * Number(kbt) * Number(kd) * Number(kc);
    return result;
  }
  
  cong_suat_tinh_toan = (P3, k, kz, kn) => {
    let result = Number(P3) * Number(k) * Number(kz) * Number(kn);
    return result;
  }
  
  cong_suat_cho_phep = (n01, Pt) => {
    const powerTable = {
        50:    [0.19, 0.35, 0.45, 0.57, 0.75, 1.41, 3.20, 3.93, 9.30, 30.4, 14.7, 22.9],
        200:   [0.68, 1.27, 1.61, 2.06, 2.70, 4.80, 11.0, 13.9, 32.0, 38.4, 43.7, 68.1],
        400:   [1.23, 2.29, 2.91, 3.72, 4.86, 8.48, 19.0, 24.6, 49.3, 57.7, 70.6, 110],
        600:   [1.68, 3.13, 3.98, 5.26, 6.26, 11.4, 25.7, 32.0, 54.9, 75.7, 88.3, 138],
        800:   [2.06, 3.86, 4.90, 6.26, 7.34, 13.6, 30.7, 37.0, 63.0, 88.9, 101, 157],
        1000:  [2.42, 4.52, 5.74, 7.34, 8.82, 15.3, 34.7, 42.0, 73.0, 99.2, "-", "-"],
        1200:  [2.72, 5.06, 6.43, 8.22, 9.65, 16.8, 38.3, 46.0, 85.0, 108, "-", "-"],
        1600:  [3.20, 5.95, 7.55, 9.65, 12.7, "-", 43.8, "-", "-", "-", "-", "-"]
    };
  
    let powerValues = powerTable[n01];
    let result = powerValues.find(P => P !== "-" && P >= Pt);
    return result;
  }
  
  buoc_xich = (n01, P) => {
    const table = [
      { p: 12.7,  values: { 50: 0.19, 200: 0.68, 400: 1.23, 600: 1.68, 800: 2.06, 1000: 2.42, 1200: 2.72, 1600: 3.20 } },
      { p: 12.7,  values: { 50: 0.35, 200: 1.27, 400: 2.29, 600: 3.13, 800: 3.86, 1000: 4.52, 1200: 5.06, 1600: 5.95 } },
      { p: 12.7,  values: { 50: 0.45, 200: 1.61, 400: 2.91, 600: 3.98, 800: 4.90, 1000: 5.74, 1200: 6.43, 1600: 7.55 } },
      { p: 15.875, values: { 50: 0.57, 200: 2.06, 400: 3.72, 600: 5.26, 800: 6.26, 1000: 7.34, 1200: 8.22, 1600: 9.65 } },
      { p: 15.875, values: { 50: 0.75, 200: 2.70, 400: 4.86, 600: 6.26, 800: 7.34, 1000: 8.82, 1200: 9.65, 1600: 12.7 } },
      { p: 19.05,  values: { 50: 1.41, 200: 4.80, 400: 8.48, 600: 11.4, 800: 13.6, 1000: 15.3, 1200: 16.8 } },
      { p: 25.4,   values: { 50: 3.20, 200: 11.0, 400: 19.0, 600: 25.7, 800: 30.7, 1000: 34.7, 1200: 38.3, 1600: 43.8 } },
      { p: 31.75,  values: { 50: 3.93, 200: 13.9, 400: 24.6, 600: 32.0, 800: 37.0, 1000: 42.0, 1200: 46.0 } },
      { p: 38.1,   values: { 50: 9.30, 200: 32.0, 400: 49.3, 600: 54.9, 800: 63.0, 1000: 73.0, 1200: 85.0 } },
      { p: 44.45,  values: { 50: 30.4, 200: 38.4, 400: 57.7, 600: 75.7, 800: 88.9, 1000: 99.2 } },
      { p: 50.8,   values: { 50: 14.7, 200: 43.7, 400: 70.6, 600: 88.3, 800: 101 } },
      { p: 50.8,   values: { 50: 22.9, 200: 68.1, 400: 110, 600: 138, 800: 157 } }
    ];
  
    const row = table.find(entry => entry.values[n01] === P);
    return row.p;
  }
  
  khoang_cach_truc = (p) => {
    let result = 40 * Number(p);
    return result;
  }
  
  so_mat_xich = (a, p, Z1, Z2) => {
    let term1 = (2 * Number(a)) / Number(p);
    let term2 = (Number(Z1) + Number(Z2)) / 2;
    let term3 = ((Number(Z1) - Number(Z2)) ** 2 * Number(p)) / (4 * (PI ** 2) * a);
  
    let result = term1 + term2 + term3;
    return Math.round(result);
  }
  
  tinh_lai_khoang_cach_truc = (p, xc, Z1, Z2) => {
    let term1 = xc - (Number(Z2) + Number(Z1)) / 2;
    let term2 = Math.sqrt(Math.pow(term1, 2) - (2 * Math.pow(Number(Z2) - Number(Z1), 2)) / (PI ** 2));
  
    let result = 0.25 * Number(p) * (term1 + term2);
    return result;
  }
  
  delta_a = (Da, a_star) =>{
    let result = Number(Da) * Number(a_star);
    return result;
  }
  
  a = (a_star, del_a) => {
    let result = Number(a_star) - Number(del_a);
    return result;
  }
  
  so_lan_va_dap_cua_xich = (Z1, n3, xc) =>{
    let result = Number(Z1) * (Number(n3) / (15 * Number(xc)));
    return result;
  }
  
  tai_trong_pha_hong = (p) =>{
    const table = [
        { p: 8,     Q: 4.6},
        { p: 9.525, Q: 9.1},
        { p: 12.7,  Q: 8.7},
        { p: 12.7,  Q: 9.0},
        { p: 12.7,  Q: 9.0},
        { p: 12.7,  Q: 18.2},
        { p: 15.875, Q: 22.7},
        { p: 15.875, Q: 22.7},
        { p: 19.05,  Q: 31.8},
        { p: 25.4,   Q: 56.7},
        { p: 31.75,  Q: 88.5},
        { p: 38.1,   Q: 127.0},
        { p: 44.45,  Q: 172.4},
        { p: 50.8,   Q: 226.8},
        { p: 63.5,   Q: 353.8}
    ];
    const row = table.find(entry => entry.p === p);
    return row.Q * 1000;
  }
  
  khoi_luong_1m_xich = (p) =>{
    const table = [
      { p: 8,     q: 0.2 },
      { p: 9.525, q: 0.45 },
      { p: 12.7,  q: 0.3 },
      { p: 12.7,  q: 0.35 },
      { p: 12.7,  q: 0.35 },
      { p: 12.7,  q: 0.7 },
      { p: 15.875, q: 1.1 },
      { p: 15.875, q: 1.2 },
      { p: 19.05,  q: 1.8 },
      { p: 25.4,   q: 3.5 },
      { p: 31.75,  q: 5.4 },
      { p: 38.1,   q: 7.5 },
      { p: 44.45,  q: 7.5 },
      { p: 50.8,   q: 9.7 },
      { p: 63.5,   q: 16.0 }
    ];
    const row = table.find(entry => entry.p === p);
    return row.q;
  }
  
  v = (Z1, p, n3) =>{
    let result = (Number(Z1) * Number(p) * Number(n3)) / 60000;
    return result;
  }
  
  Ft = (P3, v) =>{
    let result = (1000 * Number(P3)) / Number(v);
    return result;
  }
  
  Fv = (q, v) =>{
    let result = Number(q) * Number(v) ** 2;
    return result;
  }
  
  F0 = (kf, q, a) => {
    let result = (9.81 * Number(kf) * Number(q) * Number(a)) / 1000;
    return result;
  };
  
  he_so_an_toan = (Q, kd, Ft, F0, Fv) =>{
    let term1 = (Number(kd) * Number(Ft)) + Number(F0) + Number(Fv);
    let result = Number(Q) / term1;
    return result;
  }
  
  d1 = (p, Z01) => {
    let result = (Number(p)/Math.sin(PI/Z01));
    return Number(result.toFixed(12));
  }
  
  d2 = (p, Z2) => {
    let result = (Number(p)/Math.sin(PI/Z2));
    return Number(result.toFixed(12));
  }
  
  da1 = (p, Z01) => {
    let result = Number(p)* (0.5 + (1/Math.tan(PI/Z01)));
    return Number(result.toFixed(12));
  }
  
  da2 = (p, Z2) => {
    let result = Number(p)* (0.5 + (1/Math.tan(PI/Z2)));
    return Number(result.toFixed(12));
  }
  
  d1_chon_bang = (p) => {
    const table = [
      { p: 8,     d1_chon_bang: 5.0 },
      { p: 9.525, d1_chon_bang: 6.35 },
      { p: 12.7,  d1_chon_bang: 7.75 },
      { p: 12.7,  d1_chon_bang: 7.75 },
      { p: 12.7,  d1_chon_bang: 8.51 },
      { p: 12.7,  d1_chon_bang: 8.51 },
      { p: 15.875, d1_chon_bang: 10.16 },
      { p: 15.875, d1_chon_bang: 10.16 },
      { p: 19.05,  d1_chon_bang: 11.91},
      { p: 25.4,   d1_chon_bang: 15.88 },
      { p: 31.75,  d1_chon_bang: 19.05 },
      { p: 38.1,   d1_chon_bang: 22.23 },
      { p: 44.45,  d1_chon_bang: 25.70 },
      { p: 50.8,   d1_chon_bang: 28.58 },
      { p: 63.5,   d1_chon_bang: 39.68 }
    ];
    const row = table.find(entry => entry.p === p);
    return row.d1_chon_bang;
  }
  
  r = (d1_chon_bang) => {
    let result = 0.5025*Number(d1_chon_bang) + 0.05;
    return Number(result.toFixed(12));
  }
  
  df1 = (d1, r) => {
    let result = Number(d1) - 2*Number(r);
    return Number(result.toFixed(12));
  }
  
  df2 = (d2, r) => {
    let result = Number(d2) - 2*Number(r);
    return Number(result.toFixed(12));
  }

  kr = (z) => {
    const data = [
      { Z: 15, kr: 0.59 },
      { Z: 20, kr: 0.48 },
      { Z: 30, kr: 0.36 },
      { Z: 40, kr: 0.29 },
      { Z: 50, kr: 0.24 },
      { Z: 60, kr: 0.22 }
    ];

    for(let i = 0; i < data.length - 1; i++)  {
      const Z1 = data[i].Z;
      const Z2 = data[i + 1].Z;
      const k1 = data[i].kr;
      const k2 = data[i + 1].kr;

      if (z >= Z1 && z <= Z2) {
        const kr = k1 + ((z - Z1) / (Z2 - Z1)) * (k2 - k1);
        return parseFloat(kr.toFixed(2));
      }
    }
  }
  
  Fvd = (n3, p) => {
    let result = 13*Math.pow(10,-7)*Number(n3)*Math.pow(Number(p),3) *1;
    return Number(result.toFixed(12));
  }
  
  A_dt = (p) => {
    const table = [
      { p: 8,     A_dt: 11 },
      { p: 9.525, A_dt: 28 },
      { p: 12.7,  A_dt: 39.6 },
      { p: 15.875, A_dt: 51.5 },
      { p: 19.05,  A_dt: 106},
      { p: 25.4,   A_dt: 180 },
      { p: 31.75,  A_dt: 262 },
      { p: 38.1,   A_dt: 395 },
      { p: 44.45,  A_dt: 473 },
      { p: 50.8,   A_dt: 645 }
    ];
    const row = table.find(entry => entry.p === p);
    return row.A_dt;
  }
  
  Fr = (Ft) => {
    let result = 1.05 * Number(Ft);
    return Number(result.toFixed(12));
  }
  
  oH1 = (kr1, kd, Ft, Fvd, A_dt) => {
    let tu = Number(kr1)*(Number(Ft)*Number(kd) + Number(Fvd)) * 2.1*Math.pow(10,5)
    let result = 0.47 * Math.sqrt(tu/Number(A_dt)*1)
    return Number(result.toFixed(12));
  }
  
  oH2 = (kr2, kd, Ft, Fvd, A_dt) => {
    let tu = Number(kr2) *(Number(Ft)*Number(kd) + Number(Fvd)) * 2.1*Math.pow(10,5)
    let result = 0.47 * Math.sqrt(tu/Number(A_dt)*1)
    return Number(result.toFixed(12));
  }
}

module.exports = Chapter3