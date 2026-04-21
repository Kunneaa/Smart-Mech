# SmartMech Designer Architecture

## 1) Mục tiêu kiến trúc

- Giữ công thức cơ khí ở backend.
- Tách rõ lớp API (I/O) và lớp công thức (calculation engine).
- Lưu trace theo từng record để tra cứu và báo cáo.
- Chuẩn bị hạ tầng cho AI/ML ở giai đoạn sau.

## 2) Kien truc hien tai (source of truth)

```text
Frontend App (Expo/React Native)
        |
        | HTTP
        v
Backend Node.js/Express
  ├─ Routes (user, chapter2-5, history)
  ├─ MachineCalculatorFactory
  ├─ ChapterFunction (Chapter2-5 formulas)
  └─ MongoDB (User, HistoryRecord, Monitor, Chapter2-5)
```

Backend đang vận hành tại:

- `backend/server.js`
- `backend/Routes/*.js`
- `backend/ChapterFunction/*.js`

Frontend đang vận hành/tham chiếu tại:

- `frontend/app/*.jsx`
- `frontend/components/*.jsx`
- `mobile/react_native_app/src/*` (tham chiếu UI/logic)

## 3) Ranh giới module

### API Layer (Routes)

- Nhận request, kiểm tra token/id, đọc body.
- Gọi hàm ChapterFunction thông qua factory.
- Đọc/ghi MongoDB qua adapter `backend/db/mongoAdapter.js`.
- Trả response JSON.

### Calculation Layer (ChapterFunction)

- Chứa công thức thuần cho Chapter 2/3/4/5.
- Không chứa logic HTTP/UI.
- Tái sử dụng bởi nhiều route.

### Frontend Layer (frontend + mobile tham chiếu)

- `frontend/` là client chính bám API backend hiện tại.
- `mobile/react_native_app/` dùng để tham chiếu và đối chiếu luồng UI/logic.

### Data Layer (MongoDB)

- Collection nghiệp vụ: User, HistoryRecord, Monitor, Chapter2-5, TinhToanNhanh, TinhToanCham.
- `Monitor` là catalog động cơ dùng cho Chapter 2.
- Dữ liệu catalog local nằm ở `database/monitor.js` và `database/monitor.json`.

## 4) Luồng xử lý một record

1. Auth user.
2. Chapter2 tính dữ liệu nền và tạo/cập nhật record.
3. Chọn monitor và cập nhật phân phối truyền.
4. Chapter3 tính truyền xích + kiểm tra an toàn.
5. Chapter4 tính bộ truyền bánh răng 2 pha.
6. Chapter5 tính trục 2 pha.
7. History gom dữ liệu để xem lại/xuất kết quả.

## 5) Quy tắc thiết kế bắt buộc

- Không chuyển công thức sang frontend/mobile.
- Mọi thay đổi công thức phải nằm trong `backend/ChapterFunction`.
- Route chỉ đóng vai trò điều phối I/O.
- Tài liệu phải mô tả đúng endpoint backend hiện tại.

## 6) Van hanh toi thieu

- Backend cần đủ env: `MONGODB_URI`, `MONGODB_DB_NAME`, `SECRET_KEY`.
- Backend expose endpoint `GET /health` để kiểm tra service status.
- Nếu MongoDB URI không kết nối được, toàn bộ luồng chapter sẽ lỗi ngay từ tầng I/O.

## 7) Lộ trình mở rộng AI/ML

Hiện tại AI/ML chưa bật trong luồng chính. Giai đoạn sau sẽ thêm:

- AI scoring sau bước lọc khả thi bằng công thức.
- Ranking dựa trên engineering fit + risk score.
- Tách inference module độc lập để không ảnh hưởng ChapterFunction.
