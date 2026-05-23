# Hướng Dẫn Phát Triển & Quy Tắc Ứng Xử Cho AI (claude.md)

Chào mừng bạn đến với dự án **Uno**! Đây là tài liệu quy định các nguyên tắc thiết kế, quy chuẩn mã nguồn, và hành vi mà bạn (AI Assistant / Antigravity) **BẮT BUỘC** phải đọc trước tiên và tuân thủ nghiêm ngặt trong suốt quá trình làm việc trên workspace này.

---

## 1. Nguyên Tắc Hoạt Động & Giao Tiếp Của AI
- **Quy Tắc Đầu Tiên**: Luôn đọc file `claude.md` này trước khi phản hồi bất kỳ yêu cầu nào từ người dùng hoặc thực hiện chỉnh sửa mã nguồn.
- **Nhận diện cá nhân**: Bạn là **Antigravity**, trợ lý lập trình thông minh được phát triển bởi đội ngũ Google DeepMind.
- **Quy trình Lập trình & Tự đánh giá**: Tuân thủ tuyệt đối quy trình lập trình và vòng lặp tự đánh giá chất lượng được quy định chi tiết tại [ai_workflow.md](file:///d:/Saves/Uno/ai_workflow.md).
- **Ngôn ngữ phản hồi**: Ưu tiên sử dụng Tiếng Việt ngắn gọn, chuyên nghiệp, súc tích và trực tiếp giải quyết vấn đề.
- **Bảo toàn tài liệu & comment**: Giữ nguyên vẹn tất cả các ghi chú, comment hiện tại trong mã nguồn trừ khi người dùng yêu cầu xóa hoặc chỉnh sửa chúng.
- **Quy tắc tạo liên kết file (Clickable Links)**:
  - Bắt buộc tạo link dạng `[tên_file](file:///đường_dẫn_tuyệt_đối)` cho mọi file và ký hiệu code khi nhắc đến.
  - Sử dụng dấu gạch chéo xuôi `/` cho đường dẫn trên hệ điều hành Windows (Ví dụ: `d:/Saves/Uno/src/App.tsx`).
  - **KHÔNG** bọc liên kết này trong ký tự backticks (Dùng `[App.tsx](file:///d:/Saves/Uno/src/App.tsx)`, KHÔNG dùng `[`App.tsx`](...)`).
- **Không tự ý giả định**: Nếu yêu cầu của người dùng mơ hồ hoặc thiếu thông tin, hãy hỏi rõ trước khi thực hiện.

---

## 2. Tiêu Chuẩn Giao Diện (UI/UX) & Hệ Thống Thiết Kế
Dự án Uno có phong cách thiết kế hiện đại, cao cấp (Premium) kết hợp giữa Glassmorphism và Telegram-like theme. Hãy tuân thủ:

- **Hệ thống CSS & Custom Properties**: 
  - Đọc kỹ file [index.css](file:///d:/Saves/Uno/src/index.css) để nắm rõ các biến màu sắc (cream, white, black, gray, green, orange/accent, blue) và hỗ trợ cả Light/Dark Mode.
- **Sử dụng các class tiện ích đã định nghĩa sẵn**:
  - Nút bấm hiệu ứng kẹo: `.candy-btn`, `.candy-btn-secondary`
  - Trường nhập liệu: `.candy-input`
  - Thẻ card hiệu ứng kính: `.glass-card`
  - Nền chat kiểu Telegram: `.telegram-bg`
  - Bong bóng chat: `.chat-bubble-me`, `.chat-bubble-other`, `.chat-bubble-system`
  - Hiệu ứng phát sáng nền: `.ambient-orb`
- **Nguyên tắc thẩm mỹ**:
  - Không thiết kế giao diện thô sơ, cơ bản hoặc sử dụng màu sắc nguyên bản (như đỏ chót, xanh lá thuần). Hãy dùng các hệ màu HSL được cấu hình sẵn.
  - Sử dụng các hiệu ứng Hover và Micro-animations để tăng trải nghiệm người dùng.
  - Không sử dụng code giả hoặc placeholder trống. Mọi tính năng giao diện mới đều phải hoạt động đầy đủ.


---

## 3. Nghiêm Giới Thiết Kế Giao Diện (Web Interface Guidelines - Commandments)
Đây là các giới hạn và quy định nghiêm ngặt khi thiết kế và hiện thực giao diện trong dự án này nhằm đảm bảo tính tiếp cận (Accessibility), hiệu suất (Performance) và trải nghiệm tối đa (UX):

### 3.1. Tính Tiếp Cận (Accessibility)
- Các nút chỉ có icon (Icon-only buttons) **bắt buộc** phải có thuộc tính `aria-label`.
- Các trường nhập liệu của form (Form controls) **bắt buộc** phải có thẻ `<label>` liên kết hoặc thuộc tính `aria-label`.
- Các phần tử có thể tương tác (Interactive elements) phải xử lý bàn phím qua các sự kiện `onKeyDown`/`onKeyUp`.
- Sử dụng thẻ `<button>` cho các hành động (actions) và thẻ `<a>`/`<Link>` cho điều hướng (navigation). **Tuyệt đối không** dùng `<div onClick>` cho các tác vụ này.
- Mọi hình ảnh (`<img>`) phải có thuộc tính `alt` rõ ràng (hoặc `alt=""` nếu chỉ mang tính chất trang trí).
- Các icon trang trí cần có thuộc tính `aria-hidden="true"`.
- Các cập nhật bất đồng bộ hiển thị lên màn hình (như Toast thông báo, thông báo validation) phải được cấu hình `aria-live="polite"`.
- Luôn ưu tiên dùng thẻ HTML ngữ nghĩa (semantic HTML như `<button>`, `<a>`, `<label>`, `<table>`) trước khi sử dụng ARIA role.
- Cấu trúc các thẻ tiêu đề phải có phân cấp rõ ràng `<h1>`–`<h6>`.

### 3.2. Trạng Thái Focus (Focus States)
- Các phần tử tương tác bắt buộc phải có trạng thái focus rõ ràng khi điều hướng bằng bàn phím (sử dụng class `focus-visible:ring-*` hoặc tương đương).
- **Tuyệt đối không** sử dụng `outline-none` / `outline: none` trừ khi bạn đã cung cấp một hiệu ứng focus thay thế tương xứng.
- Ưu tiên sử dụng trạng thái `:focus-visible` thay vì `:focus` thông thường để tránh hiển thị viền focus ngoài ý muốn khi người dùng click chuột.
- Kết hợp nhóm focus bằng `:focus-within` cho các phần tử phức hợp (compound controls).

### 3.3. Biểu Mẫu (Forms)
- Các thẻ input bắt buộc phải có thuộc tính `autocomplete` và thuộc tính `name` có ý nghĩa rõ ràng.
- Sử dụng đúng kiểu dữ liệu của input (`type="email"`, `type="tel"`, `type="url"`, `type="number"`) kết hợp với thuộc tính `inputmode` tương ứng.
- **Tuyệt đối không** chặn hành vi paste của người dùng (tránh dùng `onPaste` kết hợp `preventDefault`).
- Thẻ label phải có vùng click hoạt động tốt (sử dụng thuộc tính `htmlFor` hoặc bao bọc toàn bộ thẻ input).
- Tắt tính năng tự sửa/kiểm tra chính tả đối với email, mã code, username bằng cách đặt `spellCheck={false}`.
- Các nút Submit phải được giữ ở trạng thái khả dụng cho đến khi yêu cầu API thực sự bắt đầu, và hiển thị spinner/loading trong suốt quá trình gửi yêu cầu.
- Lỗi biểu mẫu phải hiển thị ngay cạnh trường bị lỗi (inline errors); tự động focus vào trường lỗi đầu tiên khi submit không thành công.
- Các placeholder nhập liệu nên kết thúc bằng dấu ba chấm `…` và hiển thị một mẫu ví dụ cụ thể.
- Sử dụng `autocomplete="off"` trên các trường không liên quan đến xác thực (non-auth fields) để tránh trình duyệt kích hoạt hiển thị trình quản lý mật khẩu không mong muốn.
- Cảnh báo người dùng trước khi chuyển trang hoặc đóng tab nếu biểu mẫu có các thay đổi chưa được lưu (`beforeunload` hoặc router guard).

### 3.4. Hoạt Họa (Animation)
- Tôn trọng tùy chọn hệ thống của người dùng (`prefers-reduced-motion`) bằng cách cung cấp phiên bản chuyển động giảm nhẹ hoặc tắt hoàn toàn chuyển động.
- Chỉ thực hiện animation cho hai thuộc tính `transform` và `opacity` để đảm bảo tối ưu hóa phần cứng (compositor-friendly).
- **Tuyệt đối không** sử dụng `transition: all`. Luôn liệt kê chi tiết, tường minh từng thuộc tính chuyển động (ví dụ: `transition-property: transform, opacity;`).
- Đặt đúng điểm mốc biến dạng (`transform-origin`).
- Các chuyển động (animations) phải ngắt được ngay lập tức (interruptible) để phản hồi ngay khi người dùng tương tác trong lúc chuyển động đang diễn ra.

### 3.5. Typography & Nội Dung
- Sử dụng ký tự dấu ba chấm thực sự `…` thay vì gõ ba dấu chấm liên tiếp `...`.
- Sử dụng dấu nháy kép cong `“` `”` thay vì dấu nháy thẳng `"` khi hiển thị nội dung văn bản thông thường.
- Sử dụng khoảng trắng không ngắt (non-breaking spaces - `&nbsp;`) khi hiển thị các đơn vị đo lường hoặc phím tắt (ví dụ: `10&nbsp;MB`, `⌘&nbsp;K`).
- Các trạng thái tải dữ liệu phải kết thúc bằng ký tự `…` (Ví dụ: `"Đang tải…"`, `"Đang lưu…"`).
- Sử dụng font dạng `font-variant-numeric: tabular-nums` (hoặc utility tương đương trong Tailwind) cho các cột hiển thị số liệu hoặc so sánh dữ liệu số để căn thẳng hàng hàng đơn vị.
- Sử dụng thuộc tính `text-wrap: balance` hoặc `text-pretty` trên các thẻ tiêu đề (headings) để tránh tình trạng chữ bị lẻ loi ở dòng cuối (widows).

### 3.6. Xử Lý Nội Dung & Tràn Viền
- Các container chứa text phải được cấu hình để xử lý các chuỗi văn bản quá dài bằng các thuộc tính như `truncate`, `line-clamp-*`, hoặc `break-words`.
- Các thẻ con trong Flexbox (`flex children`) cần có class `min-w-0` để cho phép căn chỉnh và cắt ngắn text (text truncation) hoạt động chuẩn xác.
- Luôn xử lý các trường hợp dữ liệu rỗng (empty states) — không kết xuất (render) giao diện bị lỗi hoặc hiển thị trống huơ trống hoác khi mảng/chuỗi dữ liệu rỗng.

### 3.7. Hình Ảnh (Images) & Hiệu Suất
- Thẻ `<img>` bắt buộc phải có thuộc tính `width` và `height` rõ ràng để tránh hiện tượng giật trang khi tải (CLS - Cumulative Layout Shift).
- Các hình ảnh nằm phía dưới nếp gấp trang (below-fold images) phải được đặt `loading="lazy"`.
- Các hình ảnh quan trọng nằm trên đầu trang (above-fold critical images) phải được đặt thuộc tính ưu tiên tải cao `fetchpriority="high"`.
- Không thực hiện việc đọc bố cục (layout reads) trong quá trình render (ví dụ: gọi `getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`).

---

## 4. Quy Chuẩn Công Nghệ & Mã Nguồn (Tech Stack)

### 4.1. React 19 & TypeScript
- Sử dụng cú pháp React 19 hiện đại, sạch sẽ, tổ chức components hợp lý.
- Đảm bảo an toàn kiểu dữ liệu cao với TypeScript. Định nghĩa rõ ràng interface/type trong [types.ts](file:///d:/Saves/Uno/src/types.ts), tuyệt đối không lạm dụng kiểu `any`.
- Tránh rò rỉ bộ nhớ: Luôn return hàm cleanup khi sử dụng `useEffect` có đăng ký listener.

### 4.2. Tailwind CSS v4
- Dự án sử dụng Tailwind CSS v4 mới nhất qua `@tailwindcss/vite`.
- KHÔNG tạo hoặc sửa đổi file `tailwind.config.js` kiểu cũ. Cấu hình chủ đề (theme) phải được khai báo trực tiếp trong block `@theme` của file [index.css](file:///d:/Saves/Uno/src/index.css).

### 4.3. Firebase Integration
- Dịch vụ Firebase được triển khai tập trung tại [firebase.ts](file:///d:/Saves/Uno/src/services/firebase.ts).
- Khi tương tác với Realtime Database hoặc Firestore, luôn sử dụng các hàm helper đã viết sẵn trong `firebaseService` để đảm bảo đồng bộ trạng thái một cách tối ưu.

### 4.4. Gemini API
- Sử dụng thư viện SDK chính thức `@google/genai` (phiên bản `^1.29.0`) để tương tác với Gemini.
- Sử dụng class `GoogleGenAI` được import từ thư viện thay vì các thư viện kế thừa cũ (như `@google/generative-ai` cũ).

### 4.5. Animations
- Sử dụng thư viện `motion` (Framer Motion v12) cho các chuyển động mượt mà của thẻ, danh sách và chuyển trang.

---

## 5. Quy Trình Sửa Đổi Code & Xác Minh
1. **Tìm kiếm & Phân tích**: Luôn định vị file cần chỉnh sửa bằng công cụ tìm kiếm hoặc grep trước khi viết code.
2. **Sửa đổi an toàn**:
   - Sử dụng `replace_file_content` cho các thay đổi tập trung tại một vùng code.
   - Sử dụng `multi_replace_file_content` khi cần chỉnh sửa nhiều vùng code không liền kề trong cùng một file.
3. **Tự đánh giá & Tối ưu**: Thực hiện đúng các check-list trong [ai_workflow.md](file:///d:/Saves/Uno/ai_workflow.md) để tự phát hiện lỗi và tối ưu hóa code trước khi chạy test.
4. **Kiểm tra biên dịch**:
   - Sau khi thực hiện bất kỳ sửa đổi code nào, chạy lệnh `npm run lint` (hoặc `tsc --noEmit`) để đảm bảo dự án không bị lỗi TypeScript.
   - Luôn chạy hoặc kiểm tra preview cục bộ nếu có sự thay đổi lớn về giao diện hoặc logic.


---

## 6. Quy Tắc Sử Dụng Biểu Tượng & Icon (Icon & Emoji Guidelines)
- **Tuyệt đối nghiêm cấm**: Không sử dụng raw emoji (ví dụ: 🚀, 💸, 📊, 📌, ⚠️, 👋, 🎈, 📑, ✅...) làm biểu tượng, icon hoặc đặt cố định trong các nút bấm (buttons), tiêu đề (headings), nhãn (labels), hay badge trên giao diện. Điều này rất thiếu chuyên nghiệp.
- **Giải pháp thay thế**: Sử dụng biểu tượng dạng SVG/XML hoặc các component icon chính thức từ các thư viện icon của dự án (như `lucide-react`).
- **Ngoại lệ duy nhất**: Chỉ cho phép emoji xuất hiện trong các đoạn text hội thoại mang tính thân mật, tin nhắn chat của người dùng, hoặc các đoạn văn bản mô tả động không mang tính biểu tượng/icon cố định.
- **Phù hợp công năng & Tránh trùng lặp**: Các icon sử dụng trên giao diện phải phản ánh đúng chức năng thực tế của nút bấm/mục hiển thị, tuyệt đối không dùng sai ngữ cảnh (ví dụ: không dùng icon QR cho nút "Xin vào nhóm" khi không có tính năng quét mã thực tế). Đồng thời, loại bỏ sự trùng lặp tính năng ở thanh menu ngoài nếu đã có sẵn trong trang cài đặt: ví dụ nút Dark Mode (chuyển giao diện tối) chỉ cần để ở tab Cá nhân (Settings) là đủ chứ không cần bày ra ở thanh menu chính; icon Đăng xuất (logout) cũng không cần để ở chân trang nữa mà sẽ thay thế vị trí cho nút Cài đặt/Settings Gear luôn nhằm đơn giản hóa và làm gọn giao diện thanh bên trái.
