<template>
  <div class="library-container">
    <div class="library-background">
      <div class="bookshelf-pattern"></div>
    </div>
    
    <form v-if="!isLoggedIn" @submit.prevent="handleLogin" class="library-form">
      <!-- Header dengan ikon perpustakaan -->
      <div class="form-header">
        <div class="library-icon">📚</div>
        <h2>Sistem Perpustakaan</h2>
        <p class="subtitle">Masuk ke akun Anda</p>
      </div>

      <!-- Error message -->
      <div v-if="errorMsg" class="error-box">
        <span class="error-icon">⚠️</span>
        {{ errorMsg }}
      </div>

      <!-- Loading message -->
      <div v-if="loading" class="info-box">
        <span class="loading-icon">📖</span>
        Sedang mengidentifikasi akun Anda...
      </div>

      <div class="form-fields">
        <!-- Email -->
        <div class="field-group">
          <label for="inputEmail">
            <span class="field-icon">📧</span>
            Email
          </label>
          <input
            type="email"
            id="inputEmail"
            v-model="email"
            placeholder="Masukkan email Anda"
            required
          />
        </div>

        <!-- Password -->
        <div class="field-group">
          <label for="inputPassword">
            <span class="field-icon">🔐</span>
            Password
          </label>
          <input
            type="password"
            id="inputPassword"
            v-model="password"
            placeholder="Masukkan password Anda"
            required
          />
        </div>

        <!-- Button -->
        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="!loading">📚 Masuk ke Perpustakaan</span>
          <span v-else>⏳ Memproses...</span>
        </button>
      </div>

      <!-- Footer -->
      <div class="form-footer">
        <div class="library-quote">
          "Perpustakaan adalah jendela dunia"
        </div>
      </div>
    </form>

    <!-- Loading saat login sukses -->
    <div v-if="isLoggedIn" class="redirect-library">
      <div class="library-spinner">
        <div class="book-stack">
          <div class="book book1"></div>
          <div class="book book2"></div>
          <div class="book book3"></div>
        </div>
      </div>
      <p>Mengarahkan ke dashboard perpustakaan...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      errorMsg: '',
      loading: false,
      isLoggedIn: false,
    }
  },
  methods: {
    async handleLogin() {
      this.errorMsg = ''
      this.loading = true

      try {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']

        const response = await axios.post(
          'http://45.64.100.26:88/perpus-api/public/api/login',
          {
            email: this.email.trim(),
            password: this.password,
          },
          {
            validateStatus: status => status < 500
          }
        )

        if (response.status === 200 && response.data.token) {
          const token = response.data.token
          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          try {
            await axios.get('http://45.64.100.26:88/perpus-api/public/api/member')
            this.isLoggedIn = true
            this.$router.push('/dashboard')
          } catch {
            this.errorMsg = 'Gagal memverifikasi sesi. Silakan coba lagi.'
            localStorage.removeItem('token')
          }
        } else {
          if (response.data?.message) {
            this.errorMsg = response.data.message
          } else if (response.status === 401) {
            this.errorMsg = 'Email atau password salah'
          } else if (response.status === 422) {
            this.errorMsg = 'Format email tidak valid'
          } else {
            this.errorMsg = 'Terjadi kesalahan pada server. Silakan coba lagi.'
          }
        }
      } catch (err) {
        this.errorMsg = 'Gagal login. Silakan periksa koneksi atau coba lagi.'
      } finally {
        this.loading = false
      }
    },
    async verifyToken(token) {
      try {
        await axios.get(
          'http://45.64.100.26:88/perpus-api/public/api/member',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      } catch {
        throw new Error('Token tidak valid')
      }
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')
    if (token) {
      this.loading = true
      try {
        await this.verifyToken(token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        this.isLoggedIn = true
        this.$router.push('/members')
      } catch {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.library-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%);
}

.library-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 20px,
      rgba(139, 69, 19, 0.1) 20px,
      rgba(139, 69, 19, 0.1) 22px
    );
}

.bookshelf-pattern {
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 40px,
      rgba(101, 67, 33, 0.05) 40px,
      rgba(101, 67, 33, 0.05) 42px
    );
}

.library-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 32px;
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 420px;
  position: relative;
  border: 2px solid #8b4513;
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f4f1de;
}

.library-icon {
  font-size: 3rem;
  margin-bottom: 8px;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}

.form-header h2 {
  color: #2c3e50;
  margin: 8px 0 4px 0;
  font-family: 'Georgia', serif;
  font-weight: bold;
  font-size: 1.5rem;
}

.subtitle {
  color: #5d4e75;
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
}

.field-icon {
  font-size: 1.1rem;
}

.field-group input {
  padding: 14px 16px;
  border: 2px solid #d4c5a9;
  border-radius: 8px;
  font-size: 1rem;
  background: #faf8f5;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-group input:focus {
  outline: none;
  border-color: #8b4513;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.field-group input::placeholder {
  color: #a0927d;
}

.login-button {
  padding: 16px 24px;
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  text-transform: none;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.login-button:disabled {
  background: linear-gradient(135deg, #bca688 0%, #a0927d 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
}

.error-box {
  background: linear-gradient(135deg, #ffe0e0 0%, #ffd6d6 100%);
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #e53935;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.info-box {
  background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%);
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #66bb6a;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.loading-icon {
  animation: bookFlip 2s ease-in-out infinite;
}

@keyframes bookFlip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

.form-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e8dcc0;
}

.library-quote {
  color: #5d4e75;
  font-style: italic;
  font-size: 0.85rem;
  opacity: 0.8;
}

.redirect-library {
  text-align: center;
  color: white;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 16px;
  border: 2px solid #8b4513;
}

.redirect-library p {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-top: 20px;
  font-weight: 500;
}

.library-spinner {
  margin-bottom: 20px;
}

.book-stack {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 60px;
  gap: 4px;
}

.book {
  width: 12px;
  border-radius: 2px;
  animation: bookBounce 1.4s ease-in-out infinite both;
}

.book1 {
  height: 30px;
  background: #e74c3c;
  animation-delay: -0.32s;
}

.book2 {
  height: 40px;
  background: #3498db;
  animation-delay: -0.16s;
}

.book3 {
  height: 35px;
  background: #2ecc71;
  animation-delay: 0s;
}

@keyframes bookBounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 480px) {
  .library-form {
    padding: 24px;
    margin: 16px;
  }
  
  .form-header h2 {
    font-size: 1.3rem;
  }
  
  .library-icon {
    font-size: 2.5rem;
  }
}
</style>