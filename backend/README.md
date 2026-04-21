# Backend

Backend la Express API hien tai, dung MongoDB thay cho Supabase va phuc vu toan bo luong tinh toan co khi.

## Chay local

```bash
cd backend
npm install
node server.js
```

## Bien moi truong

Can co trong `backend/config.env`:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `SECRET_KEY`

## Kiem tra song

```bash
curl http://localhost:3000/health
```

## Luong API chinh

- Auth: `POST /Users`, `POST /Users/Login`, `GET /getuser/:userid`
- Chapter 2: `POST /chapter2/:userid/:recordid?`, `GET /chapter2/:recordid`, `POST /chapter2/update/monitor/:record_id`
- Chapter 3: `GET /chapter3/:recordid`, `POST /chapter3/calculation/:recordid`
- Chapter 4: `GET /chapter4/:recordid`, `POST /chapter4/calculation/:recordid`, `POST /chapter4/secondcalculation/:recordid`
- Chapter 5: `POST /chapter5/:recordid`, `POST /chapter5/secondcalculation/:recordid`, `POST /chapter5/saverecord/:recordid`
- History/Report: `POST /fetchcalculation/:recordid`, `GET /fetchhistory/:userid`, `POST /fetchsecondcalculation/:recordid`, `GET /deleterecord/:recordid`, `GET /countrecord/:userid`

## Ghi chu logic

- Toan bo cong thuc nam trong `backend/ChapterFunction/`.
- `backend/db/mongoAdapter.js` giu interface gan giong Supabase de route cu khong phai viet lai qua nhieu.
- Chapter 2 tra ve danh sach `monitor_list`.