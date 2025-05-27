<template>
  <div class="sidebar-container">
    <div class="library-sidebar-background">
      <div class="wood-grain-pattern"></div>
      <div class="bookshelf-texture"></div>
    </div>
    
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="library-emblem">
          <div class="book-stack-icon">
            <div class="book-layer book-1"></div>
            <div class="book-layer book-2"></div>
            <div class="book-layer book-3"></div>
          </div>
        </div>
        <h3 class="sidebar-brand">📚 Perpustakaan</h3>
        <p class="sidebar-subtitle">Pt. DhanielFadlh Jaya</p>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <div class="nav-icon-wrapper">
            <i class="fas fa-tachometer-alt nav-icon"></i>
          </div>
          <span class="nav-text">Dashboard</span>
          <div class="nav-indicator"></div>
        </router-link>
        
        <router-link to="/members" class="nav-item" active-class="active">
          <div class="nav-icon-wrapper">
            <i class="fas fa-users nav-icon"></i>
          </div>
          <span class="nav-text">Member</span>
          <div class="nav-indicator"></div>
        </router-link>
        
        <router-link to="/buku" class="nav-item" active-class="active">
          <div class="nav-icon-wrapper">
            <i class="fas fa-book nav-icon"></i>
          </div>
          <span class="nav-text">Kelola Buku</span>
          <div class="nav-indicator"></div>
        </router-link>
        
        <router-link to="/peminjaman" class="nav-item" active-class="active">
          <div class="nav-icon-wrapper">
            <i class="fas fa-hand-holding nav-icon"></i>
          </div>
          <span class="nav-text">Peminjaman</span>
          <div class="nav-indicator"></div>
        </router-link>
        
        <router-link to="/pengembalian" class="nav-item" active-class="active">
          <div class="nav-icon-wrapper">
            <i class="fas fa-undo-alt nav-icon"></i>
          </div>
          <span class="nav-text">Pengembalian</span>
          <div class="nav-indicator"></div>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">

        <button class="logout-btn" @click="logout">
          <div class="nav-icon-wrapper">
            <i class="fas fa-sign-out-alt nav-icon"></i>
          </div>
          <span class="nav-text">Logout</span>
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
  width: 280px;
  height: 100vh;
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: hidden;
}

.library-sidebar-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg, 
    #2c3e50 0%, 
    #34495e 25%, 
    #3d5470 50%, 
    #34495e 75%, 
    #2c3e50 100%
  );
  box-shadow: 
    2px 0 15px rgba(0, 0, 0, 0.2),
    inset -1px 0 3px rgba(139, 69, 19, 0.1);
}

.wood-grain-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 3px,
      rgba(139, 69, 19, 0.05) 3px,
      rgba(139, 69, 19, 0.05) 4px
    );
  opacity: 0.6;
}

.bookshelf-texture {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 60px,
      rgba(101, 67, 33, 0.08) 60px,
      rgba(101, 67, 33, 0.08) 62px
    );
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #f4f1de;
  position: relative;
  z-index: 1;
}

.sidebar-header {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 2px solid rgba(139, 69, 19, 0.3);
  background: rgba(0, 0, 0, 0.1);
  position: relative;
}

.library-emblem {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.book-stack-icon {
  position: relative;
  width: 40px;
  height: 30px;
}

.book-layer {
  position: absolute;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.book-1 {
  width: 32px;
  height: 8px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  bottom: 0;
  left: 4px;
  transform: rotate(-2deg);
}

.book-2 {
  width: 36px;
  height: 8px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  bottom: 6px;
  left: 2px;
  transform: rotate(1deg);
}

.book-3 {
  width: 30px;
  height: 8px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  bottom: 12px;
  left: 5px;
  transform: rotate(-1deg);
}

.sidebar-brand {
  margin: 0 0 4px 0;
  font-size: 1.4rem;
  font-weight: bold;
  color: #f4f1de;
  font-family: 'Georgia', serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.sidebar-subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(244, 241, 222, 0.7);
  font-style: italic;
  font-family: 'Georgia', serif;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  color: rgba(244, 241, 222, 0.85);
  text-decoration: none;
  padding: 16px 20px;
  margin: 6px 12px;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  font-family: 'Georgia', serif;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
}

.nav-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 69, 19, 0.2);
  border-radius: 8px;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.nav-icon {
  font-size: 1.1rem;
  color: #d4c5a9;
}

.nav-text {
  white-space: nowrap;
  font-size: 0.95rem;
  flex: 1;
}

.nav-indicator {
  width: 4px;
  height: 0;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  border-radius: 2px;
  transition: all 0.3s ease;
  margin-left: 8px;
}

.nav-item:hover {
  background: rgba(139, 69, 19, 0.15);
  color: #f4f1de;
  transform: translateX(4px);
  border-color: rgba(139, 69, 19, 0.3);
}

.nav-item:hover .nav-icon-wrapper {
  background: rgba(139, 69, 19, 0.4);
  transform: scale(1.05);
}

.nav-item:hover .nav-icon {
  color: #f4f1de;
}

.nav-item:hover .nav-indicator {
  height: 20px;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.25), rgba(160, 82, 45, 0.2));
  color: #f4f1de;
  border-color: rgba(139, 69, 19, 0.4);
  box-shadow: 
    0 4px 15px rgba(139, 69, 19, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-item.active .nav-icon-wrapper {
  background: linear-gradient(135deg, #8b4513, #a0522d);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
}

.nav-item.active .nav-icon {
  color: white;
}

.nav-item.active .nav-indicator {
  height: 24px;
  box-shadow: 0 0 8px rgba(243, 156, 18, 0.6);
}

.sidebar-footer {
  padding: 20px;
  border-top: 2px solid rgba(139, 69, 19, 0.3);
  background: rgba(0, 0, 0, 0.1);
}

.library-quote {
  text-align: center;
  margin-bottom: 16px;
  padding: 8px;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 6px;
  border-left: 3px solid #8b4513;
}

.library-quote small {
  color: rgba(244, 241, 222, 0.7);
  font-style: italic;
  font-family: 'Georgia', serif;
}

.logout-btn {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.2));
  color: rgba(244, 241, 222, 0.85);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 10px;
  padding: 14px 16px;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  font-family: 'Georgia', serif;
  font-weight: 500;
  font-size: 0.95rem;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.3), rgba(192, 57, 43, 0.3));
  color: #f4f1de;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.5);
}

.logout-btn:hover .nav-icon-wrapper {
  background: rgba(231, 76, 60, 0.4);
  transform: scale(1.05);
}

.logout-btn:hover .nav-icon {
  color: #f4f1de;
}

/* Custom scrollbar untuk sidebar */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(139, 69, 19, 0.1);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #8b4513, #a0522d);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a0522d, #8b4513);
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar-container {
    width: 80px;
  }
  
  .sidebar-brand, 
  .sidebar-subtitle,
  .nav-text,
  .library-quote {
    display: none;
  }
  
  .sidebar-header {
    padding: 20px 10px;
  }
  
  .nav-item {
    justify-content: center;
    padding: 16px 8px;
    margin: 6px 8px;
  }
  
  .nav-icon-wrapper {
    margin-right: 0;
    width: 36px;
    height: 36px;
  }
  
  .nav-icon {
    font-size: 1.2rem;
  }
  
  .nav-indicator {
    display: none;
  }
  
  .logout-btn {
    justify-content: center;
    padding: 16px 8px;
  }
  
  .logout-btn span {
    display: none;
  }
  
  .sidebar-footer {
    padding: 16px 10px;
  }
}

@media (max-width: 480px) {
  .sidebar-container {
    width: 70px;
  }
  
  .nav-item {
    padding: 14px 6px;
    margin: 4px 6px;
  }
  
  .nav-icon-wrapper {
    width: 32px;
    height: 32px;
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
}

/* Animation untuk hover effects */
@keyframes bookGlow {
  0%, 100% { 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); 
  }
  50% { 
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.4); 
  }
}

.sidebar-header:hover .book-layer {
  animation: bookGlow 2s ease-in-out infinite;
}
</style>