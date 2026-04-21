# Component Data Sources

Tai lieu nay mo ta nguon du lieu dang dung voi backend hien tai.

## 1) Trang thai hien tai

- Catalog dong co chinh la `Monitor`.
- Du lieu local trong repo nam o `database/monitor.js` va `database/monitor.json`.
- Backend Chapter 2 doc catalog nay qua Mongo adapter.

## 2) Mapping du lieu -> backend

Backend Chapter 2 can cac truong chinh:

- `id`
- `kieu_dong_co`
- `cong_suat`
- `van_toc_vong_quay`

Filter chon monitor:

- `cong_suat >= cong_suat_can_thiet_tren_truc_dong_co`
- `van_toc_vong_quay >= so_vong_quay_so_bo`

## 3) Quy tac cap nhat du lieu

Khi bo sung/sua catalog:

1. Cap nhat `database/monitor.js`.
2. Sinh lai `database/monitor.json` tu cung nguon.
3. Khong doi gia tri record neu chi can chuan hoa schema.

## 4) Luu y

- `id` bat dau tu `0`.
- `createAt` da duoc loai bo khoi schema export de backend chi giu cac truong can thiet.
- Alias `engine` chi con de tuong thich nguoc trong mot so response.
