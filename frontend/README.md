# Frontend

Frontend duoc xay dung bang Expo + React Native, dung file-based routing va goi backend thong qua `frontend/api.js`.

## Vai tro chinh

- Trang dang ky / dang nhap lay JWT tu backend.
- Chapter 2 nhan input, goi API tinh toan, sau do hien danh sach monitor goi y.
- Man hinh chon monitor luu `monitor_id` qua endpoint chapter2 update.
- History va PDF doc lai du lieu da tinh tu backend.

## Cau truc logic

```text
frontend/
├── app/
├── components/
├── Context/
└── api.js
```

## Luong du lieu

- `app/(auth)` goi `POST /Users` va `POST /Users/Login`.
- `app/(main)/InputPage.jsx` goi `POST /chapter2/:userid/:recordid?`.
- `app/(main)/EngineSelectPage.jsx` goi `POST /chapter2/update/monitor/:record_id`.
- `app/(history)` goi cac API fetch history / fetch report.

## Bien moi truong

Neu muon frontend tro toi backend local hoac server khac, dat:

```bash
EXPO_PUBLIC_API_URL=http://<IP-LAN-cua-may-ban>:3000
```

Vi du: `EXPO_PUBLIC_API_URL=http://192.168.1.25:3000`.

Luu y: neu chay tren dien thoai that, `localhost` se tro ve chinh dien thoai, khong phai may tinh chay backend.

## Chay

```bash
cd frontend
npm install
npm start
```
