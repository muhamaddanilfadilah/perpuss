<template>
  <div class="dashboard-page">
    <h1>Dashboard Perpustakaan</h1>

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
  display: flex;
  flex-direction: column;
  justify-content: center;  /* center vertikal */
  align-items: center;      /* center horizontal */
  min-height: 50;
  max-width: 900;
  margin: 0 auto;

  background-color: rgb(8, 0, 159);
}

h1 {
  color: #000000;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.stats-box {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
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
