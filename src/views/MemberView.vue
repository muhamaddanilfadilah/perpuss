<template>
  <div class="member-page">
    <h1>𝐃𝐚𝐟𝐭𝐚𝐫 𝐌𝐞𝐦𝐛𝐞𝐫</h1>

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
  <button @click="showRiwayatPeminjaman(member)" class="btn-action history">Riwayat</button>
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
          <h3>Riwayat Peminjaman - {{ selectedMember.nama }}</h3>
          <button @click="exportToPDF" class="btn-export">
            <span class="export-icon">📄</span> Export PDF
          </button>
        </div>
        
        <div v-if="loadingRiwayat" class="loading">Memuat data...</div>
        <div v-else-if="riwayatError" class="error">{{ riwayatError }}</div>
        
        <table v-else class="riwayat-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Buku</th>
              <th>Tanggal Pinjam</th>
              <th>Tanggal Kembali</th>
              <th>Status</th>
              <th>Denda</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="riwayatPeminjaman.length === 0">
              <td colspan="6" style="text-align:center; color:#888;">Tidak ada riwayat peminjaman</td>
            </tr>
            <tr v-for="(peminjaman, index) in riwayatPeminjaman" :key="peminjaman.id">
              <td>{{ index + 1 }}</td>
              <td>{{ peminjaman.buku?.judul || peminjaman.judul_buku || 'Buku tidak ditemukan' }}</td>
              <td>{{ formatDate(peminjaman.tgl_pinjam) }}</td>
              <td>{{ formatDate(peminjaman.tgl_pengembalian) }}</td>
              <td :class="'status-' + (peminjaman.status ? peminjaman.status.toLowerCase().replace(/\s+/g, '-') : 'unknown')">
  {{ getStatusText(peminjaman.status) }}
</td>
              <td>{{ formatCurrency(peminjaman.denda || calculateDenda(peminjaman)) }}</td>
            </tr>
          </tbody>
        </table>
        
        <button @click="closeRiwayatModal" class="btn-close">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
        this.$toast.error("Gagal mengambil data member");
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
    
    async showRiwayatPeminjaman(member) {
  this.selectedMember = member;
  this.showRiwayatModal = true;
  this.loadingRiwayat = true;
  this.riwayatError = "";
  this.riwayatPeminjaman = [];
  const token = localStorage.getItem("token");

  try {
    // Ambil data peminjaman
    const response = await axios.get(
      `http://45.64.100.26:88/perpus-api/public/api/peminjaman?member_id=${member.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Ambil daftar buku untuk referensi
    const booksResponse = await axios.get(
      "http://45.64.100.26:88/perpus-api/public/api/buku",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const books = booksResponse.data.data || booksResponse.data;

    console.log("Data riwayat:", response.data);
    console.log("Daftar buku:", books);

    // Proses data peminjaman
    const rawData = response.data.data || response.data || [];
    this.riwayatPeminjaman = rawData.map(item => {
      // Cari buku yang sesuai
       const buku = books.find(b => b.id === item.id_buku) || {};
    
    // Tentukan status berdasarkan beberapa kemungkinan field
    let status = item.status || 
                (item.status_pengembalian ? 'KEMBALI' : 'PINJAM') || 
                'UNKNOWN';
    
    // Normalisasi status ke uppercase
    status = status.toUpperCase();
    
    return {
      id: item.id,
      buku: {
        id: buku.id,
        judul: buku.judul || 'Buku tidak ditemukan'
      },
      tgl_pinjam: item.tgl_pinjam || item.tanggal_pinjam,
      tgl_pengembalian: item.tgl_pengembalian || item.tanggal_kembali,
      status: status, // Gunakan status yang sudah dinormalisasi
      denda: item.denda || 0
    };
    });

  } catch (err) {
    console.error("Gagal mengambil riwayat:", err);
    this.riwayatError = err.response?.data?.message || 
                      "Gagal memuat riwayat peminjaman";
  } finally {
    this.loadingRiwayat = false;
  }
},

    closeRiwayatModal() {
      this.showRiwayatModal = false;
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
    },
    getStatusText(status) {
  if (!status) return 'Tidak diketahui';
  
  const statusMap = {
    'PINJAM': 'Dipinjam',
    'BELUM KEMBALI': 'Belum Kembali',
    'KEMBALI': 'Dikembalikan',
    'DIKEMBALIKAN': 'Dikembalikan',
    'HILANG': 'Hilang',
    'TERLAMBAT': 'Terlambat',
    'UNKNOWN': 'Tidak diketahui',
    'SUDAH DIKEMBALIKAN': 'Dikembalikan',
    'BELUM DIKEMBALIKAN': 'Belum Dikembalikan'
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
    calculateDenda(peminjaman) {
      if (peminjaman.status === 'KEMBALI') return 0;
      
      const returnDate = new Date(peminjaman.tgl_pengembalian);
      const today = new Date();
      
      if (today <= returnDate) return 0;
      
      const diffTime = Math.abs(today - returnDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 5000;
    },
    exportToPDF() {
      try {
        if (!this.selectedMember || this.riwayatPeminjaman.length === 0) {
          this.$toast.warning("Tidak ada data untuk di-export");
          return;
        }

        const doc = new jsPDF({
          orientation: "landscape"
        });

        // Judul dokumen
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(`RIWAYAT PEMINJAMAN - ${this.selectedMember.nama.toUpperCase()}`, 105, 15, { align: 'center' });
        
        // Informasi member
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`No. KTP: ${this.selectedMember.no_ktp}`, 14, 25);
        doc.text(`Alamat: ${this.selectedMember.alamat}`, 14, 30);
        
        // Tanggal export
        const exportDate = new Date().toLocaleString('id-ID');
        doc.text(`Dicetak pada: ${exportDate}`, 14, 35);

        // Header tabel
        const headers = [
          "No", 
          "Judul Buku", 
          "Tanggal Pinjam", 
          "Tanggal Kembali", 
          "Status", 
          "Denda"
        ];

        // Data tabel
        const data = this.riwayatPeminjaman.map((item, index) => [
          index + 1,
          item.buku?.judul || item.judul_buku || '-',
          this.formatDate(item.tgl_pinjam),
          this.formatDate(item.tgl_pengembalian),
          this.getStatusText(item.status),
          this.formatCurrency(item.denda || this.calculateDenda(item))
        ]);

        // Generate tabel
        autoTable(doc, {
          startY: 40,
          head: [headers],
          body: data,
          theme: 'grid',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 70 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 }
          },
          margin: { top: 40 },
          didDrawPage: function (data) {
            doc.setFontSize(8);
            const pageCount = doc.internal.getNumberOfPages();
            doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, 
                    data.settings.margin.left, 
                    doc.internal.pageSize.height - 10);
          }
        });

        // Simpan PDF
        const fileName = `Riwayat_Peminjaman_${this.selectedMember.nama.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
        
      } catch (error) {
        console.error("Gagal membuat PDF:", error);
        this.$toast.error("Gagal membuat PDF");
      }
    }
  },
};
</script>


<style scoped>
.member-page {
  padding: 1.5rem;
}
.btn-add {
  background-color: #4caf50;
  color: white;
  padding: 10px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: bold;
}
.form-add-member {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 8px;
}
.form-add-member input,
.form-add-member textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.member-table {
  width: 150%;
  
  border-collapse: collapse;
}
.member-table th,
.member-table td {
  border: 1px solid #ddd;
  padding: 10px;
}
.member-table th {
  background: #f2f2f2;
}
.action-cell {
  display: flex;

  align-items: flex-end;  /* biar tombol nempel ke kanan */
  gap: 5px; /* spasi antar tombol */
}

.btn-action {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  color: white;
  width: fit-content; /* tombol selebar isi */
}

.btn-action.detail {
  background-color: #3f51b5;
}
.btn-action.edit {
  background-color: #ff9800;
}
.btn-action.history {
  background-color: #9c27b0;
}
.btn-action.delete {
  background-color: #f44336;
}
.error {
  color: red;
  font-size: 0.9rem;
}
.success {
  color: green;
  font-size: 0.9rem;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}
.modal-content.large-modal {
  width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}
.modal-content button {
  margin-top: 10px;
  padding: 8px 14px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-close {
  margin-top: 20px;
  background-color: #f44336;
}
.riwayat-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.riwayat-table th,
.riwayat-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}
.riwayat-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}
.status-pinjam, .status-belum, .status-belum-dikembalikan {
  color: #ff9800;
  font-weight: bold;
}

.status-kembali, .status-dikembalikan, .status-sudah, .status-sudah-dikembalikan {
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

.udin {
  background-color: white;
}

.status-unknown {
  color: #9e9e9e;
  font-weight: bold;
}
.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.btn-export {
  background-color: #e74c3c;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-export:hover {
  background-color: #c0392b;
}

.export-icon {
  margin-right: 5px;
  font-size: 1rem;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.btn-action {
  display: block;      /* biar tombol berjajar vertikal */
  margin-bottom: 8px;  /* spasi antar tombol ke bawah */
  width: 100%;         /* biar tombol full lebar td */
  box-sizing: border-box; /* supaya padding gak bikin lebar melebihi td */
}

.btn-action:last-child {
  margin-bottom: 0;    /* tombol terakhir gak perlu spasi bawah */
}

.error {
  color: #e74c3c;
  padding: 10px;
  background-color: #fde8e8;
  border-radius: 4px;
  margin: 10px 0;
}
</style>