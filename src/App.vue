<template>
  <div id="app">
    <Navbar v-if="$route.path !== '/'" />
    <div :class="['main-content', { 'with-navbar': $route.path !== '/' }]">
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
.main-content {
    padding-top: 60px; /* ruang navbar */
  padding-left: 0;
  max-width: 1200px; /* maksimal lebar konten */
  margin: 0 auto; /* bikin konten horizontal center */
  transition: padding 0.3s ease;
  width: 100%; /* supaya lebar penuh kalau layar kecil */
}

.main-content.with-navbar {
  padding-top: 60px; /* sama, buat ruang navbar atas */
}

/* Optional, buat mobile */
@media (max-width: 768px) {
  .main-content {
    padding-top: 100px; /* kalau navbar column, kasih ruang lebih */
  }
}

body {
  background: rgba(8, 0, 159, 0.875);
  color: #000000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  margin: 0; /* pastikan gak ada margin default */
}
</style>
