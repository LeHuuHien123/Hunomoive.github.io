// ================= FILM =================

function toggleModal() {
    const modal = document.getElementById('add-film-modal');
    modal.classList.toggle('hidden');

    if (!modal.classList.contains('hidden')) {
        // CHỈ ĐỊNH CHÍNH XÁC NÚT LƯU BẰNG ID 'save-btn'
        const saveBtn = document.getElementById('save-btn');
        
        // Dùng includes để kiểm tra chữ cho chính xác
        if (saveBtn.innerText.includes("CẬP NHẬT")) {
            // Reset toàn bộ input
            const inputs = ['f-name', 'f-duration', 'f-episodes', 'f-videos', 'f-genres', 'f-image', 'f-poster', 'f-desc'];
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.value = '';
            });
            
            // Trả lại trạng thái ban đầu cho nút lưu
            saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i> LƯU PHIM VÀO HỆ THỐNG';
            saveBtn.setAttribute("onclick", "addFilm()");
        }
    }
}




// ADD FILM
async function addFilm() {
    // Lấy giá trị từ các input
    const data = {
        name_film: document.getElementById('f-name').value,
        duration: document.getElementById('f-duration').value,
        episodes: document.getElementById('f-episodes').value,
        videos: document.getElementById('f-videos').value,
        genres: document.getElementById('f-genres').value,
        type_film: document.getElementById('f-type').value, // Thêm dòng này
        description: document.getElementById('f-desc').value,
        image: document.getElementById('f-image').value,
        poster: document.getElementById('f-poster').value
    };

    if (!data.name_film || !data.videos) {
        alert("Vui lòng nhập ít nhất tên phim và link video!");
        return;
    }

    try {
        const res = await fetch('/admin/add-film', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            alert("Thêm phim thành công!");
            await loadFilms(); // Load lại trang để thấy phim mới
        } else {
            alert("Lỗi khi thêm phim!");
        }
    } catch (err) {
        console.error(err);
        alert("Không thể kết nối Server!");
    }
}

// Hàm xem trước ảnh (tiện tay tui sửa cho xịn hơn tí)
function previewImg() {
    const url = document.getElementById('f-image').value;
    const img = document.getElementById('preview');
    const txt = document.getElementById('preview-text');
    if (url) {
        img.src = url;
        img.classList.remove('hidden');
        txt.classList.add('hidden');
    } else {
        img.classList.add('hidden');
        txt.classList.remove('hidden');
    }
}
// LOAD FILM
async function loadFilms() {
    const res = await fetch('/admin/films');
    const films = await res.json();

    const list = document.getElementById('film-list');

    list.innerHTML = films.map(f => `
    <div class="bg-gray-800 p-4 rounded flex justify-between items-center border-l-4 border-red-600">
        <div class="flex items-center gap-4">
            <img src="${f.image}" class="w-16 h-16 object-cover rounded">
            <div>
                <h3 class="font-bold">${f.name_film}</h3>
                <p class="text-sm text-gray-400">
                    ${f.type_film} | ${f.type_film === 'Phim Bộ' ? (f.episodes || 'Chưa nhập tập') : f.duration}
                </p>
                <p class="text-xs text-red-500">${f.genres}</p>
            </div>
             <button onclick="editFilm(${JSON.stringify(f).replace(/"/g, '&quot;')})" class="text-blue-500 mr-4">
                    <i class="fas fa-edit"></i>
                </button>
            <button onclick="deleteFilm(${f.id})" class="text-red-500 hover:text-white">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        </div>
`).join('');
}
function editFilm(film) {
    toggleModal(); 
    
    // Đổ dữ liệu vào các ô input
    document.getElementById('f-name').value = film.name_film || '';
    document.getElementById('f-duration').value = film.duration || '';
    document.getElementById('f-episodes').value = film.episodes || '';
    document.getElementById('f-videos').value = film.videos || '';
    document.getElementById('f-genres').value = film.genres || '';
    document.getElementById('f-type').value = film.type_film || 'Phim Lẻ';
    document.getElementById('f-image').value = film.image || '';
    document.getElementById('f-poster').value = film.poster || '';
    document.getElementById('f-desc').value = film.description || '';

    // CHỈ ĐỊNH CHÍNH XÁC NÚT LƯU BẰNG ID 'save-btn'
    const saveBtn = document.getElementById('save-btn');
    saveBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> CẬP NHẬT PHIM';
    saveBtn.setAttribute("onclick", `updateFilm(${film.id})`);
}
async function updateFilm(id) {
    // 1. Lấy dữ liệu mới từ các ô input
    const data = {
        name_film: document.getElementById('f-name').value,
        duration: document.getElementById('f-duration').value,
        episodes: document.getElementById('f-episodes').value,
        videos: document.getElementById('f-videos').value,
        genres: document.getElementById('f-genres').value,
        type_film: document.getElementById('f-type').value, // THÊM DÒNG NÀY NÈ
        image: document.getElementById('f-image').value,
        poster: document.getElementById('f-poster').value,
        description: document.getElementById('f-desc').value
    };

    if(!data.name_film) return alert("Tên phim không được để trống!");

    try {
        const res = await fetch(`/admin/films/${id}`, {
            method: 'PUT', // Phải là PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Kiểm tra nếu Server trả về lỗi (404, 500)
        if (!res.ok) {
            const errorText = await res.text(); // Đọc lỗi dưới dạng text để debug
            console.error("Server trả về lỗi:", errorText);
            alert("Lỗi từ Server, vui lòng kiểm tra console!");
            return;
        }

        const result = await res.json();
        if (result.success) {
            alert("✅ Cập nhật phim thành công!");
            toggleModal();
            await loadFilms();
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
    }
}

// DELETE FILM
async function deleteFilm(id) {
    if(confirm("Xóa phim?")){
        await fetch(`/admin/films/${id}`, {method:'DELETE'});
        loadFilms();
    }
}

// ================= USER =================

async function loadUsers() {
    try {
        const userRole = localStorage.getItem('role'); 
        if (userRole !== 'admin') {
            alert("Bạn không có quyền!");
            window.location.href = 'login.html';
            return;
        }

        const res = await fetch('/admin/users');
        const users = await res.json();

        // SỬA TẠI ĐÂY: Dùng đúng ID 'user-list' đã đặt ở trên
        const list = document.getElementById('user-list');
        list.innerHTML = ''; 

        if (users.length === 0) {
            list.innerHTML = `<tr><td colspan="6" class="p-5 text-gray-500 italic">Chưa có khách hàng nào</td></tr>`;
            return;
        }

        users.forEach(user => {
            list.innerHTML += `
                <tr class="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td class="p-3">${user.id}</td>
                    <td class="p-3 font-semibold text-blue-400">${user.username}</td>
                    <td class="p-3">${user.email || '---'}</td>
                    <td class="p-3">
                        <select onchange="updateUser(${user.id}, this.value, '${user.status}')" 
                                class="bg-gray-900 text-xs p-1 rounded border border-gray-600 focus:outline-none">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td class="p-3">
                        <select onchange="updateUser(${user.id}, '${user.role}', this.value)" 
                                class="bg-gray-900 text-xs p-1 rounded border border-gray-600 focus:outline-none ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}">
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                            <option value="locked" ${user.status === 'locked' ? 'selected' : ''}>Bị khóa</option>
                        </select>
                    </td>
                    <td class="p-3">
                        <button onclick="deleteUser(${user.id})" class="text-red-500 hover:text-red-700 transition">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Lỗi hiển thị user:", err);
        document.getElementById('user-list').innerHTML = `<tr><td colspan="6" class="text-center p-5 text-red-500">Lỗi kết nối Server</td></tr>`;
    }
}
async function updateUser(id, newRole, newStatus) {
    if (!confirm("Bạn có chắc chắn muốn thay đổi thông tin người dùng này?")) return;

    try {
        const res = await fetch(`/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole, status: newStatus })
        });

        const data = await res.json();
        if (data.success) {
            alert("Cập nhật thành công!");
            loadUsers(); // Load lại danh sách
        }
    } catch (err) {
        alert("Không thể cập nhật!");
    }
}
// Sửa lại hàm uploadVideo cũ thành bản hỗ trợ nhiều file
async function uploadVideoFile() {
    const fileInput = document.getElementById('video-file');
    const videoInput = document.getElementById('f-videos'); // Đã có ID để dán link vào
    const status = document.getElementById('upload-status');

    if (fileInput.files.length === 0) return;

    const files = Array.from(fileInput.files);
    status.classList.remove('hidden');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        status.innerText = `⏳ Đang tải tập ${i + 1}/${files.length}...`;

        const formData = new FormData();
        formData.append('video', file);

        try {
            const res = await fetch('/admin/upload-video', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (result.success) {
                // Cộng dồn link mới vào, cách nhau bởi dấu phẩy
                let currentVal = videoInput.value.trim();
                videoInput.value = currentVal === "" ? result.url : currentVal + "," + result.url;
            }
        } catch (err) {
            console.error("Lỗi upload:", err);
        }
    }

    status.innerText = `✅ Đã tải xong ${files.length} tập!`;
    setTimeout(() => status.classList.add('hidden'), 3000);
    fileInput.value = ""; 
}
// thêm ảnh poster và thumbnail
async function uploadImage(inputElement, targetId) {
    const file = inputElement.files[0];
    const targetInput = document.getElementById(targetId);
    
    if (!file) return;

    // Hiển thị trạng thái đang tải (có thể dùng chung cái upload-status cũ)
    const status = document.getElementById('upload-status');
    status.classList.remove('hidden');
    status.innerText = "⏳ Đang tải ảnh lên...";

    const formData = new FormData();
    formData.append('image', file); // Lưu ý: Backend của ông cần xử lý key 'image' này

    try {
        const res = await fetch('/admin/upload-image', { // Nhớ kiểm tra đúng đường dẫn API upload ảnh của ông
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.success) {
            targetInput.value = result.url; // Dán link ảnh vào ô input
            status.innerText = "✅ Tải ảnh thành công!";
            
            // Nếu là thumbnail thì gọi hàm preview luôn
            if (targetId === 'f-image') previewImg();
            
            setTimeout(() => status.classList.add('hidden'), 2000);
        } else {
            alert("Lỗi upload ảnh: " + result.message);
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Không thể tải ảnh lên server!");
    }
    
    inputElement.value = ""; // Reset để có thể chọn lại cùng 1 tấm ảnh nếu muốn
}
// Gọi hàm ngay khi load trang
loadUsers();
async function deleteUser(id) {
    if(confirm("Xóa user?")){
        await fetch(`/admin/users/${id}`, {method:'DELETE'});
        loadUsers();
    }
}

// ================= TAB =================

function showTab(id){
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');

    if(id === 'film-tab') loadFilms();
    if(id === 'user-tab') loadUsers();
}

// INIT
showTab('user-tab');