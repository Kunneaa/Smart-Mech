# Smart Mech

Smart Mech la ung dung tinh toan co khi cho day bang tai. He thong hien tai da chuyen sang MongoDB va su dung catalog Monitor cho luong chon dong co.

## Kien truc

- Backend giu toan bo cong thuc tinh toan trong `backend/ChapterFunction/`.
- Frontend Expo/React Native chi xu ly UI va goi API trong `frontend/api.js`.
- Database local trong repo la file seed/catalog cho Monitor, khong con Supabase runtime.

## Cau truc chinh

```text
backend/   # Express API + Mongo adapter + chapter routes
frontend/  # Expo app + UI + API client
database/  # Monitor seed data va tai lieu du lieu
docs/      # Tai lieu kien truc, API, SRS
```

## Luong chinh

1. Dang ky / dang nhap user.
2. Chapter 2 tinh thong so nen va tra danh sach monitor goi y.
3. User chon monitor, backend luu `monitor_id` va tinh tiep.
4. Chapter 3, 4, 5 xu ly cac buoc con lai.
5. History va PDF gom du lieu theo record.

## Chay backend

```bash
cd backend
npm install
node server.js
```

Can co bien moi truong trong `backend/config.env`:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `SECRET_KEY`

## Chay frontend

```bash
cd frontend
npm install
npm start
```

Neu can ep frontend tro toi backend local:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## API quan trong

- `POST /Users`
- `POST /Users/Login`
- `GET /getuser/:userid`
- `POST /chapter2/:userid/:recordid?`
- `POST /chapter2/update/monitor/:record_id`
- `GET /chapter3/:recordid`
- `POST /chapter3/calculation/:recordid`
- `GET /chapter4/:recordid`
- `POST /chapter4/calculation/:recordid`
- `POST /chapter4/secondcalculation/:recordid`
- `POST /chapter5/:recordid`
- `POST /chapter5/secondcalculation/:recordid`
- `POST /chapter5/saverecord/:recordid`
- `POST /fetchcalculation/:recordid`
- `GET /fetchhistory/:userid`
- `POST /fetchsecondcalculation/:recordid`
- `GET /deleterecord/:recordid`
- `GET /countrecord/:userid`

## Tai lieu con

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
- [database/README.md](database/README.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/API_SPEC.md](docs/API_SPEC.md)
- [docs/COMPONENT_DATA_SOURCES.md](docs/COMPONENT_DATA_SOURCES.md)
- [docs/SRS.md](docs/SRS.md)