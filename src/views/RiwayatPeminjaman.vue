<template>
  <div class="riwayat-peminjaman">
    <h3>Riwayat Peminjaman</h3>
    
    <div v-if="loading" class="loading">Memuat data...</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    
    <table v-else class="peminjaman-table">
      <thead>
        <tr>
          <th>ID Peminjaman</th>
          <th>Judul Buku</th>
          <th>Tanggal Pinjam</th>
          <th>Tanggal Kembali</th>
          <th>Status</th>
          <th>Denda</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="peminjamanList.length === 0">
          <td colspan="6" class="empty">Tidak ada riwayat peminjaman</td>
        </tr>
        <tr v-for="peminjaman in peminjamanList" :key="peminjaman.id">
          <td>{{ peminjaman.id }}</td>
          <td>{{ peminjaman.buku.judul }}</td>
          <td>{{ formatDate(peminjaman.tanggal_pinjam) }}</td>
          <td>{{ formatDate(peminjaman.tanggal_kembali) }}</td>
          <td>
            <span :class="'status-' + peminjaman.status.toLowerCase()">
              {{ getStatusText(peminjaman.status) }}
            </span>
          </td>
          <td>{{ formatCurrency(peminjaman.denda) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RiwayatPeminjaman",
  props: {
    memberId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      peminjamanList: []
    };
  },
  watch: {
    memberId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchRiwayatPeminjaman();
        } else {
          this.peminjamanList = [];
        }
      }
    }
  },
  methods: {
   async fetchRiwayatPeminjaman() {
  this.loading = true;
  this.errorMessage = '';
  this.peminjamanList = [];

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan, silakan login kembali');
    }

    if (!this.memberId) {
      throw new Error('ID Member tidak valid');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    // Gunakan parameter query seperti teman Anda
    const response = await axios.get(
      `http://45.64.100.26:88/perpus-api/public/api/peminjaman?member_id=${this.memberId}`,
      { headers }
    );

    // Debug response
    console.log('API Response:', response.data);

    // Handle response dengan cara yang lebih robust
    let rawData = [];
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response.data?.data) {
      rawData = response.data.data;
    }

    // Filter dan mapping data
    this.peminjamanList = rawData
      .filter(item => item.member_id == this.memberId || item.id_member == this.memberId)
      .map(item => ({
        id: item.id || item.id_peminjaman,
        buku: {
          id: item.buku?.id || item.id_buku || '',
          judul: item.buku?.judul || item.judul_buku || 'Judul tidak tersedia'
        },
        tanggal_pinjam: item.tanggal_pinjam || item.tgl_pinjam,
        tanggal_kembali: item.tanggal_kembali || item.tgl_kembali,
        status: this.normalizeStatus(item.status),
        denda: item.denda || 0
      }));

  } catch (error) {
    console.error('Error fetching peminjaman:', error);
    this.errorMessage = this.getErrorMessage(error);
  } finally {
    this.loading = false;
  }
},

// Tambahkan method helper baru
normalizeStatus(status) {
  if (!status) return 'PINJAM';
  status = status.toUpperCase();
  return status === 'KEMBALI' ? 'KEMBALI' :
    status === 'HILANG' ? 'HILANG' :
    status === 'TERLAMBAT' ? 'TERLAMBAT' : 'PINJAM';
},

getErrorMessage(error) {
  if (error.response) {
    switch (error.response.status) {
      case 401: return "Anda tidak memiliki akses";
      case 404: return "Data tidak ditemukan";
      case 500: return "Server error";
      default: return error.response.data?.message || "Gagal memuat data";
    }
  }
  return error.message || "Gagal memuat riwayat peminjaman";
},
    formatDate(dateString) {
      if (!dateString) return "-";
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatCurrency(amount) {
      if (!amount) return "Rp 0";
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    },
    getStatusText(status) {
      const statusMap = {
        'PINJAM': 'Dipinjam',
        'KEMBALI': 'Dikembalikan',
        'HILANG': 'Hilang',
        'TERLAMBAT': 'Terlambat'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style scoped>
.riwayat-peminjaman {
  margin-top: 2rem;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.3s ease;
}

.riwayat-peminjaman:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.peminjaman-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.peminjaman-table th {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-family: 'Georgia', serif;
  border: none;
}

.peminjaman-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8dcc0;
  color: #2c3e50;
  border-left: none;
  border-right: none;
}

.peminjaman-table tr:nth-child(even) {
  background: rgba(244, 241, 222, 0.3);
}

.peminjaman-table tr:hover {
  background: rgba(139, 69, 19, 0.05);
  transition: background-color 0.2s ease;
}

.empty {
  text-align: center;
  color: #7f8c8d;
  padding: 32px 20px;
  font-family: 'Georgia', serif;
  font-style: italic;
  font-size: 1.1rem;
}

.loading {
  padding: 32px 20px;
  text-align: center;
  color: #5d4e75;
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
}

.loading::after {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 10px;
  border: 2px solid #8b4513;
  border-radius: 50%;
  border-top-color: transparent;
  animation: library-spin 1s linear infinite;
}

@keyframes library-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
  color: #c62828;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid rgba(198, 40, 40, 0.2);
  font-family: 'Georgia', serif;
  box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);
}

/* Status styling dengan tema perpustakaan */
.status-pinjam {
  color: #e67e22;
  font-weight: bold;
  font-family: 'Georgia', serif;
  padding: 4px 8px;
  background: rgba(230, 126, 34, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(230, 126, 34, 0.2);
}

.status-kembali {
  color: #27ae60;
  font-weight: bold;
  font-family: 'Georgia', serif;
  padding: 4px 8px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.status-hilang {
  color: #e74c3c;
  font-weight: bold;
  font-family: 'Georgia', serif;
  padding: 4px 8px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.status-terlambat {
  color: #ad1457;
  font-weight: bold;
  font-family: 'Georgia', serif;
  padding: 4px 8px;
  background: rgba(173, 20, 87, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(173, 20, 87, 0.2);
}

/* Judul section */
.riwayat-peminjaman h2,
.riwayat-peminjaman h3 {
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-weight: bold;
  margin-bottom: 1rem;
  border-bottom: 2px solid #d4c5a9;
  padding-bottom: 0.5rem;
}

.riwayat-peminjaman h2 {
  font-size: 1.6rem;
  color: #5d4e75;
}

.riwayat-peminjaman h3 {
  font-size: 1.3rem;
  color: #8b4513;
}

/* Text styling untuk consistency */
.riwayat-peminjaman p {
  color: #34495e;
  font-family: 'Georgia', 'Times New Roman', serif;
  line-height: 1.6;
}

/* Responsive design */
@media (max-width: 768px) {
  .riwayat-peminjaman {
    padding: 16px;
    margin-top: 1rem;
  }
  
  .peminjaman-table th,
  .peminjaman-table td {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .empty,
  .loading {
    padding: 20px 16px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .riwayat-peminjaman {
    padding: 12px;
  }
  
  .peminjaman-table {
    font-size: 0.8rem;
  }
  
  .peminjaman-table th,
  .peminjaman-table td {
    padding: 6px 8px;
  }
  
  .status-pinjam,
  .status-kembali,
  .status-hilang,
  .status-terlambat {
    padding: 2px 6px;
    font-size: 0.8rem;
  }
}
</style>