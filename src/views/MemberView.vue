<template>
  <div class="member-page">
    <h1 class="uyy">𝐃𝐚𝐟𝐭𝐚𝐫 𝐌𝐞𝐦𝐛𝐞𝐫</h1>

    <button @click="openForm()" class="btn-add">Tambah Member</button>

    <!-- Form tambah/edit member -->
    <div v-if="showForm" class="form-add-member">
      <h3>{{ isEditMode ? 'Edit Member' : 'Tambah Member Baru' }}</h3>
      <form @submit.prevent="submitMember">
        <div>
          <label>Nama:</label>
          <input v-model="form.nama" required />
        </div>
        <div>
          <label>No. KTP:</label>
          <input v-model="form.no_ktp" required />
        </div>
        <div>
          <label>Alamat:</label>
          <input v-model="form.alamat" required />
        </div>
        <div>
          <label>Tanggal Lahir:</label>
          <input v-model="form.tgl_lahir" type="date" required />
        </div>
        <button type="submit" :disabled="loading">{{ loading ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Simpan') }}</button>
        <button type="button" @click="cancelForm" :disabled="loading">Batal</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>

    <!-- Tabel member -->
    <table class="member-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>No. KTP</th>
          <th>Alamat</th>
          <th>Tanggal Lahir</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="members.length === 0">
          <td colspan="5" style="text-align:center; color:#888;">Belum ada data member</td>
        </tr>
        <tr v-for="member in members" :key="member.id" class="udin">
          <td>{{ member.nama }}</td>
          <td>{{ member.no_ktp }}</td>
          <td>{{ member.alamat }}</td>
          <td>{{ formatDate(member.tgl_lahir) }}</td>
          <td class="action-cell">
            <button @click="viewDetail(member)" class="btn-action detail">Lihat</button>
            <button @click="editMember(member)" class="btn-action edit">Edit</button>
            <button @click="openRiwayatModal(member)" class="btn-action history">Riwayat</button>
            <button @click="deleteMember(member)" class="btn-action delete">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Detail Member -->
    <div v-if="selectedMember" class="modal-overlay" @click.self="selectedMember = null">
      <div class="modal-content">
        <h3>Detail Member</h3>
        <p><strong>Nama:</strong> {{ selectedMember.nama }}</p>
        <p><strong>No. KTP:</strong> {{ selectedMember.no_ktp }}</p>
        <p><strong>Alamat:</strong> {{ selectedMember.alamat }}</p>
        <p><strong>Tanggal Lahir:</strong> {{ formatDate(selectedMember.tgl_lahir) }}</p>
        <button @click="selectedMember = null">Tutup</button>
      </div>
    </div>

    <!-- Modal Riwayat Peminjaman -->
    <div v-if="showRiwayatModal" class="modal-overlay" @click.self="closeRiwayatModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>Riwayat Peminjaman</h3>
          <button @click="closeRiwayatModal" class="btn-close">Tutup</button>
        </div>
        
        <div class="member-selection">
          <label>Pilih Member:</label>
          <select v-model="selectedMemberId" @change="fetchRiwayatPeminjaman">
            <option value="">-- Pilih Member --</option>
            <option v-for="member in members" :key="member.id" :value="member.id">
              {{ member.nama }} ({{ member.no_ktp }})
            </option>
          </select>
        </div>

        <div v-if="loadingRiwayat" class="loading">Memuat data...</div>
        <div v-else-if="riwayatError" class="error">{{ riwayatError }}</div>
        
        <div v-if="selectedMemberForRiwayat">
          <h4>Riwayat {{ selectedMemberForRiwayat.nama }}</h4>
          <table v-if="riwayatPeminjaman.length > 0" class="riwayat-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Id Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Tanggal Kembali</th>
                <th>Status</th>
                <th>Denda</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(peminjaman, index) in riwayatPeminjaman" :key="peminjaman.id">
                <td>{{ index + 1 }}</td>
                <td>{{ peminjaman.buku?.judul || peminjaman.judul_buku || 'Buku tidak ditemukan' }}</td>
                <td>{{ formatDate(peminjaman.tgl_pinjam) }}</td>
                <td>{{ formatDate(peminjaman.tgl_kembali) }}</td>
                <td :class="'status-' + peminjaman.status.toLowerCase()">
                  {{ getStatusText(peminjaman.status) }}
                </td>
                <td>{{ formatCurrency(peminjaman.denda || 0) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">
            Tidak ada riwayat peminjaman untuk member ini
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";


export default {
  name: "memberView",
  data() {
    return {
      showForm: false,
      isEditMode: false,
      loading: false,
      errorMessage: "",
      successMessage: "",
      selectedMember: null,
      showRiwayatModal: false,
      loadingRiwayat: false,
      riwayatError: "",
      riwayatPeminjaman: [],
      selectedMemberId: "",
      selectedMemberForRiwayat: null,
      form: {
        id: null,
        nama: "",
        no_ktp: "",
        alamat: "",
        tgl_lahir: "",
      },
      members: [],
    };
  },
  mounted() {
    this.fetchMembers();
  },
  methods: {
    openForm() {
      this.showForm = true;
      this.isEditMode = false;
      this.resetForm();
    },
    async fetchMembers() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://45.64.100.26:88/perpus-api/public/api/member",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.members = res.data.data || res.data;
      } catch (err) {
        console.error("❌ Gagal ambil member", err);
        this.errorMessage = "Gagal mengambil data member";
      }
    },
    async submitMember() {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";
      const token = localStorage.getItem("token");

      try {
        if (this.isEditMode && this.form.id) {
          await axios.put(
            `http://45.64.100.26:88/perpus-api/public/api/member/${this.form.id}`,
            this.form,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          this.successMessage = "Member berhasil diperbarui.";
        } else {
          await axios.post(
            "http://45.64.100.26:88/perpus-api/public/api/member",
            this.form,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          this.successMessage = "Member berhasil ditambahkan.";
        }

        this.fetchMembers();
        this.cancelForm();
      } catch (err) {
        console.error(err.response?.data || err.message);
        this.errorMessage = "Gagal menyimpan data member.";
      } finally {
        this.loading = false;
      }
    },
    editMember(member) {
      this.form = JSON.parse(JSON.stringify(member));
      this.isEditMode = true;
      this.showForm = true;
      this.errorMessage = "";
      this.successMessage = "";
    },
    async deleteMember(member) {
      const konfirmasi = confirm(`Hapus member "${member.nama}"?`);
      if (!konfirmasi) return;

      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `http://45.64.100.26:88/perpus-api/public/api/member/${member.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.successMessage = "Member berhasil dihapus.";
        this.fetchMembers();
      } catch (err) {
        this.errorMessage = "Gagal menghapus member.";
      }
    },
    viewDetail(member) {
      this.selectedMember = member;
    },
    openRiwayatModal(member) {
      this.showRiwayatModal = true;
      this.selectedMemberId = member.id;
      this.fetchRiwayatPeminjaman();
    },
    async fetchRiwayatPeminjaman() {
  if (!this.selectedMemberId) {
    this.riwayatPeminjaman = [];
    this.selectedMemberForRiwayat = null;
    return;
  }

  this.loadingRiwayat = true;
  this.riwayatError = "";
  this.riwayatPeminjaman = [];
  
  const token = localStorage.getItem("token");
  if (!token) {
    this.riwayatError = "Token tidak ditemukan. Silakan login ulang.";
    this.loadingRiwayat = false;
    return;
  }

  try {
    // Temukan member yang dipilih
    this.selectedMemberForRiwayat = this.members.find(m => m.id == this.selectedMemberId);
    
    // Ambil data peminjaman dengan header yang lebih lengkap
    const response = await axios.get(
      `http://45.64.100.26:88/perpus-api/public/api/peminjaman?member_id=${this.selectedMemberId}`,
      { 
        headers: { 
          Accept: "application/json",
          Authorization: `Bearer ${token}` 
        } 
      }
    );
    

    // Proses data response dengan lebih robust
    let rawData = [];
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      rawData = response.data.data;
    } else if (response.data) {
      rawData = [response.data];
    }

    // Filter hanya untuk member yang dipilih
    rawData = rawData.filter(item => 
      (item.member_id == this.selectedMemberId) || 
      (item.id_member == this.selectedMemberId)
    );

    // Mapping data dengan penanganan error yang lebih baik
    this.riwayatPeminjaman = rawData.map(item => {
      // Tanggal
      const tglPinjam = item.tanggal_pinjam || item.tgl_pinjam;
      const tglKembali = item.tanggal_kembali || item.tgl_kembali || item.tgl_pengembalian;
      
      // Status
      const statusPeminjaman = (item.status || '').toUpperCase();
      const isReturned = statusPeminjaman === 'KEMBALI';
      const isLost = statusPeminjaman === 'HILANG';
      
      // Hitung jatuh tempo
      const tglJatuhTempo = item.tgl_jatuh_tempo || this.calculateDueDate(tglPinjam);
      
      // Denda - ambil dari API jika ada, jika tidak hitung otomatis
      let denda = 0;
      if (item.denda !== undefined && item.denda !== null) {
        denda = Number(item.denda) || 0;
      } else if (!isReturned && this.isOverdue(tglJatuhTempo)) {
        denda = this.calculateFine(tglJatuhTempo);
      }

      // Status untuk display
      let displayStatus = 'PINJAM';
      if (isReturned) {
        displayStatus = 'KEMBALI';
      } else if (isLost) {
        displayStatus = 'HILANG';
      } else if (this.isOverdue(tglJatuhTempo)) {
        displayStatus = 'TERLAMBAT';
      }

      return {
        id: item.id || item.id_peminjaman,
        buku: {
          id: item.buku?.id || item.id_buku,
          judul: item.buku?.judul || item.id_buku || 'Buku tidak ditemukan'
        },
        tgl_pinjam: tglPinjam,
        tgl_kembali: tglKembali,
        tgl_jatuh_tempo: tglJatuhTempo,
        status: displayStatus,
        status_pengembalian: isReturned,
        denda: denda,
        terlambat: !isReturned && this.isOverdue(tglJatuhTempo),
        hari_terlambat: !isReturned && this.isOverdue(tglJatuhTempo) 
                      ? this.calculateDaysLate(tglJatuhTempo) 
                      : 0,
        // Untuk debugging
        rawData: item
      };
    });

  } catch (error) {
    console.error("Gagal mengambil riwayat:", error);
    this.riwayatError = this.getErrorMessage(error);
    
    // Untuk development, tampilkan data contoh jika ada
    if (process.env.NODE_ENV === 'development') {
      this.riwayatPeminjaman = this.getSampleData();
      this.riwayatError += " (Menampilkan data contoh)";
    }
  } finally {
    this.loadingRiwayat = false;
  }
},

// Tambahkan helper methods yang digunakan di Pengembalian.vue
calculateDueDate(pinjamDate) {
  if (!pinjamDate) return null;
  const date = new Date(pinjamDate);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
},

isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date() > new Date(dueDate);
},

calculateDaysLate(dueDate) {
  if (!this.isOverdue(dueDate)) return 0;
  const today = new Date();
  const due = new Date(dueDate);
  return Math.ceil((today - due) / (1000 * 60 * 60 * 24));
},

calculateFine(dueDate) {
  const daysLate = this.calculateDaysLate(dueDate);
  const perDayFine = 5000; // Rp. 5.000 per hari
  const maxDays = 30; // Maksimal 30 hari denda
  return Math.min(daysLate * perDayFine, perDayFine * maxDays);
},

formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("id-ID");
},
    getStatusText(status) {
      if (!status) return 'Tidak diketahui';
      
      const statusMap = {
        'PINJAM': 'Dikembalikan',
        'KEMBALI': 'Dikembalikan',
        'HILANG': 'Hilang',
        'TERLAMBAT': 'Terlambat',
        'BELUM KEMBALI': 'Belum Kembali',
        'DIKEMBALIKAN': 'Dikembalikan',
        'SUDAH DIKEMBALIKAN': 'Dikembalikan'
      };
      
      // Normalisasi status ke uppercase dan hapus spasi berlebih
      const normalizedStatus = status.toString().toUpperCase().trim();
      return statusMap[normalizedStatus] || status;
    },
    formatCurrency(amount) {
      if (!amount) return "Rp 0";
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    },
    closeRiwayatModal() {
      this.showRiwayatModal = false;
      this.selectedMemberId = "";
      this.selectedMemberForRiwayat = null;
      this.riwayatPeminjaman = [];
    },
    cancelForm() {
      this.resetForm();
      this.showForm = false;
      this.isEditMode = false;
      this.errorMessage = "";
      this.successMessage = "";
    },
    resetForm() {
      this.form = {
        id: null,
        nama: "",
        no_ktp: "",
        alamat: "",
        tgl_lahir: "",
      };
    },
    formatDate(dateString) {
      if (!dateString) return "-";
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    }
  },
};
</script>

<style scoped>
.member-page {
  padding: 1.5rem;
  /* Remove the blue gradient and use transparent background to show the library theme from App.vue */
  background: transparent;
  min-height: 100vh;
}

.uyy {
  /* Change to library theme colors */
  color: #2c3e50;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  text-decoration: underline;
  text-decoration-color: #d4c5a9;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 2.2rem;
  border-bottom: 3px solid #d4c5a9;
  padding-bottom: 0.5rem;
}

.btn-add {
  /* Update to match library theme */
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: bold;
  font-family: 'Georgia', serif;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.btn-add:hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.form-add-member {
  margin-bottom: 1rem;
  padding: 1.5rem;
  border: 2px solid rgba(139, 69, 19, 0.2);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.form-add-member:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.form-add-member h3 {
  margin-top: 0;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-weight: bold;
  border-bottom: 3px solid #d4c5a9;
  padding-bottom: 0.5rem;
  font-size: 1.4rem;
}

.form-add-member label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-size: 14px;
}

.form-add-member input {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 2px solid #d4c5a9;
  background: #faf8f5;
  font-family: 'Georgia', serif;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-add-member input:focus {
  outline: none;
  border-color: #8b4513;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.form-add-member button[type="submit"] {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 10px;
  font-family: 'Georgia', serif;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.form-add-member button[type="submit"]:hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.form-add-member button[type="button"] {
  background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Georgia', serif;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(192, 57, 43, 0.3);
}

.form-add-member button[type="button"]:hover {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(192, 57, 43, 0.4);
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(139, 69, 19, 0.2);
}

.member-table th {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-family: 'Georgia', serif;
  font-size: 15px;
}

.member-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8dcc0;
  color: #2c3e50;
  font-family: 'Georgia', serif;
}

.member-table tr:last-child td {
  border-bottom: none;
}

.member-table tr:nth-child(even) {
  background: rgba(244, 241, 222, 0.3);
}

.member-table tr:hover {
  background: rgba(139, 69, 19, 0.05);
  transition: background-color 0.3s ease;
}

.udin {
  background-color: rgba(255, 255, 255, 0.9);
}

.action-cell {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-action {
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  color: white;
  font-family: 'Georgia', serif;
  font-size: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-action.detail {
  background: linear-gradient(135deg, #5d4e75 0%, #8e44ad 100%);
}

.btn-action.detail:hover {
  background: linear-gradient(135deg, #8e44ad 0%, #5d4e75 100%);
}

.btn-action.edit {
  background: linear-gradient(135deg, #d68910 0%, #f39c12 100%);
}

.btn-action.edit:hover {
  background: linear-gradient(135deg, #f39c12 0%, #d68910 100%);
}

.btn-action.history {
  background: linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%);
}

.btn-action.history:hover {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
}

.btn-action.delete {
  background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
}

.btn-action.delete:hover {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.error {
  color: #c0392b;
  font-size: 0.9rem;
  font-family: 'Georgia', serif;
  font-weight: 600;
  background: rgba(192, 57, 43, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #c0392b;
  margin: 10px 0;
  backdrop-filter: blur(5px);
}

.success {
  color: #27ae60;
  font-size: 0.9rem;
  font-family: 'Georgia', serif;
  font-weight: 600;
  background: rgba(39, 174, 96, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
  margin: 10px 0;
  backdrop-filter: blur(5px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(139, 69, 19, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-weight: bold;
  border-bottom: 3px solid #d4c5a9;
  padding-bottom: 0.5rem;
  font-size: 1.4rem;
}

.modal-content button {
  margin-top: 15px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Georgia', serif;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.modal-content button:hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

/* Modal Riwayat Styles */
.large-modal {
  width: 900px;
  max-width: 95vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #d4c5a9;
}

.modal-header h3 {
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.member-selection {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.member-selection label {
  font-weight: bold;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-size: 14px;
}

.member-selection select {
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid #d4c5a9;
  background: #faf8f5;
  min-width: 300px;
  font-size: 14px;
  font-family: 'Georgia', serif;
  transition: all 0.3s ease;
}

.member-selection select:focus {
  outline: none;
  border-color: #8b4513;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.riwayat-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.riwayat-table th {
  background: linear-gradient(135deg, #5d4e75 0%, #8e44ad 100%);
  color: white;
  padding: 12px;
  text-align: left;
  font-family: 'Georgia', serif;
  font-weight: 600;
}

.riwayat-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e8dcc0;
  color: #2c3e50;
  font-family: 'Georgia', serif;
}

.riwayat-table tr:last-child td {
  border-bottom: none;
}

.riwayat-table tr:nth-child(even) {
  background: rgba(244, 241, 222, 0.2);
}

.riwayat-table tr:hover {
  background: rgba(139, 69, 19, 0.05);
  transition: background-color 0.3s ease;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-style: italic;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
  font-family: 'Georgia', serif;
}

.btn-close {
  background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%) !important;
  box-shadow: 0 4px 15px rgba(192, 57, 43, 0.3) !important;
}

.btn-close:hover {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
  box-shadow: 0 6px 20px rgba(192, 57, 43, 0.4) !important;
}

/* Status Styles with Library Theme */
.status-pinjam, .status-belum, .status-belum-dikembalikan {
  color: #d68910;
  font-weight: bold;
  background: rgba(214, 137, 16, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Georgia', serif;
}

.status-kembali, .status-dikembalikan, .status-sudah, .status-sudah-dikembalikan {
  color: #27ae60;
  font-weight: bold;
  background: rgba(39, 174, 96, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Georgia', serif;
}

.status-hilang {
  color: #c0392b;
  font-weight: bold;
  background: rgba(192, 57, 43, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Georgia', serif;
}

.status-terlambat {
  color: #e91e63;
  font-weight: bold;
  background: rgba(233, 30, 99, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Georgia', serif;
}

.status-unknown {
  color: #7f8c8d;
  font-weight: bold;
  background: rgba(127, 140, 141, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Georgia', serif;
}

/* Responsive design untuk mobile */
@media (max-width: 768px) {
  .member-page {
    padding: 1rem;
  }
  
  .form-add-member {
    padding: 1rem;
  }
  
  .action-cell {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-action {
    width: 100%;
    text-align: center;
    font-size: 11px;
  }
  
  .modal-content {
    width: 350px;
    padding: 20px;
  }
  
  .large-modal {
    width: 95vw;
    max-height: 85vh;
  }
  
  .member-selection {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .member-selection select {
    min-width: 100%;
  }
  
  .uyy {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .member-page {
    padding: 0.5rem;
  }
  
  .member-table {
    font-size: 12px;
  }
  
  .member-table th,
  .member-table td {
    padding: 8px;
  }
  
  .modal-content {
    width: 320px;
    padding: 16px;
  }
  
  .uyy {
    font-size: 1.5rem;
  }
  
  .riwayat-table {
    font-size: 12px;
  }
  
  .riwayat-table th,
  .riwayat-table td {
    padding: 6px;
  }
}

/* Scrollbar styling untuk modal */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(244, 241, 222, 0.3);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
}
</style>