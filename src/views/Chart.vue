<template>
  <div class="chart-container">
    <h2>Grafik Peminjaman per Bulan</h2>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

export default {
  props: {
    peminjamanData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    // Fungsi untuk memproses data peminjaman menjadi format chart
    const processChartData = () => {
      // Hitung jumlah peminjaman per bulan
      const monthlyData = {};
      
      props.peminjamanData.forEach(item => {
        const date = new Date(item.tanggal_peminjaman);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear]++;
      });

      // Urutkan berdasarkan bulan
      const sortedMonths = Object.keys(monthlyData).sort();
      
      const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                           'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
      });
      
      const data = sortedMonths.map(month => monthlyData[month]);
      
      return { labels, data };
    };

    // Fungsi untuk membuat atau memperbarui chart
    const renderChart = () => {
      const { labels, data } = processChartData();
      
      const ctx = chartCanvas.value.getContext('2d');
      
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Jumlah Peminjaman',
            data: data,
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
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Peminjaman: ${context.raw}`;
                }
              }
            }
          }
        }
      });
    };

    onMounted(() => {
      if (props.peminjamanData.length > 0) {
        renderChart();
      }
    });

    // Watch untuk perubahan pada data peminjaman
    watch(() => props.peminjamanData, (newVal) => {
      if (newVal.length > 0) {
        renderChart();
      }
    }, { deep: true });

    return {
      chartCanvas
    };
  }
};
</script>

<style scoped>
.chart-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.chart-wrapper {
  position: relative;
  height: 400px;
  margin-top: 20px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
</style>