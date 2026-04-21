# SmartMech Designer - Software Requirements Specification

## 1) Tổng quan hệ thống

- Tên hệ thống: SmartMech Designer
- Loại hệ thống: Frontend (Expo/React Native) + Backend tính toán cơ khí
- Mục tiêu:
  - Nhận input kỹ thuật từ người dùng.
  - Tính toán theo chuỗi công thức cơ khí.
  - Đề xuất linh kiện phù hợp.
  - Lưu trace để tra cứu và xuất kết quả.
  - Bổ sung AI/ML ở giai đoạn sau.

## 2) Pham vi hien tai

- Backend dang chay: Node.js/Express + MongoDB.
- Logic công thức bắt buộc nằm ở `backend/ChapterFunction`.
- Luồng tính hiện tại theo chapter:
  - Chapter 2: công suất, vòng quay, tỷ số truyền.
  - Chapter 3: bộ truyền xích + kiểm tra an toàn.
  - Chapter 4: bộ truyền bánh răng 2 cấp.
  - Chapter 5: trục và bảng tổng hợp.

## 3) Tác nhân

| Tác nhân | Vai trò |
|---|---|
| User | Nhập dữ liệu, chạy tính toán, xem lịch sử |
| Backend | Xử lý chapter logic và lưu trace |
| Data Store | Lưu user, record và dữ liệu chapter |

## 4) Yeu cau chuc nang

### FR-01 Xác thực

- Đăng ký tài khoản.
- Đăng nhập và phát hành JWT.
- Lấy thông tin user từ token/id.

### FR-02 Tính toán Chapter 2

- Nhận input kỹ thuật đầu vào.
- Tính thông số nền hệ truyền động.
- Lọc và gợi ý monitor.
- Tạo mới hoặc cập nhật record tính toán.

### FR-03 Tính toán Chapter 3

- Tính các thông số bộ truyền xích.
- Kiểm tra hệ số an toàn.
- Trả trạng thái dừng sớm nếu không đạt điều kiện.

### FR-04 Tính toán Chapter 4

- Phase 1: ứng suất cho phép và thông số sơ bộ.
- Phase 2: hình học và kiểm nghiệm chi tiết cấp nhanh/chậm.

### FR-05 Tính toán Chapter 5

- Phase 1: thông số sơ bộ trục, dải chọn lmd.
- Phase 2: lưu bảng tổng hợp kết quả.

### FR-06 Lịch sử và báo cáo

- Lấy danh sách record theo user.
- Gom dữ liệu nhiều chapter theo record để xem/xuất.
- Xóa record và dữ liệu liên quan.
- Đếm số lượng record.

### FR-07 Nguyên tắc kiến trúc

- Công thức không nằm ở mobile/frontend.
- Route không chứa công thức lõi, chỉ điều phối I/O.

### FR-08 Roadmap AI/ML (chưa bật)

- Bổ sung AI scoring sau lớp lọc khả thi bằng công thức.
- Không thay thế công thức deterministic bằng AI.

## 5) Yêu cầu phi chức năng

### NFR-01 Hiệu năng

- API phản hồi nhanh cho thao tác tính chapter thông thường.
- Truy vấn lịch sử/chi tiết ổn định theo record.

### NFR-02 Độ chính xác

- Công thức triển khai đúng theo tài liệu kỹ thuật hiện dùng.
- Kết quả làm tròn nhất quán theo chuẩn hệ thống.

### NFR-03 Bảo mật

- Không lộ khóa bí mật trong repository.
- Tách cấu hình môi trường local/dev/prod.

### NFR-04 Bảo trì

- ChapterFunction độc lập, dễ kiểm thử và thay thế.
- Tài liệu API/kiến trúc đồng bộ theo backend đang chạy.

## 6) Rang buoc ky thuat

- Frontend chính: `frontend/` (Expo/React Native).
- Backend hiện tại: Node.js/Express.
- Data backend hiện tại: MongoDB.
- Schema dữ liệu được quản lý qua collection Mongo và file seed local cho Monitor.
- AI/ML: triển khai sau, không nằm trong phạm vi đồng bộ hiện tại.

## 7) Tiêu chí chấp nhận

- Chạy được full luồng Chapter 2 -> 5 theo một record.
- Lưu và đọc lại lịch sử thành công.
- ChapterFunction giữ nguyên vai trò trung tâm cho công thức.
- Tài liệu README, API, Architecture, SRS mô tả cùng một kiến trúc hiện tại.
- `GET /health` trả `200` khi backend khởi động.
- `MONGODB_URI` phải kết nối được và login flow không lỗi hạ tầng.

