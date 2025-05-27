<template>
  <div class="return-page">
    <h1>  </h1>
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
async processReturn(id) {
    this.processingReturn = true;
    try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const today = new Date().toISOString().split("T")[0];

        // Perbaikan: Ganti this.pengembalian.id dengan this.selectedReturn.id
        await axios.put(
            `http://45.64.100.26:88/perpus-api/public/api/peminjaman/pengembalian/  ${this.selectedReturn.id}`,
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
  padding-left: 200px;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #2c3e50;
  line-height: 1.6;
}

.return-table {
  width: 95%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.return-table th {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-family: 'Georgia', serif;
  border: none;
}

.return-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8dcc0;
  color: #2c3e50;
}

.return-table tr:last-child td {
  border-bottom: none;
}

.return-table tr:nth-child(even) {
  background: rgba(244, 241, 222, 0.3);
}

.return-table tr:hover {
  background: rgba(139, 69, 19, 0.05);
  transition: background-color 0.2s ease;
}

.no-data {
  text-align: center;
  color: #7f8c8d;
  padding: 32px 20px;
  font-family: 'Georgia', serif;
  font-style: italic;
  font-size: 1.1rem;
}

.status-sudah {
  color: #27ae60;
  font-weight: bold;
  font-family: 'Georgia', serif;
  padding: 4px 8px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.status-belum {
  color: #e67e22;
  font-weight: bold;
  font-family: 'Georgia', serif;
  padding: 4px 8px;
  background: rgba(230, 126, 34, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(230, 126, 34, 0.2);
}

.text-danger {
  color: #e74c3c;
  font-weight: bold;
  font-family: 'Georgia', serif;
  padding: 4px 8px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  border-radius: 0.25rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  margin-left: 0.5rem;
  font-family: 'Georgia', serif;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
}

.btn {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'Georgia', serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.btn:disabled {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(189, 195, 199, 0.3);
}

.btn-sm {
  padding: 8px 14px;
  font-size: 0.875rem;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44, 62, 80, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 999;
   padding-top: 20px; /* Tambahkan padding di atas */
  overflow-y: auto; /* Tambahkan scroll jika konten terlalu panjang */
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(139, 69, 19, 0.1);
  max-height: 90vh;
  overflow-y: auto;
  font-family: 'Georgia', serif;
    margin-top: 20px; /* Tambahkan margin atas */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #d4c5a9;
}

.modal-header h5 {
  margin: 0;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-weight: bold;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #8b4513;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(139, 69, 19, 0.1);
  color: #a0522d;
}

.modal-body p {
  margin: 8px 0;
  color: #34495e;
  line-height: 1.6;
}

.alert-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #fef5e7 100%);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #8b6914;
  border: 1px solid rgba(139, 105, 20, 0.2);
  font-family: 'Georgia', serif;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Georgia', serif;
}

.form-select, .form-control {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid #d4c5a9;
  margin-bottom: 16px;
  font-size: 14px;
  background: #faf8f5;
  font-family: 'Georgia', serif;
  transition: all 0.3s ease;
}

.form-select:focus, .form-control:focus {
  outline: none;
  border-color: #8b4513;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e8dcc0;
}

.messages {
  margin-top: 16px;
}

.error {
  color: #c62828;
  font-size: 0.9rem;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
  border: 1px solid rgba(198, 40, 40, 0.2);
  border-radius: 8px;
  font-family: 'Georgia', serif;
  box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);
}

.success {
  color: #2e7d32;
  font-size: 0.9rem;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 1px solid rgba(46, 125, 50, 0.2);
  border-radius: 8px;
  font-family: 'Georgia', serif;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
}

/* Heading styles */
h1, h2, h3, h4, h5, h6 {
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-weight: bold;
  margin-bottom: 0.75em;
  line-height: 1.3;
}

h1 {
  font-size: 2.2rem;
  border-bottom: 3px solid #d4c5a9;
  padding-bottom: 0.5rem;
}

h2 {
  font-size: 1.8rem;
  color: #5d4e75;
}

h3 {
  font-size: 1.4rem;
  color: #8b4513;
}

/* Responsive design */
@media (max-width: 768px) {
  .return-page {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .return-table {
    width: 100%;
  }
  
  .return-table th,
  .return-table td {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .modal-content {
    width: 95%;
    padding: 16px;
  }
  
  .btn {
    padding: 10px 16px;
  }
}

@media (max-width: 480px) {
  .return-page {
    padding-left: 10px;
    padding-right: 10px;
  }
  
  .return-table {
    font-size: 0.8rem;
  }
  
  .return-table th,
  .return-table td {
    padding: 6px 8px;
  }
  
  .modal-content {
    padding: 12px;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .status-sudah,
  .status-belum,
  .text-danger {
    padding: 2px 6px;
    font-size: 0.8rem;
  }
}
</style>