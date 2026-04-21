# SmartMech Designer API Specification

Tài liệu này mô tả API backend đang chạy thực tế trong `backend/`.

## 1) Base URL

- Local: `http://localhost:3000`

## 2) Co che dinh danh hien tai

- Đăng nhập trả JWT token (`POST /Users/Login`).
- Nhiều endpoint hiện dùng token/id ngay trong path param (`:userid`, `:recordid`).
- Chưa dùng chuẩn Bearer token đồng nhất ở tất cả endpoint.

## 3) Auth/User APIs

### GET /health

- Mục đích: kiểm tra backend service còn sống.
- Thành công: `200` + `{ status: "ok", service: "smart-mech-backend" }`

### POST /Users

- Mục đích: đăng ký user vào MongoDB collection `User`.

### POST /Users/Login

- Mục đích: đăng nhập và lấy JWT.

### GET /getuser/:userid

- Mục đích: decode token và lấy thông tin user.

## 4) Chapter APIs

### Chapter 2

- `POST /chapter2/:userid/:recordid?`
  - Tinh chapter 2.
  - Tao moi hoac cap nhat theo `recordid`.
  - Tra danh sach monitor goi y trong `monitor_list`.
- `GET /chapter2/:recordid`
  - Lay du lieu chapter 2 theo record.
- `POST /chapter2/update/monitor/:record_id`
  - Chot monitor va cap nhat phan phoi truyen.
  - Validate `selectMonitorID` trong body, chap nhan alias `selectEngineID`.
  - Tra `404` neu Monitor khong ton tai theo ID da chon.
- `POST /chapter2/update/engine/:record_id`
  - Alias tuong thich nguoc cua endpoint monitor.

### Chapter 3

- `GET /chapter3/:recordid`
  - Lấy pre-data chapter 3 từ chapter 2.
- `POST /chapter3/calculation/:recordid`
  - Tính chapter 3 và kiểm tra hệ số an toàn xích.
  - Có thể trả `safetyResult = false` nếu không đạt.

### Chapter 4

- `GET /chapter4/:recordid`
  - Lấy pre-data và gợi ý vật liệu sơ bộ.
- `POST /chapter4/calculation/:recordid`
  - Tính phase 1 (ứng suất cho phép + sơ bộ cấp nhanh/chậm).
- `POST /chapter4/secondcalculation/:recordid`
  - Tính phase 2 (hình học và kiểm nghiệm chi tiết).

### Chapter 5

- `POST /chapter5/:recordid`
  - Tính phase 1, trả `lmd_min` và `lmd_max`.
- `POST /chapter5/secondcalculation/:recordid`
  - Tính phase 2, lưu `table1`, `table2`, `table3`.
- `POST /chapter5/saverecord/:recordid`
  - Lưu tên record.

## 5) History/Report APIs

- `POST /fetchcalculation/:recordid`
  - Gom dữ liệu chapter để xuất báo cáo.
- `GET /fetchhistory/:userid`
  - Lấy danh sách lịch sử theo user.
- `POST /fetchsecondcalculation/:recordid`
  - Gom dữ liệu theo raw record id.
- `GET /deleterecord/:recordid`
  - Xóa record và dữ liệu liên quan.
- `GET /countrecord/:userid`
  - Đếm tổng số record theo user.

## 6) Chuẩn response tổng quát

- Thành công: thường có `message` và dữ liệu nghiệp vụ.
- Lỗi nghiệp vụ: `status 400` + `{ message }`.
- Lỗi hệ thống: `status 500` + `{ message, error }`.

## 7) Ghi chu dong bo

- Các endpoint `/api/v1/*` trong tài liệu cũ là luồng định hướng mở rộng, chưa phải backend hiện tại.
- Khi refactor API sau này, cần giữ nguyên logic ở `backend/ChapterFunction` và chỉ đổi lớp route/contract.
- Dữ liệu chapter và component được đọc/ghi trực tiếp trên MongoDB.
- Monitor catalog dùng cho Chapter 2 nằm trong `database/monitor.js` và `database/monitor.json`.
- Khi thay đổi schema Monitor, cần cập nhật đồng thời backend routes và tài liệu API này.

