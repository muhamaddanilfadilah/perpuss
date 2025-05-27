<template>
  <div id="app">
    <div class="background-image"></div>
    <Navbar v-if="$route.path !== '/'" />
    <div class="main-content" :class="{ 'with-navbar': $route.path !== '/' }">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from './components/navbar.vue'

export default {
  name: 'App',
  components: { Navbar }
}
</script>

<style>
/* Style untuk background image */
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('src/assets/perpus.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  opacity: 0.8;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
  position: relative;
 
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin-top: 200px; /* Memberi jarak dari navbar */
  margin-bottom: 20px;
}

.main-content.with-navbar {
  margin-top: 80px; /* Sesuaikan dengan tinggi navbar */
}

@media (max-width: 768px) {
  .main-content {
    margin-top: 60px;
    width: 95%;
    padding: 15px;
  }
  
  .main-content.with-navbar {
    margin-top: 60px;
  }
}

body {
  color: #000000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: transparent;
}
</style>