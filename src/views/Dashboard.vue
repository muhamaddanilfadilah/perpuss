<template>
  <div class="dashboard-page">
    <h1>𝐃𝐚𝐬𝐡𝐛𝐨𝐚𝐫𝐝 𝐏𝐞𝐫𝐩𝐮𝐬𝐭𝐚𝐤𝐚𝐚𝐧</h1>

    <div class="stats-box">
      <div class="stat-item">
        <h2>{{ totalBuku }}</h2>
        <p>Total Buku</p>
      </div>
      <div class="stat-item">
        <h2>{{ totalAnggota }}</h2>
        <p>Total Anggota</p>
      </div>
      <div class="stat-item">
        <h2>{{ totalPeminjaman }}</h2>
        <p>Total Peminjaman</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardView",
  data() {
    return {
      totalBuku: 0,
      totalAnggota: 0,
      totalPeminjaman: 0,
    };
  },
  mounted() {
    this.totalBuku = parseInt(localStorage.getItem("totalBuku")) || 0;
    this.totalAnggota = parseInt(localStorage.getItem("totalAnggota")) || 0;
    this.fetchPeminjaman();
  },
  methods: {
    async fetchPeminjaman() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "http://45.64.100.26:88/perpus-api/public/api/peminjaman",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        this.totalPeminjaman = data.data.length;
      } catch (err) {
        console.error("Gagal ambil data peminjaman", err);
      }
    },
  },
};
</script>

<style scoped>
.dashboard-page {
  display: 0;
  flex-direction: column;
  justify-content: 0;
  align-items: center;
  margin: 0 auto;

}

h1 {
  color: #000000;
  font-size: 2.5rem;
  font-weight: bold;
  display: inline-block; /* Agar border hanya sepanjang teks */
  border-bottom: 3px solid #000000; /* Garis bawah custom */
  padding-bottom: 5px; /* Jarak antara teks dan garis */
  margin-bottom: 2rem;
  text-align: center;
}

.stats-box {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  width: 100%; /* Pastikan mengambil lebar penuh container */
}

.stat-item {
  background-color: #000000;
  padding: 1.5rem;
  border-radius: 12px;
 flex: 1;
  max-width: 500px;/* Ini akan membuat semua item memiliki lebar yang sama */
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-item h2 {
  margin: 0;
  font-size: 2.5rem;
  color: #007bff;
}

.stat-item p {
  margin: 0.5rem 0 0;
  font-size: 1.1rem;
  color: #555;
}
</style>
