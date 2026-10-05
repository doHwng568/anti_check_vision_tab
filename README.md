# 🛡️ AntiTab - Extension Bỏ Qua Kiểm Tra Chuyển Tab & Focus

**AntiTab** là một Extension Chrome (Manifest V3 chuẩn) giúp tự động chống và phớt lờ việc các website phát hiện người dùng thực hiện chuyển tab mới, mở ứng dụng khác, hoặc rời chuột khỏi màn hình.

---

## ✨ Các Tính Năng Nổi Bật

- **Bỏ qua Visibility API**: Giả lập `document.hidden = false` và `document.visibilityState = "visible"` liên tục.
- **Chặn Mất Focus (Window Blur)**: Phớt lờ các sự kiện `blur`, `focusout` khi bạn click sang màn hình khác hay chuyển ứng dụng.
- **Ép `document.hasFocus()`**: Luôn trả về `true` khi website gọi hàm kiểm tra focus.
- **Chặn Mouse Leave**: Phớt lờ sự kiện rê chuột ra ngoài trang web (`mouseleave`, `mouseout`).
- **Giao diện Popup Hiện đại**: Chế độ tối (Dark Mode), hiệu ứng Glassmorphic, theo dõi số lần chặn thời gian thực.
- **Danh sách trắng (Whitelist)**: Dễ dàng bật/tắt bảo vệ riêng cho từng trang web cụ thể.
- **Trang Test Suite đi kèm**: Trang test trực quan giúp bạn kiểm chứng tính năng ngay lập tức.

---

## 🚀 Hướng Dẫn Cài Đặt Vào Trình Duyệt (Developer Mode)

Extension được thiết kế theo đúng chuẩn **Chrome Extension Manifest V3**, bạn chỉ cần tải thư mục này lên trình duyệt theo các bước sau:

### 1. Trên Google Chrome / Brave / Opera

1. Mở trình duyệt và truy cập đường dẫn: `chrome://extensions/` (hoặc `brave://extensions/`)
2. Bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải màn hình.
3. Nhấp vào nút **Tải tiện ích đã giải nén (Load unpacked)**.
4. Chọn thư mục dự án `d:\anti_check_tab` (thư mục chứa file `manifest.json`).
5. Extension **AntiTab** sẽ xuất hiện trên thanh công cụ tiện ích với biểu tượng lá chắn xanh cyan!

### 2. Trên Microsoft Edge

1. Truy cập đường dẫn: `edge://extensions/`
2. Bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở menu bên trái.
3. Chọn **Tải tiện ích giải nén (Load unpacked)** và chọn thư mục `d:\anti_check_tab`.

---

## 🧪 Hướng Dẫn Test Kiểm Tra Tính Năng

1. Nhấp vào biểu tượng Extension **AntiTab** trên thanh công cụ.
2. Nhấn nút **🧪 Mở trang Test Kiểm Tra** (hoặc mở trực tiếp file `test/test_detection.html` trong trình duyệt).
3. Thử chuyển sang tab khác hoặc click sang màn hình khác:
   - **Khi BẬT AntiTab**: Trạng thái trang vẫn là `ĐANG MỞ (VISIBLE)`, số lần vi phạm vẫn bằng `0`.
   - **Khi TẮT AntiTab**: Trang web sẽ ngay lập tức phát hiện bạn rời tab và ghi lại nhật ký.

---

## 📂 Cấu Trúc Thư Mục Extension

```
anti_check_tab/
├── manifest.json              # Cấu hình Manifest V3
├── background.js             # Service Worker quản lý trạng thái
├── content/
│   ├── main_world.js         # Script can thiệp trực tiếp vào JS Context của trang web (MAIN World)
│   └── isolated_content.js   # Script cầu nối đồng bộ cấu hình (ISOLATED World)
├── popup/
│   ├── popup.html            # Giao diện điều khiển Popup
│   ├── popup.css             # Style Glassmorphic Dark UI
│   └── popup.js              # Xử lý logic Popup & Storage
├── icons/                    # Bộ biểu tượng 16x16, 48x48, 128x128
├── test/
│   └── test_detection.html   # Trang test giao diện kiểm tra chuyển tab
└── README.md                 # Hướng dẫn chi tiết
```

---

## ⚖️ Lưu ý

Extension này được tạo ra nhằm mục đích học tập, nghiên cứu và hỗ trợ trải nghiệm duyệt web cá nhân tốt hơn.
