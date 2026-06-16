GÓI LANDING PAGE RÚT THĂM
CHỢ ĐÔNG BA NAM CALI × NHA KHOA NỤ CƯỜI VIỆT

CẤU TRÚC FILE:

cdb_landing_full_structure/
├── index.html
├── admin.html
├── google-apps-script.gs
├── README.txt
└── assets/
    ├── header-poster.png
    ├── logo-cdb.png
    └── logo-ncv.png

NỘI DUNG ĐÃ LÀM:

1) Trang index.html dùng đúng poster header-poster.png.
2) Form theo đúng luồng:
   POSTER
   ↓
   Mã Phiếu
   Họ Tên
   Điện Thoại
   City
   ↓
   Nguồn biết chương trình
   ↓
   Quan tâm Nha Khoa Du Lịch
   ↓
   Follow Nha Khoa Nụ Cười Việt
   Follow Chợ Đông Ba
   ↓
   Checkbox đã Follow
   ↓
   Hoàn Tất Đăng Ký

3) Nút Follow Nha Khoa Nụ Cười Việt dùng màu xanh theo logo.
4) Nguồn thông tin đã sửa thành “Tại Chợ Đông Ba”.
5) Đã bỏ TikTok.
6) Có link Facebook:
   - Nha Khoa Nụ Cười Việt: https://www.facebook.com/nhakhoadulichnucuoiviet
   - Chợ Đông Ba Nam Cali: https://www.facebook.com/quanohon
7) Không lưu dữ liệu bằng localStorage.
8) Chống trùng Mã Phiếu xử lý ở Google Sheet / server.
9) Admin không có mật mã demo 1234; dùng ADMIN_TOKEN trong Google Apps Script Properties.

CÁCH CHẠY THẬT VỚI GOOGLE SHEET:

1) Tạo Google Sheet mới.
2) Vào Extensions > Apps Script.
3) Dán toàn bộ nội dung file google-apps-script.gs.
4) Vào Project Settings > Script Properties, thêm:
   ADMIN_TOKEN = tự đặt mã riêng
   Ví dụ: CDB-NCV-2026-PRIVATE
5) Deploy > New deployment > Web app:
   Execute as: Me
   Who has access: Anyone
6) Copy Web App URL.
7) Mở index.html và admin.html, tìm dòng:
   const API_ENDPOINT = '';
   Dán Web App URL vào giữa dấu nháy.

LƯU Ý UPLOAD:

- Khi upload lên hosting/Shopify/custom page, giữ nguyên cấu trúc thư mục.
- Thư mục assets phải nằm cùng cấp với index.html.
- Trước khi in QR code chính thức, test ít nhất 3 phiếu:
  CDB000001
  CDB000002
  CDB000003
