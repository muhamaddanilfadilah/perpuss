<template>
  <div class="riwayat-peminjaman">
    <h3>Riwayat Peminjaman</h3>
    
    <div v-if="loading" class="loading">Memuat data...</div>
    
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
      peminjamanList: []
    };
  },
  watch: {
    memberId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchRiwayatPeminjaman();
        }
      }
    }
  },
  methods: {
    async fetchRiwayatPeminjaman() {
  this.loading = true;
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      `${API_BASE_URL}/peminjaman/member/${id_member}}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    this.riwayatPeminjaman = res.data?.data || []; // Sesuaikan dengan struktur response API
  } catch (err) {
    console.error("Error fetching riwayat:", err);
    this.errorMessage = `Gagal mengambil riwayat peminjaman: ${err.response?.data?.message || err.message}`;
  } finally {
    this.loading = false;
  }
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
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}

.peminjaman-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.peminjaman-table th,
.peminjaman-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.peminjaman-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.empty {
  text-align: center;
  color: #888;
  padding: 20px;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.status-pinjam {
  color: #ff9800;
  font-weight: bold;
}

.status-kembali {
  color: #4caf50;
  font-weight: bold;
}

.status-hilang {
  color: #f44336;
  font-weight: bold;
}

.status-terlambat {
  color: #e91e63;
  font-weight: bold;
}
</style>