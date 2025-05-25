<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">𝐌𝐚𝐧𝐚𝐣𝐞𝐦𝐞𝐧 𝐏𝐞𝐦𝐢𝐧𝐣𝐚𝐦𝐚𝐧</h1>

    <div class="flex justify-between mb-4">
      <div>
        <button
          @click="showForm = true"
          v-if="!showForm"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          + Tambah Data
        </button>
        <button
          @click="exportExcel"
          class="bg-yellow-500 text-white px-4 py-2 rounded ml-2 hover:bg-yellow-600 btn-primary"
        >
          Export Excel
        </button>
      </div>
<button @click="showChart = !showChart" class="transition">
  {{ showChart ? 'Sembunyikan Grafik' : 'Tampilkan Grafik' }}
</button>
    </div>

    <!-- Grafik Peminjaman -->
    <div v-if="showChart" class="mb-8 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Grafik Peminjaman per Bulan</h2>
        <div class="flex items-center space-x-2">
          <select 
            v-model="selectedYear" 
            @change="updateChartData"
            class="border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
<button @click="exportChartToPDF" class="export-btn">

  Export PDF
</button>
        </div>
      </div>
      
      <div ref="chartContainer" class="w-full h-96">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <!-- Form Tambah/Edit -->
    <form
      v-if="showForm"
      @submit.prevent="isEditing ? updatePeminjaman() : addPeminjaman()"
      class="space-y-4 mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-200"
    >
      <div>
        <label class="block mb-2 font-medium text-gray-700">Member</label>
        <select 
          v-model="form.id_member" 
          class="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option disabled value="">Pilih Member</option>
          <option v-for="member in members" :key="member.id" :value="member.id">
            {{ member.nama }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-2 font-medium text-gray-700">Buku</label>
        <select 
          v-model="form.id_buku" 
          class="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option disabled value="">Pilih Buku</option>
          <option v-for="buku in books" :key="buku.id" :value="buku.id">
            {{ buku.judul }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-2 font-medium text-gray-700">Tanggal Pinjam</label>
        <input 
          type="date" 
          v-model="form.tgl_pinjam" 
          class="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          required 
        />
      </div>

      <div>
        <label class="block mb-2 font-medium text-gray-700">Tanggal Pengembalian</label>
        <input 
          type="date" 
          v-model="form.tgl_pengembalian" 
          class="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          required 
        />
      </div>

      <div class="flex gap-2 pt-2">
<div class="form-actions">
  <button type="submit" class="btn-primary">
    {{ isEditing ? 'Update' : 'Tambah' }}
  </button>
  <button @click="cancelForm" type="button" class="btn-secondary">
    Batal
  </button>
</div>
        <button 
          @click="cancelForm" 
          type="button" 
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Batal
        </button>
      </div>
    </form>

    <!-- Tabel -->
    <div class="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-4 border-b font-semibold text-left">#</th>
            <th class="py-3 px-4 border-b font-semibold text-left">Member</th>
            <th class="py-3 px-4 border-b font-semibold text-left">Buku</th>
            <th class="py-3 px-4 border-b font-semibold text-left">Tgl Pinjam</th>
            <th class="py-3 px-4 border-b font-semibold text-left">Tgl Kembali</th>
            <th class="py-3 px-4 border-b font-semibold text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(item, index) in peminjaman" 
            :key="item.id" 
            class="udin"
          >
            <td class="py-3 px-4 border-b">{{ index + 1 }}</td>
            <td class="py-3 px-4 border-b">{{ findMemberName(item.id_member) }}</td>
            <td class="py-3 px-4 border-b">{{ findBookTitle(item.id_buku) }}</td>
            <td class="py-3 px-4 border-b">{{ formatDate(item.tgl_pinjam) }}</td>
            <td class="py-3 px-4 border-b">{{ formatDate(item.tgl_pengembalian) }}</td>
            <td class="py-3 px-4 border-b">
              <span 
                :class="{
                  'text-green-600 font-medium': item.status_pengembalian == 1,
                  'text-red-600 font-medium': item.status_pengembalian != 1
                }"
              >
                {{ item.status_pengembalian == 1 ? 'Dikembalikan' : 'Belum Dikembalikan' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

Chart.register(...registerables);

export default {
  name: "PeminjamanView",
  data() {
    return {
      peminjaman: [],
      members: [],
      books: [],
      isEditing: false,
      showForm: false,
      showChart: false,
      selectedYear: new Date().getFullYear(),
      availableYears: [],
      chart: null,
      form: {
        id: null,
        id_member: "",
        id_buku: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
        status_pengembalian: 0,
      },
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    exportExcel() {
      const data = this.peminjaman.map((item) => ({
        No: this.peminjaman.indexOf(item) + 1,
        Member: this.findMemberName(item.id_member),
        Buku: this.findBookTitle(item.id_buku),
        'Tgl Pinjam': this.formatDate(item.tgl_pinjam),
        'Tgl Kembali': this.formatDate(item.tgl_pengembalian),
        Status: item.status_pengembalian == 1 ? "Dikembalikan" : "Belum Dikembalikan",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(dataBlob, "data_peminjaman.xlsx");
    },
   async fetchPeminjaman() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      "http://45.64.100.26:88/perpus-api/public/api/peminjaman",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    this.peminjaman = res.data.data || res.data;
    this.extractAvailableYears();
    
    // Hanya prepare chart jika showChart true
    if (this.showChart) {
      this.prepareChartData();
    }
  } catch (err) {
    console.error("❌ Gagal ambil peminjaman", err);
    alert("Gagal mengambil data peminjaman");
  }
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
    async fetchBooks() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://45.64.100.26:88/perpus-api/public/api/buku",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.books = res.data.data || res.data;
      } catch (err) {
        console.error("❌ Gagal ambil buku", err);
        this.$toast.error("Gagal mengambil data buku");
      }
    },
    async addPeminjaman() {
      const token = localStorage.getItem("token");
      try {
        const payload = {
          id_member: this.form.id_member,
          id_buku: this.form.id_buku,
          tgl_pinjam: this.form.tgl_pinjam,
          tgl_pengembalian: this.form.tgl_pengembalian,
          status_pengembalian: 0,
        };
        await axios.post(
          "http://45.64.100.26:88/perpus-api/public/api/peminjaman",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.$toast.success("Peminjaman berhasil ditambahkan");
        this.cancelForm();
        this.fetchPeminjaman();
      } catch (err) {
        console.error("❌ Gagal tambah peminjaman", err.response?.data || err);
        this.$toast.error("Gagal menambahkan peminjaman");
      }
    },
    async updatePeminjaman() {
      const token = localStorage.getItem("token");
      try {
        const payload = {
          id_member: this.form.id_member,
          id_buku: this.form.id_buku,
          tgl_pinjam: this.form.tgl_pinjam,
          tgl_pengembalian: this.form.tgl_pengembalian,
        };
        await axios.put(
          `http://45.64.100.26:88/perpus-api/public/api/peminjaman/${this.form.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.$toast.success("Peminjaman berhasil diperbarui");
        this.cancelForm();
        this.fetchPeminjaman();
      } catch (err) {
        console.error("❌ Gagal update peminjaman", err.response?.data || err);
        this.$toast.error("Gagal memperbarui peminjaman");
      }
    },
    async deletePeminjaman(id) {
      if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
      
      const token = localStorage.getItem("token");
      try {
        await axios.delete(
          `http://45.64.100.26:88/perpus-api/public/api/peminjaman/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.$toast.success("Peminjaman berhasil dihapus");
        this.fetchPeminjaman();
      } catch (err) {
        console.error("❌ Gagal hapus peminjaman", err.response?.data || err);
        this.$toast.error("Gagal menghapus peminjaman");
      }
    },
    cancelForm() {
      this.isEditing = false;
      this.showForm = false;
      this.form = {
        id: null,
        id_member: "",
        id_buku: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
        status_pengembalian: 0,
      };
    },
    editPeminjaman(item) {
      this.isEditing = true;
      this.showForm = true;
      this.form = {
        id: item.id,
        id_member: item.id_member?.id || item.id_member,
        id_buku: item.id_buku?.id || item.id_buku,
        tgl_pinjam: item.tgl_pinjam,
        tgl_pengembalian: item.tgl_pengembalian,
        status_pengembalian: item.status_pengembalian || 0,
      };
    },
    findMemberName(id) {
      const member = this.members.find((m) => m.id == id);
      return member?.nama || "Tidak Diketahui";
    },
    findBookTitle(id) {
      const buku = this.books.find((b) => b.id == id);
      return buku?.judul || "Tidak Diketahui";
    },
    extractAvailableYears() {
  const years = new Set();
  
  this.peminjaman.forEach(item => {
    if (item.tgl_pinjam) {
      try {
        // Handle berbagai format tanggal dari API
        let date;
        if (typeof item.tgl_pinjam === 'string') {
          // Format YYYY-MM-DD atau format lain
          if (item.tgl_pinjam.includes('-')) {
            const parts = item.tgl_pinjam.split('-');
            date = new Date(parts[0], parts[1] - 1, parts[2]);
          } else if (item.tgl_pinjam.includes('/')) {
            const parts = item.tgl_pinjam.split('/');
            date = new Date(parts[2], parts[1] - 1, parts[0]);
          } else {
            // Coba parsing langsung
            date = new Date(item.tgl_pinjam);
          }
        } else {
          // Jika format timestamp atau format lain
          date = new Date(item.tgl_pinjam);
        }

        // Pastikan tanggal valid
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          years.add(year);
        }
      } catch (e) {
        console.warn('Gagal memproses tanggal:', item.tgl_pinjam, e);
      }
    }
  });

  // Konversi ke array dan urutkan descending
  this.availableYears = Array.from(years).sort((a, b) => b - a);
  
  // Jika tidak ada tahun yang valid, gunakan tahun saat ini
  if (this.availableYears.length === 0) {
    this.availableYears.push(new Date().getFullYear());
  }
  
  // Set tahun terpilih ke tahun terbaru
  this.selectedYear = this.availableYears[0];
  
  console.log('Tahun yang tersedia:', this.availableYears);
},
    prepareChartData() {
       if (!this.$refs.chartCanvas) {
    console.warn('Chart canvas belum tersedia');
    return;
  }

      // Destroy previous chart if exists
      if (this.chart) {
        this.chart.destroy();
      }

      // Filter data by selected year
      const filteredData = this.peminjaman.filter(item => {
        if (!item.tgl_pinjam) return false;
        const year = new Date(item.tgl_pinjam).getFullYear();
        return year === this.selectedYear;
      });

      // Initialize counts for each month (0-11)
      const monthlyCounts = Array(12).fill(0);
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];

      // Count peminjaman per month
      filteredData.forEach(item => {
        if (item.tgl_pinjam) {
          const month = new Date(item.tgl_pinjam).getMonth();
          monthlyCounts[month]++;
        }
      });

      // Create chart
      const ctx = this.$refs.chartCanvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthNames,
          datasets: [{
            label: `Jumlah Peminjaman Tahun ${this.selectedYear}`,
            data: monthlyCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Jumlah Peminjaman'
              },
              ticks: {
                precision: 0
              }
            },
            x: {
              title: {
                display: true,
                text: 'Bulan'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Jumlah: ${context.raw}`;
                }
              }
            }
          }
        }
      });
    },
    updateChartData() {
      this.prepareChartData();
    },
    exportChartToPDF() {
      if (!this.chart) return;

      const doc = new jsPDF({
        orientation: 'landscape'
      });

      // Add title
      doc.setFontSize(18);
      doc.text(`Laporan Peminjaman Buku per Bulan Tahun ${this.selectedYear}`, 14, 20);

      // Add chart image
      const chartImage = this.chart.toBase64Image();
      doc.addImage(chartImage, 'JPEG', 15, 30, 260, 120);

      // Add table with monthly data
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      const tableData = monthNames.map((month, index) => {
        return {
          bulan: month,
          jumlah: this.chart.data.datasets[0].data[index]
        };
      });

      // Add total row
      const total = this.chart.data.datasets[0].data.reduce((sum, current) => sum + current, 0);
      tableData.push({
        bulan: 'TOTAL',
        jumlah: total
      });

      // Convert to array for autoTable
      const tableArray = tableData.map(item => [item.bulan, item.jumlah]);

      doc.autoTable({
        startY: 160,
        head: [['Bulan', 'Jumlah Peminjaman']],
        body: tableArray,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 50 }
        },
        didDrawPage: function (data) {
          doc.setFontSize(10);
          const pageCount = doc.internal.getNumberOfPages();
          doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, 
                  data.settings.margin.left, 
                  doc.internal.pageSize.height - 10);
        }
      });

      // Save the PDF
      doc.save(`Laporan_Peminjaman_${this.selectedYear}.pdf`);
    }
  },
  mounted() {
    this.fetchPeminjaman();
    this.fetchMembers();
    this.fetchBooks();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
.udin {
  background-color: rgb(255, 255, 255);
}
/* Base styles */
.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.transition {
  transition: all 0.2s ease-in-out;
  background-color: blue;
}

/* Table styles */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: 600;
  color: #4a5568;
}

tr:hover {
  background-color: #f8fafc;
}

/* Form styles */
form input, form select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

form input:focus, form select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

/* Button styles */
.btn-primary {
   background-color: #16a34a; /* green-600 */
 /* blue-600 */
}

.btn-primary:hover {
    background-color: #16a34a; /* green-600 */
 /* blue-700 */
}

/* Button Secondary (Abu) */
.btn-secondary {
  background-color: #4b5563; /* gray-600 */
}

.btn-secondary:hover {
  background-color: #374151; /* gray-700 */
}

/* Button Danger (Merah) */
.btn-danger {
    background-color: #16a34a; /* green-600 */
 /* red-600 */
}

.btn-danger:hover {
    background-color: #16a34a; /* green-600 */
; /* red-700 */
}

/* Button Success (Hijau) */
.btn-success {
  background-color: #16a34a; /* green-600 */
}

.btn-success:hover {
  background-color: #15803d; /* green-700 */
}

/* Button Warning (Kuning) */
.btn-warning {
  background-color: #ca8a04; /* yellow-600 */
}

.btn-warning:hover {
  background-color: #a16207; /* yellow-700 */
}

/* Button Export PDF Khusus */
.export-btn {
    background-color: red; /* green-600 */
 /* red-600 */
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.export-btn:hover {
    background-color: #16a34a; /* green-600 */
 /* red-700 */
}

/* Container Button di Form */
.form-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
}

/* Container Control Grafik */
.chart-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Select Tahun */
.year-select {
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  background-color: white;
  color: #1f2937; /* gray-800 */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .flex.justify-between {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .flex.justify-between > div {
    width: 100%;
  }
  
  .flex.justify-between > button {
    width: 100%;
  }
}
</style>