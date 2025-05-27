<template>
  <div class="buku-page">
    <h1 class="asd">𝐃𝐚𝐟𝐭𝐚𝐫 𝐁𝐮𝐤𝐮</h1>

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
.buku-page {
  padding: 1.5rem;
  /* Remove the blue gradient and use transparent background to show the library theme from App.vue */
  background: transparent;
  min-height: 100vh;
}

.asd {
  /* Change to library theme colors */
  color: #2c3e50;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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

.form-add-buku {
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

.form-add-buku:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.form-add-buku h3 {
  margin-top: 0;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-weight: bold;
  border-bottom: 3px solid #d4c5a9;
  padding-bottom: 0.5rem;
  font-size: 1.4rem;
}

.form-add-buku label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
  font-family: 'Georgia', serif;
  font-size: 14px;
}

.form-add-buku input,
.form-add-buku textarea {
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

.form-add-buku input:focus,
.form-add-buku textarea:focus {
  outline: none;
  border-color: #8b4513;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.form-add-buku button[type="submit"] {
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

.form-add-buku button[type="submit"]:hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.form-add-buku button[type="button"] {
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

.form-add-buku button[type="button"]:hover {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(192, 57, 43, 0.4);
}

.buku-table {
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

.buku-table th {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-family: 'Georgia', serif;
  font-size: 15px;
}

.buku-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8dcc0;
  color: #2c3e50;
  font-family: 'Georgia', serif;
}

.buku-table tr:last-child td {
  border-bottom: none;
}

.buku-table tr:nth-child(even) {
  background: rgba(244, 241, 222, 0.3);
}

.buku-table tr:hover {
  background: rgba(139, 69, 19, 0.05);
  transition: background-color 0.3s ease;
}

.action-cell {
  display: flex;
  gap: 8px;
  align-items: center;
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
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 4px solid #c0392b;
  margin: 10px 0;
}

.success {
  color: #27ae60;
  font-size: 0.9rem;
  font-family: 'Georgia', serif;
  font-weight: 600;
  background: rgba(39, 174, 96, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 4px solid #27ae60;
  margin: 10px 0;
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
  z-index: 999;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
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

/* Responsive design untuk mobile */
@media (max-width: 768px) {
  .buku-page {
    padding: 1rem;
  }
  
  .form-add-buku {
    padding: 1rem;
  }
  
  .action-cell {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-action {
    width: 100%;
    text-align: center;
  }
  
  .modal-content {
    width: 350px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .buku-page {
    padding: 0.5rem;
  }
  
  .buku-table {
    font-size: 14px;
  }
  
  .buku-table th,
  .buku-table td {
    padding: 8px;
  }
  
  .modal-content {
    width: 320px;
    padding: 16px;
  }
}
</style>