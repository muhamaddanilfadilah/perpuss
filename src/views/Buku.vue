<template>
  <div class="buku-page">
    <h1>𝐃𝐚𝐟𝐭𝐚𝐫 𝐁𝐮𝐤𝐮</h1>

    <button @click="openForm()" class="btn-add">Tambah Buku</button>

    <!-- Form tambah/edit buku -->
    <div v-if="showForm" class="form-add-buku">
      <h3>{{ isEditMode ? 'Edit Buku' : 'Tambah Buku Baru' }}</h3>
      <form @submit.prevent="submitbuku">
        <div>
          <label>No Rak:</label>
          <input v-model="form.no_rak" required />
        </div>
        <div>
          <label>Judul:</label>
          <input v-model="form.judul" required />
        </div>
        <div>
          <label>Pengarang:</label>
          <input v-model="form.pengarang" required />
        </div>
        <div>
          <label>Penerbit:</label>
          <input v-model="form.penerbit" required />
        </div>
        <div>
          <label>Tahun Terbit:</label>
          <input v-model="form.tahun_terbit" type="number" required />
        </div>
        <div>
          <label>Stok:</label>
          <input v-model="form.stok" type="number" required />
        </div>
        <div>
          <label>Detail:</label>
          <textarea v-model="form.detail" rows="3"></textarea>
        </div>
        <button type="submit" :disabled="loading">{{ loading ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Simpan') }}</button>
        <button type="button" @click="cancelForm" :disabled="loading">Batal</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>

    <!-- Tabel buku -->
    <table class="buku-table">
      <thead>
        <tr>
          <th>No Rak</th>
          <th>Judul</th>
          <th>Pengarang</th>
          <th>Penerbit</th>
          <th>Tahun</th>
          <th>Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody class="udin">
        <tr v-if="bukus.length === 0">
          <td colspan="7" style="text-align:center; color:#888;">Belum ada data buku</td>
        </tr>
        <tr v-for="buku in bukus" :key="buku.id">
          <td>{{ buku.no_rak }}</td>
          <td>{{ buku.judul }}</td>
          <td>{{ buku.pengarang }}</td>
          <td>{{ buku.penerbit }}</td>
          <td>{{ buku.tahun_terbit }}</td>
          <td>{{ buku.stok }}</td>
          <td class="action-cell">
            <button @click="viewDetail(buku)" class="btn-action detail">Lihat</button>
            <button @click="editbuku(buku)" class="btn-action edit">Edit</button>
            <button @click="deletebuku(buku)" class="btn-action delete">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Detail -->
    <div v-if="selectedbuku" class="modal-overlay" @click.self="selectedbuku = null">
      <div class="modal-content">
        <h3>Detail Buku</h3>
        <p><strong>No Rak:</strong> {{ selectedbuku.no_rak }}</p>
        <p><strong>Judul:</strong> {{ selectedbuku.judul }}</p>
        <p><strong>Pengarang:</strong> {{ selectedbuku.pengarang }}</p>
        <p><strong>Penerbit:</strong> {{ selectedbuku.penerbit }}</p>
        <p><strong>Tahun Terbit:</strong> {{ selectedbuku.tahun_terbit }}</p>
        <p><strong>Stok:</strong> {{ selectedbuku.stok }}</p>
        <p><strong>Detail:</strong> {{ selectedbuku.detail || '-' }}</p>
        <button @click="selectedbuku = null">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "bukuView",
  data() {
    return {
      showForm: false,
      isEditMode: false,
      loading: false,
      errorMessage: "",
      successMessage: "",
      selectedbuku: null,
      form: {
        id: null,
        no_rak: "",
        judul: "",
        pengarang: "",
        penerbit: "",
        tahun_terbit: "",
        stok: "",
        detail: "",
      },
      bukus: [],
    };
  },
  mounted() {
    this.fetchbukus();
  },
  methods: {
    openForm() {
      this.showForm = true;
      this.isEditMode = false;
      this.resetForm();
    },
    async fetchbukus() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://45.64.100.26:88/perpus-api/public/api/buku", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.bukus = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        this.errorMessage = "Gagal mengambil data buku.";
      }
    },
    async submitbuku() {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";
      const token = localStorage.getItem("token");

      try {
        const formData = new FormData();
        for (let key in this.form) {
          if (key === "tahun_terbit" || key === "stok") {
            formData.append(key, parseInt(this.form[key]));
          } else {
            formData.append(key, this.form[key]);
          }
        }

        if (this.isEditMode && this.form.id) {
          await axios.post(
            `http://45.64.100.26:88/perpus-api/public/api/buku/${this.form.id}?_method=PUT`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          this.successMessage = "Buku berhasil diperbarui.";
        } else {
          await axios.post(
            "http://45.64.100.26:88/perpus-api/public/api/buku",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          this.successMessage = "Buku berhasil ditambahkan.";
        }

        this.fetchbukus();
        this.cancelForm();
      } catch (err) {
        console.error(err.response?.data || err.message);
        this.errorMessage = "Gagal menyimpan data buku.";
      } finally {
        this.loading = false;
      }
    },
    editbuku(buku) {
      this.form = JSON.parse(JSON.stringify(buku)); // deep copy
      this.isEditMode = true;
      this.showForm = true;
      this.errorMessage = "";
      this.successMessage = "";
    },
    async deletebuku(buku) {
      const konfirmasi = confirm(`Hapus buku "${buku.judul}"?`);
      if (!konfirmasi) return;

      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `http://45.64.100.26:88/perpus-api/public/api/buku/${buku.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.successMessage = "Buku berhasil dihapus.";
        this.fetchbukus();
      } catch (err) {
        this.errorMessage = "Gagal menghapus buku.";
      }
    },
    viewDetail(buku) {
      this.selectedbuku = buku;
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
        no_rak: "",
        judul: "",
        pengarang: "",
        penerbit: "",
        tahun_terbit: "",
        stok: "",
        detail: "",
      };
    },
  },
};
</script>

<style scoped>
.udin {
  background-color: white;
}
.buku-page {
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
.form-add-buku {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 8px;
}
.form-add-buku input,
.form-add-buku textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.buku-table {
  width: 150%;
  border-collapse: collapse;
}
.buku-table th,
.buku-table td {
  border: 1px solid #ddd;
  padding: 10px;
}
.buku-table th {
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

.btn-action:last-child {
  margin-bottom: 0;   /* tombol terakhir tanpa spasi bawah */
}
.btn-action.detail {
  background-color: #3f51b5;
}
.btn-action.edit {
  background-color: #ff9800;
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
.modal-content h3 {
  margin-top: 0;
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
</style>
