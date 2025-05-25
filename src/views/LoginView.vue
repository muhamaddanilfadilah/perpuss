<template>
  <div class="container">
    <form v-if="!isLoggedIn" @submit.prevent="handleLogin">
      <h2>Login</h2>

      <!-- Error message -->
      <div v-if="errorMsg" class="error-box">
        ⚠️ {{ errorMsg }}
      </div>

      <!-- Loading message -->
      <div v-if="loading" class="info-box">
        ⏳ Sedang mengidentifikasi akun Anda...
      </div>

      <!-- Email -->
      <label for="inputEmail">Email</label>
      <input
        type="email"
        id="inputEmail"
        v-model="email"
        placeholder="Masukkan Email"
        required
      />

      <!-- Password -->
      <label for="inputPassword">Password</label>
      <input
        type="password"
        id="inputPassword"
        v-model="password"
        placeholder="Masukkan Password"
        required
      />

      <!-- Button -->
      <button type="submit" :disabled="loading">
        🔐 Login
      </button>
    </form>

    <!-- Loading saat login sukses -->
    <div v-if="isLoggedIn" class="redirect">
      <div class="spinner"></div>
      <p>Mengarahkan ke halaman dashboard...</p>
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
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f7f7f7;
  padding: 16px;
}

form {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h2 {
  text-align: center;
  margin-bottom: 8px;
}

input {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

button {
  padding: 12px;
  background-color: royalblue;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #9db6f5;
  cursor: not-allowed;
}

.error-box {
  background-color: #ffe0e0;
  color: #b30000;
  padding: 8px 12px;
  border-radius: 8px;
}

.info-box {
  background-color: #e0f0ff;
  color: #004c99;
  padding: 8px 12px;
  border-radius: 8px;
}

.redirect {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top-color: royalblue;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
