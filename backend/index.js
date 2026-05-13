const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');

const PORT = 5000;

// ================= 1. MIDDLEWARE =================
app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình thư mục DATA (Phim cũ ngoài container)
const dataPath = fs.existsSync('/data') ? '/data' : path.join(__dirname, '../data');
app.use('/data', express.static(dataPath));

// Cấu hình thư mục UPLOADS (Phim mới upload lên)
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Cấu hình thư mục lưu trữ riêng cho Ảnh và Video
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'public/uploads/';
        if (file.mimetype.startsWith('image/')) {
            folder += 'images';
        } else if (file.mimetype.startsWith('video/')) {
            folder += 'videos';
        }

        // Tạo thư mục nếu chưa có
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ================= 2. KẾT NỐI DATABASE =================
const pool = new Pool({
  user: 'user',
  host: 'db', // Khớp với service name trong docker-compose.yml
  database: 'hunomovie',
  password: 'password',
  port: 5432,
});

const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE, email TEXT, password TEXT, avatar TEXT DEFAULT 'https://ui-avatars.com/api/?name=User', role TEXT DEFAULT 'user', status TEXT DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS films (id SERIAL PRIMARY KEY, name_film TEXT, duration TEXT, episodes TEXT, videos TEXT, genres TEXT, type_film TEXT DEFAULT 'Phim Lẻ', description TEXT, image TEXT, poster TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, film_id INTEGER REFERENCES films(id) ON DELETE CASCADE, username TEXT, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    
    // Admin mặc định
    await pool.query(`INSERT INTO users (username, password, email, role) VALUES ('admin', '123456', 'admin@huno.com', 'admin') ON CONFLICT (username) DO NOTHING;`);
    
    console.log('✅ HunoMovie Database & Server Ready!');
  } catch (err) { console.error('❌ Lỗi DB:', err.message); }
};

// ================= 3. API PHIM (DÙNG CHO TRANG CHỦ & ADMIN) =================

// Lấy danh sách phim (Trang chủ)
app.get('/api/films', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM films ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json([]); }
});

// Lấy danh sách phim (Admin)
app.get('/admin/films', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM films ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json([]); }
});

// Thêm phim mới
app.post('/admin/add-film', async (req, res) => {
    const { name_film, duration, episodes, videos, genres, type_film, description, image, poster } = req.body;
    try {
        await pool.query(
            `INSERT INTO films (name_film, duration, episodes, videos, genres, type_film, description, image, poster) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [name_film, duration || '', episodes || '', videos || '', genres || '', type_film || 'Phim Lẻ', description || '', image || '', poster || '']
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Cập nhật phim
app.put('/admin/films/:id', async (req, res) => {
    const { id } = req.params;
    const { name_film, duration, episodes, videos, genres, type_film, description, image, poster } = req.body;
    try {
        await pool.query(
            `UPDATE films SET name_film=$1, duration=$2, episodes=$3, videos=$4, genres=$5, type_film=$6, description=$7, image=$8, poster=$9 WHERE id=$10`,
            [name_film, duration, episodes, videos, genres, type_film, description, image, poster, id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Xóa phim
app.delete('/admin/films/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM films WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// API Upload Video (Đã sửa lại đường dẫn cho chuẩn folder videos)
app.post('/admin/upload-video', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });
    const videoPath = `/uploads/videos/${req.file.filename}`;
    res.json({ success: true, url: videoPath });
});
// API Upload Ảnh (Dành cho Thumbnail và Poster) - ÔNG ĐANG THIẾU CÁI NÀY
app.post('/admin/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });
    const imgPath = `/uploads/images/${req.file.filename}`;
    res.json({ success: true, url: imgPath });
});
// ================= 4. API BÌNH LUẬN & USER =================

app.get('/api/comments/:filmId', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comments WHERE film_id = $1 ORDER BY created_at DESC', [req.params.filmId]);
        res.json(result.rows);
    } catch (err) { res.status(500).json([]); }
});

app.post('/api/comments', async (req, res) => {
    const { filmId, film_id, username, content } = req.body;
    const finalId = filmId || film_id;
    try {
        await pool.query('INSERT INTO comments (film_id, username, content) VALUES ($1, $2, $3)', [finalId, username, content]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/admin/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, role, status FROM users ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json([]); }
});

// ================= 5. AUTHENTICATION =================

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username=$1 AND password=$2', [username, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, username: result.rows[0].username, role: result.rows[0].role });
        } else {
            res.status(401).json({ success: false, message: "Sai tài khoản!" });
        }
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// ================= KHỞI CHẠY =================
initDB();
app.listen(PORT, () => { console.log(`🚀 HunoMovie Server LIVE: http://localhost:${PORT}`); });