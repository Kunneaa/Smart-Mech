
class Chapter5 {

    duong_kinh_so_bo_truc_d1 = (T, us_xoan) => {
        const d = Math.cbrt(T/(2*0.2 *us_xoan));
        return Math.ceil(d / 5) * 5;
    }

    duong_kinh_so_bo_truc = (T, us_xoan) => {
        const d = Math.cbrt(T/(0.2 *us_xoan));
        return Math.ceil(d / 5) * 5;
    }

    chieu_rong_o_lan = (d) => {
        const table = [
            { d: 20, bo: 15},
            { d: 25, bo: 17},
            { d: 30, bo: 19},
            { d: 35, bo: 21},
            { d: 40, bo: 23},
            { d: 45, bo: 25},
            { d: 50, bo: 27},
            { d: 55, bo: 29},
            { d: 60, bo: 31},
            { d: 65, bo: 33},
            { d: 70, bo: 35},
            { d: 75, bo: 37},
            { d: 80, bo: 39},
            { d: 85, bo: 41},
            { d: 90, bo: 43},
            { d: 100, bo: 47}
        ];
    const numericD = Number(d);
    if (!Number.isFinite(numericD) || numericD <= 0) {
        return null;
    }

    // Pick the first standard diameter that is >= requested value; clamp to largest row if needed.
    const row = table.find((entry) => entry.d >= numericD) || table[table.length - 1];
    return row ? row.bo : null;
    }

    chieu_dai_nua_khoi_noi_mayo = (d) => {
        return d*2;
    } 

    lmd_min = (d) => {
        return 1.2 * d;
    }

    lmd_max = (d) => {
        return 1.5 * d;
    }

    lm = (d) => {
        return 1.5 * d;
    }

    l22 = (lm22, bo2, k1, k2) => {
        return ((lm22+bo2)/2) + k1 + k2;
    }

    l23 = (l22, lm22, lm23, k1) => {
        return l22 + ((lm22 + lm23)/2) + k1;
    }

    l24 = (l23, l22) => {
        return 2*l23 - l22; 
    }

    l21 = (l23) => {
        return 2*l23; 
    }

    l12 = (lm12, bo1, k3, h_n) => {
        return ((lm12+bo1)/2) + k3 + h_n;
    }

    l33 = (lm33, bo3, l31, k3, h_n) => {
        return ((lm33 + bo3)/2) + l31 + k3 + h_n;
    }
}

module.exports = Chapter5;