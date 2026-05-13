// navbar.js
const navbarHTML = `
<nav id="navbar" style="position: fixed; top: 0; width: 100%; z-index: 1000; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent); transition: 0.5s; box-sizing: border-box;">
    <div style="display: flex; align-items: center; gap: 40px;">
        <h1 onclick="location.href='index.html'" style="font-size: 36px; font-weight: 900; color: #e50914; margin: 0; cursor: pointer; letter-spacing: -2px;">HUNO</h1>
        <div style="display: flex; gap: 25px; font-size: 14px; font-weight: 600;">
            <a href="index.html" id="nav-home" style="color: #e5e5e5; text-decoration: none;">Trang chủ</a>
            <div class="group" style="position: relative; cursor: pointer;">
                <span style="color: #e5e5e5;">Thể loại <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i></span>
                <div class="dropdown-menu" style="position: absolute; left: 0; top: 100%; width: 180px; background-color: #141414; border: 1px solid #262626; border-radius: 4px; padding: 10px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5); opacity: 0; visibility: hidden; transition: 0.3s; z-index: 100;">
                    <a href="#" onclick="filterByGenre('Tất cả')" style="display: block; padding: 10px 20px; color: #e5e5e5; text-decoration: none; font-size: 13px;">Tất cả</a>
                    <a href="#" onclick="filterByGenre('Hành động')" style="display: block; padding: 10px 20px; color: #e5e5e5; text-decoration: none; font-size: 13px;">Hành động</a>
                    <a href="#" onclick="filterByGenre('Kinh dị')" style="display: block; padding: 10px 20px; color: #e5e5e5; text-decoration: none; font-size: 13px;">Kinh dị</a>
                    <a href="#" onclick="filterByGenre('Tình cảm')" style="display: block; padding: 10px 20px; color: #e5e5e5; text-decoration: none; font-size: 13px;">Tình cảm</a>
                    <a href="#" onclick="filterByGenre('Viễn tưởng')" style="display: block; padding: 10px 20px; color: #e5e5e5; text-decoration: none; font-size: 13px;">Viễn tưởng</a>
                </div>
            </div>
            <a href="#" onclick="filterByGenre('Phim Bộ')" style="color: #e5e5e5; text-decoration: none;">Phim Bộ</a>
            <a href="#" onclick="filterByGenre('Phim Lẻ')" style="color: #e5e5e5; text-decoration: none;">Phim Lẻ</a>
            <a href="admin.html" id="admin-link" style="display: none; color: #fbbf24; text-decoration: none;">Quản trị viên</a>
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 25px;">
        <div style="position: relative; display: flex; align-items: center;">
            <input type="text" id="search-input" onkeyup="searchMovie()" placeholder="Tìm phim..." style="background-color: rgba(0,0,0,0.5); border: 1px solid #444; border-radius: 20px; padding: 5px 15px; font-size: 13px; color: white; outline: none; width: 200px; transition: 0.3s;">
            <i class="fas fa-search" style="margin-left: 10px; cursor: pointer; color: #e5e5e5;"></i>
        </div>
        <div id="user-section">
            <a href="login.html" id="login-btn" style="background-color: #e50914; padding: 8px 16px; border-radius: 4px; font-weight: bold; text-decoration: none; color: white; font-size: 14px; display: block;">Đăng nhập</a>

            <div id="user-dropdown" class="group" style="display: none; position: relative; align-items: center; gap: 10px; cursor: pointer;">
                <span id="user-display-name" style="font-size: 14px; font-weight: 600; color: white;">User</span>
                <img id="user-avatar" src="" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover;" alt="Avatar">
                
                <div class="dropdown-menu" style="position: absolute; right: 0; top: 100%; width: 150px; background-color: #141414; border: 1px solid #333; border-radius: 4px; padding: 10px 0; margin-top: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); opacity: 0; visibility: hidden; transition: 0.3s; z-index: 100;">
                    <a href="profile.html" style="display: block; padding: 10px 20px; color: #e5e5e5; text-decoration: none; font-size: 13px;">
                        <i class="fas fa-user-circle mr-2"></i> Hồ sơ
                    </a>
                    <hr style="border-color: #262626; margin: 5px 0;">
                    <a href="#" onclick="logout()" style="display: block; padding: 10px 20px; color: #ff4444; text-decoration: none; font-size: 13px; font-weight: bold;">
                        <i class="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                    </a>
                </div>
            </div>
        </div>
    </div>
</nav>
`;

document.body.insertAdjacentHTML('afterbegin', navbarHTML);

// Thêm CSS để đảm bảo hover hoạt động
const styleNav = document.createElement('style');
styleNav.innerHTML = `
    .group:hover .dropdown-menu { opacity: 1 !important; visibility: visible !important; }
    #navbar a:hover { color: #e50914 !important; }
`;
document.head.appendChild(styleNav);

function syncNavbar() {
    // LƯU Ý: Phải khớp với tên key ông lưu lúc đăng nhập (ở đây tôi dùng 'username')
    const user = localStorage.getItem('username'); 
    const role = localStorage.getItem('role');
    
    const loginBtn = document.getElementById('login-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const userDisplayName = document.getElementById('user-display-name');
    const userAvatar = document.getElementById('user-avatar');
    const adminLink = document.getElementById('admin-link');

    if (user && user !== "null" && user !== "undefined") {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'flex';
        if (userDisplayName) userDisplayName.innerText = user;
        if (userAvatar) userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=E50914&color=fff`;
        
        if (role === 'admin' && adminLink) {
            adminLink.style.display = 'inline';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userDropdown) userDropdown.style.display = 'none';
    }
}

window.logout = function() {
    if (confirm("Ông có chắc muốn đăng xuất không?")) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
};

window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
        nav.style.background = window.scrollY > 50 ? "rgba(6, 6, 6, 0.95)" : "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)";
    }
});

// Chạy ngay lập tức
syncNavbar();
// Chạy lại sau 100ms để chắc chắn DOM đã ổn định
setTimeout(syncNavbar, 100);