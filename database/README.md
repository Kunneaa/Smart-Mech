# Database

Thu muc nay chua catalog Monitor va tai lieu mo ta du lieu dang dung voi backend MongoDB.

## Trang thai hien tai

- Backend dang doc du lieu tu MongoDB.
- Monitor la catalog dong co chinh cho Chapter 2.
- `database/monitor.js` va `database/monitor.json` phai giu cung schema.

## Schema Monitor

Moi record Monitor co cac truong:

- `id` bat dau tu `0`
- `cong_suat`
- `kieu_dong_co`
- `loai_dong_co`
- `van_toc_vong_quay`
- `hieu_suat_dong_co_dien`
- `he_so_cong_suat`
- `ti_so_dong_khoi_dong`
- `ti_so_momen_khoi_dong`
- `khoi_luong`

## Quy tac cap nhat

Khi cap nhat catalog:

1. Sua `database/monitor.js` truoc.
2. Sinh lai `database/monitor.json` tu cung nguon du lieu.
3. Khong doi gia tri record neu chi can chuan hoa schema.

## Lien ket backend

- Chapter 2 goi `Monitor` de lay danh sach goi y.
- Backend luu `monitor_id` trong `HistoryRecord` khi user chon monitor.
- API cu `engine` van duoc giu nhung chi la alias tuong thich nguoc.

## Kiem tra nhanh

```bash
node -e "const monitor=require('./monitor'); console.log(monitor.length, monitor[0])"
```
