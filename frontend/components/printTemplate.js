// printTemplate.js

const generateHtml = (SelectMaterial, RenderData, Table1, Table2, Table3) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>REPORT</title>
  <style>
    @page {
      margin: 0
      size: A4
    }
    body {
    -webkit-print-color-adjust: exact; /* Cho Chrome */
    print-color-adjust: exact;         /* Cho Firefox */
    background: white;
  }
    body {
      font-family: 'Times New Roman', Times, serif;
      margin: 0;
      padding: 0;
    }

    .a4-container {
      width: 210mm;
      padding-left: 5mm;
      padding-right: 5mm;
      padding-top: 0mm;
      margin: auto;
      background: white;
    }

    caption .sub-caption {
      font-size: 12px;
      text-transform: none; /* Giữ chữ thường */
    }

    h3 {
      font-size: 16px;
      margin-bottom: 12px;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }

    h4 {
      font-size: 14px;
      margin: 12px 0 6px;
      font-weight: bold;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
      font-size: 13px;
    }

    caption {
      caption-side: top;
      background-color: #fae6df;  
      border: 1px solid red;
      border-bottom: none;
      font-size: 16px;
      font-weight: bold;
      padding: 8px 0;
      text-transform: uppercase;
    }

    th, td {
      border: 1px solid #000;
      padding: 6px 10px;
      vertical-align: middle;
    }

    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }

    td.left-align {
      text-align: left;
    }

    .fraction {
      display: inline-block;
      text-align: center;
      font-style: italic;
    }
    .fraction .top {
      display: block;
      border-bottom: 1px solid #000;
    }
    .fraction .bottom {
      display: block;
    }
  </style>
</head>

<body>
  <div class="a4-container">
    <h3>Thông tin hộp giảm tốc hai cấp phân đôi</h3>
    <div class="chapter_container">
      <table style="margin-top: 10px;">
        <caption>I – ĐỘNG CƠ</caption>
        <thead>
          <tr>
            <th>Kiểu động cơ</th>
            <th>Công suất</th>
            <th>Vận tốc quay (vòng/phút)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span>${RenderData?.monitor?.kieu_dong_co}</span></td>
            <td><span>${RenderData?.monitor?.cong_suat}</span> kW</td>
            <td><span>${RenderData?.monitor?.van_toc_vong_quay}</span> vg/ph</td>
          </tr>
        </tbody>
      </table>
      <table>
        <caption>
          II - BỘ TRUYỀN HỞ - XÍCH <br>
          <span class="sub-caption">
            Loại xích: <span>${SelectMaterial?.material}</span> Nhiệt luyện: <span>${SelectMaterial?.heatTreatment}</span> Số mắt xích: <span>${RenderData?.chapter3?.so_mat_xich}</span>
          </span>
        </caption>
        <thead>
            <tr>
                <th rowspan="2">Loại trụ</th>
                <th colspan="2">Đường kính ngoài</th>
                <th colspan="2">Số răng</th>
                <th rowspan="2">Khoảng cách trục (a)</th>
            </tr>
            <tr>
              <th>bánh răng 1 (da₁)</th>
              <th>bánh răng 2 (da₂)</th>
              <th>bánh răng 1 (Z₁)</th>
              <th>bánh răng 2 (Z₂)</th>
            </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trụ nghiêng</td>
            <td><span>${Number(RenderData?.tinhToanNhanh?.duong_kinh_dinh_rang_da1).toFixed(4)}</span>mm</td>
            <td><span>${Number(RenderData?.tinhToanNhanh?.duong_kinh_dinh_rang_da2).toFixed(4)}</span>mm</td>
            <td>${RenderData?.tinhToanNhanh?.z1}</td><td>${RenderData?.tinhToanNhanh?.z2}</td>
            <td><span>${RenderData?.tinhToanNhanh?.khoangCachNghieng}</span>mm</td>
          </tr>
          <tr>
            <td>Trụ thẳng</td>
            <td><span>${Number(RenderData?.tinhToanCham?.duong_kinh_dinh_rang_da1).toFixed(4)}</span>mm</td>
            <td><span>${Number(RenderData?.tinhToanCham?.duong_kinh_dinh_rang_da2).toFixed(4)}</span>mm</td>
            <td>${RenderData?.tinhToanCham?.z1}</td><td>${RenderData?.tinhToanCham?.z2}</td>
            <td><span>${RenderData?.tinhToanCham?.khoangCachThang}</span>mm</td>
          </tr>
        </tbody>
      </table>
      <table>
        <caption>III - TRỤC</caption>
        <thead>
          <tr>
            <th>Trục</th>
            <th>Vị trí</th>
            <th>Đường kính</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="2">I</td>
            <td class="left-align">1C</td>
            <td><span></span>${Table1[4][3]}mm</td>
          </tr>
          <tr>
            <td class="left-align">1E</td>
            <td><span></span>${Table1[4][5]}mm</td>
          </tr>
          <tr>
            <td rowspan="2">II</td>
            <td class="left-align">2B</td>
            <td><span></span>${Table2[4][2]}mm</td>
          </tr>
          <tr>
            <td class="left-align">2C</td>
            <td><span></span>${Table2[4][3]}mm</td>
          </tr>
          <tr>
            <td rowspan="2">III</td>
            <td class="left-align">3A</td>
            <td><span></span>${Table3[4][2]}mm</td>
          </tr>
          <tr>
            <td class="left-align">3C</td>
            <td><span></span>${Table3[4][3]}mm</td>
          </tr>
        </tbody>
      </table>
      <table>
        <caption>IV - THEN</caption>
        <thead>
          <tr>
            <th rowspan="2">Trục</th>
            <th rowspan="2">Chi tiết</th>
            <th colspan="2">Kích thước</th>
            <th colspan="2">Kích thước tiết diện then</th>
          </tr>
          <tr>
            <th>lm</th>
            <th>lt</th>
            <th>b</th>
            <th>h</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="3">I</td>
            <td class="left-align">bánh răng 1</td>
            <td colspan="1">48</td>
            <td colspan="1">38.4</td>
            <td colspan="1">10</td>
            <td colspan="1">8</td>
          </tr>
          <tr>
            <td class="left-align">bánh răng 2</td>
            <td colspan="1">48</td>
            <td colspan="1">38.4</td>
            <td colspan="1">10</td>
            <td colspan="1">8</td>
          </tr>
          <tr>
            <td class="left-align">khớp nối</td>
            <td colspan="1">60</td>
            <td colspan="1">54</td>
            <td colspan="1">8</td>
            <td colspan="1">7</td>
          </tr>
          <tr>
            <td rowspan="3">II</td>
            <td class="left-align">nhanh</td>
            <td colspan="1">75</td>
            <td colspan="1">67.5</td>
            <td colspan="1">14</td>
            <td colspan="1">9</td>
          </tr>
          <tr>
            <td class="left-align">chậm</td>
            <td colspan="1">86</td>
            <td colspan="1">77.4</td>
            <td colspan="1">18</td>
            <td colspan="1">11</td>
          </tr>
          <tr>
            <td class="left-align">nhanh</td>
            <td colspan="1">75</td>
            <td colspan="1">67.5</td>
            <td colspan="1">14</td>
            <td colspan="1">9</td>
          </tr>
          <tr>
            <td rowspan="2">III</td>
            <td class="left-align">xích</td>
            <td colspan="1">95</td>
            <td colspan="1">85.5</td>
            <td colspan="1">18</td>
            <td colspan="1">11</td>
          </tr>
          <tr style="margin-bottom: 20px;">
            <td class="left-align">chậm</td>
            <td colspan="1">97.5</td>
            <td colspan="1">87.75</td>
            <td colspan="1">20</td>
            <td colspan="1">12</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</body>
</html>
`;

export default generateHtml;
