<template>
  <div class="return-page">
    <h1>𝐃𝐚𝐭𝐚 𝐏𝐞𝐧𝐠𝐞𝐦𝐛𝐚𝐥𝐢𝐚𝐧 𝐁𝐮𝐤𝐮</h1>

    <div v-if="isLoading" class="loading">Memuat data...</div>
    <div v-else>
      <table class="return-table">
        <thead>
          <tr>
            <th>Judul Buku</th>
            <th>Nama Member</th>
            <th>Tanggal Pinjam</th>
            <th>Tanggal Jatuh Tempo</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody class="udin">
          <tr v-if="filteredReturns.length === 0">
            <td colspan="6" class="no-data">Belum ada data pengembalian</td>
          </tr>
          <tr v-for="(item, index) in filteredReturns" :key="index">
            <td>{{ item.book_title }}</td>
            <td>{{ item.member_name }}</td>
            <td>{{ formatDate(item.tgl_pinjam) }}</td>
            <td :class="{ 'text-danger': isOverdue(item.tgl_jatuh_tempo) }">
              {{ formatDate(item.tgl_jatuh_tempo) || '-' }}
              <span v-if="isOverdue(item.tgl_jatuh_tempo)" class="badge bg-danger ms-2">
                Terlambat: {{ calculateDaysLate(item.tgl_jatuh_tempo) }} hari
              </span>
            </td>
            <td>
              <span v-if="item.status_pengembalian" class="status-sudah">
                Sudah Dikembalikan
              </span>
              <span v-else class="status-belum">
                Belum Dikembalikan
              </span>
            </td>
            <td>
              <button
                v-if="!item.status_pengembalian"
                @click="confirmReturn(item, index)"
                class="btn btn-primary btn-sm"
                :disabled="loadingIndex === index"
              >
                <span v-if="loadingIndex === index">Memproses...</span>
                <span v-else>Kembalikan</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal Konfirmasi -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Konfirmasi Pengembalian</h5>
            <button @click="closeModal" class="close-btn">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedReturn">
            <p>Judul Buku: <strong>{{ selectedReturn.book_title }}</strong></p>
            <p>Peminjam: <strong>{{ selectedReturn.member_name }}</strong></p>
            <p>Tanggal Pinjam: <strong>{{ formatDate(selectedReturn.tgl_pinjam) }}</strong></p>
            <p>Jatuh Tempo: <strong>{{ formatDate(selectedReturn.tgl_jatuh_tempo) || '-' }}</strong></p>

            <div v-if="isOverdue(selectedReturn.tgl_jatuh_tempo)" class="alert-warning">
              <h6>Denda Keterlambatan</h6>
              <p>Terlambat: {{ calculateDaysLate(selectedReturn.tgl_jatuh_tempo) }} hari</p>
              <p>Total Denda: Rp. {{ calculateFine(selectedReturn.tgl_jatuh_tempo).toLocaleString('id-ID') }}</p>
            </div>

            <div class="mb-3" v-if="isOverdue(selectedReturn.tgl_jatuh_tempo)">
              <label class="form-label">Jenis Denda</label>
              <select v-model="fineType" class="form-select">
                <option value="keterlambatan">Keterlambatan</option>
                <option value="kerusakan">Kerusakan Buku</option>
                <option value="hilang">Buku Hilang</option>
              </select>
            </div>

            <div class="mb-3" v-if="isOverdue(selectedReturn.tgl_jatuh_tempo)">
              <label class="form-label">Deskripsi</label>
              <textarea v-model="fineDescription" class="form-control" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="processReturn"
              :disabled="processingReturn"
            >
              <span v-if="processingReturn">Memproses...</span>
              <span v-else>Konfirmasi Pengembalian</span>
            </button>
          </div>
        </div>
      </div>

      <div class="messages">
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PengembalianView",
  data() {
    return {
      returns: [],
      books: [],
      members: [],
      errorMessage: "",
      successMessage: "",
      loadingIndex: null,
      selectedReturn: null,
      processingReturn: false,
      fineType: "keterlambatan",
      fineDescription: "",
      fineRules: {
        perDay: 5000,
        maxDays: 30
      },
      showModal: false,
      messageTimeout: null,
      isLoading: true
    };
  },
  computed: {
    filteredReturns() {
      return this.returns.map(item => {
        // Debugging: Log the IDs and found items
        console.log('Mapping return item:', item);
        console.log('Looking for book ID:', item.id_buku);
        console.log('Looking for member ID:', item.id_member);
        
        const book = this.books.find(b => b.id == item.id_buku);
        const member = this.members.find(m => m.id == item.id_member);
        
        console.log('Found book:', book);
        console.log('Found member:', member);
        
        if (!book) {
          console.warn(`Buku dengan ID ${item.id_buku} tidak ditemukan`);
        }
        if (!member) {
          console.warn(`Member dengan ID ${item.id_member} tidak ditemukan`);
        }
        
        const tgl_jatuh_tempo = item.tgl_jatuh_tempo || this.calculateDueDate(item.tgl_pinjam);
        
        return {
          ...item,
          book_title: book?.judul || 'Buku tidak ditemukan',
          member_name: member?.nama || 'Member tidak ditemukan',
          tgl_jatuh_tempo: tgl_jatuh_tempo
        };
      });
    }
  },
  mounted() {
    this.fetchAllData();
  },
  beforeUnmount() {
    clearTimeout(this.messageTimeout);
  },
  methods: {
    calculateDueDate(pinjamDate) {
      if (!pinjamDate) return null;
      const date = new Date(pinjamDate);
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    },
    async fetchAllData() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch all data in parallel
        const [peminjamanRes, booksRes, membersRes] = await Promise.all([
          axios.get("http://45.64.100.26:88/perpus-api/public/api/peminjaman", { headers }),
          axios.get("http://45.64.100.26:88/perpus-api/public/api/buku", { headers }),
          axios.get("http://45.64.100.26:88/perpus-api/public/api/member", { headers })
        ]);
        
        // Debugging: Log the raw responses
        console.log('Peminjaman response:', peminjamanRes.data);
        console.log('Buku response:', booksRes.data);
        console.log('Member response:', membersRes.data);
        
        // Handle different response structures
        this.returns = peminjamanRes.data.data || peminjamanRes.data || [];
        this.books = booksRes.data.data || booksRes.data || [];
        this.members = membersRes.data.data || membersRes.data || [];
        
        // Debugging: Log the stored data
        console.log('Stored returns:', this.returns);
        console.log('Stored books:', this.books);
        console.log('Stored members:', this.members);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        this.showMessage("Gagal mengambil data dari server.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("id-ID");
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
      return Math.min(daysLate * this.fineRules.perDay, this.fineRules.perDay * this.fineRules.maxDays);
    },
   confirmReturn(item, index) {
    this.selectedReturn = item;
    this.loadingIndex = index;
    this.showModal = true;
    // Reset form denda
    this.fineType = "keterlambatan";
    this.fineDescription = `Denda keterlambatan pengembalian buku (${this.calculateDaysLate(item.tgl_jatuh_tempo)} hari)`;
},
    closeModal() {
      this.showModal = false;
      this.loadingIndex = null;
    },
async processReturn() {
    this.processingReturn = true;
    try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const today = new Date().toISOString().split("T")[0];

        // Perbaikan: Ganti this.pengembalian.id dengan this.selectedReturn.id
        await axios.put(
            `http://45.64.100.26:88/perpus-api/public/api/peminjaman/${this.selectedReturn.id}`,
            {
                id_buku: this.selectedReturn.id_buku,
                id_member: this.selectedReturn.id_member,
                tgl_pinjam: this.selectedReturn.tgl_pinjam,
                tgl_pengembalian: today,
                status_pengembalian: 1
            },
            { headers }
        );

        // Handle denda jika terlambat
        if (this.isOverdue(this.selectedReturn.tgl_jatuh_tempo)) {
            await axios.post(
                "http://45.64.100.26:88/perpus-api/public/api/denda",
                {
                    id_member: this.selectedReturn.id_member,
                    id_buku: this.selectedReturn.id_buku,
                    jumlah_denda: this.calculateFine(this.selectedReturn.tgl_jatuh_tempo),
                    jenis_denda: this.fineType,
                    deskripsi: this.fineDescription
                },
                { headers }
            );
        }

        // Update local data
        const index = this.returns.findIndex(r => r.id === this.selectedReturn.id);
        if (index !== -1) {
           this.returns[index] = {
    ...this.returns[index],
    tgl_pengembalian: today,
    status_pengembalian: 1
};
        }

        this.showMessage("Buku berhasil dikembalikan", "success");
        this.closeModal();
    } catch (err) {
        console.error("Error processing return:", err);
        let msg = "Gagal memproses pengembalian";
        if (err.response?.data?.message) {
            msg = err.response.data.message;
        } else if (err.response?.data) {
            msg = Object.values(err.response.data).flat().join(" | ");
        }
        this.showMessage(msg, "error");
    } finally {
        this.processingReturn = false;
    }
},
    showMessage(msg, type = "error") {
      if (type === "error") {
        this.errorMessage = msg;
        this.successMessage = "";
      } else {
        this.successMessage = msg;
        this.errorMessage = "";
      }
      clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(() => {
        this.successMessage = "";
        this.errorMessage = "";
      }, 10000);
    }
  }
};
</script>

<style scoped>
.return-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.return-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.return-table th, .return-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.return-table th {
  background: #f2f2f2;
  font-weight: 600;
}

.no-data {
  text-align: center;
  color: #888;
}

.status-sudah {
  color: green;
  font-weight: 500;
}

.status-belum {
  color: orange;
  font-weight: 500;
}

.text-danger {
  color: #dc3545;
  font-weight: 500;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  border-radius: 0.25rem;
}

.bg-danger {
  background-color: #dc3545;
  color: white;
}

.ms-2 {
  margin-left: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 6px 12px;
  font-size: 14px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #0056b3;
}

.btn:disabled {
  background-color: #a0c4e8;
  cursor: not-allowed;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.875rem;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.messages {
  margin-top: 1rem;
}

.error {
  color: #dc3545;
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
.udin {
  background-color: white;
}

.success {
  color: #28a745;
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}

.success strong {
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.alert-warning {
  background-color: #fff3cd;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-select, .form-control {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

textarea.form-control {
  min-height: 100px;
}
</style>