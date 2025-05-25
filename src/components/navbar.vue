<template>
  <div class="sidebar-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-brand">📚Perpustakaan</h3>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/members" class="nav-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>👩🏼‍🤝‍🧑🏼Member</span>
        </router-link>
        
        <router-link to="/buku" class="nav-item" active-class="active">
          <i class="fas fa-book"></i>
          <span>📓Kelola Buku</span>
        </router-link>
        
        <router-link to="/peminjaman" class="nav-item" active-class="active">
          <i class="fas fa-hand-holding"></i>
          <span>📕Peminjaman</span>
        </router-link>
        
        <router-link to="/pengembalian" class="nav-item" active-class="active">
          <i class="fas fa-undo-alt"></i>
          <span>📘Pengembalian</span>
        </router-link>
        
        
        <!-- <router-link to="/chart" class="nav-item" active-class="active">
          <i class="fas fa-chart-bar"></i>
          <span>📊Grafik Peminjaman</span>
        </router-link> -->
      </nav>
      
      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>🔴Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem('token')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px; /* tinggi navbar atas */
  z-index: 1000;
}

.sidebar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
  display: flex;
  flex-direction: row; /* horizontal */
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  transition: all 0.3s ease;
}

.sidebar-header {
  flex: 1;
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  text-align: left;
}

.sidebar-nav {
  display: flex;
  flex: 3;
  justify-content: flex-start;
  gap: 20px;
  overflow-x: auto;
  padding-left: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item i {
  margin-right: 8px;
  font-size: 1.1rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-bottom: 3px solid #f39c12;
}

.sidebar-footer {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.logout-btn i {
  margin-right: 8px;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.2);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  .sidebar-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  .sidebar-footer {
    justify-content: center;
    margin-top: 10px;
  }
}
</style>
