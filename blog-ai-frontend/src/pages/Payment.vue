<template>
  <div class="payment-container animate-fade-in">
    <Header @logout="handleLogout" class="full-width" />
    <main class="payment-main">
      <header class="payment-header">
        <h1 class="payment-title">Thanh Toán Gói Dịch Vụ</h1>
        <p class="payment-subtitle">Hoàn tất thanh toán để kích hoạt gói của bạn với sức mạnh AI.</p>
      </header>
      <div class="payment-details" v-if="!loading">
        <h2 class="plan-selected">Gói Đã Chọn: {{ selectedPlan.name }}</h2>
        <p class="plan-price">Giá: {{ selectedPlan.price }}đ/tháng</p>
        <p class="plan-limit">Giới hạn bài viết: {{ selectedPlan.limit }}</p>
        <div class="user-info" v-if="user">
          <p><strong>Tên:</strong> {{ user.name || 'Chưa xác định' }}</p>
          <p><strong>Email:</strong> {{ user.email || 'Chưa xác định' }}</p>
          <p><strong>Vai trò:</strong> {{ user.role || 'user' }}</p>
        </div>
        <div class="payment-form" v-if="!paymentConfirmed">
          <label class="input-label">Phương thức Thanh Toán</label>
          <select v-model="paymentMethod" class="input-field" disabled>
            <option value="bank_transfer">Chuyển khoản ngân hàng</option>
          </select>
          <div class="qr-code">
            <img src="@/assets/agribank_qr.png" alt="QR Code Agribank" class="qr-image" />
            <p>Vui lòng quét mã QR bằng Agribank E-Mobile Banking và chuyển: {{ selectedPlan.price }}đ</p>
            <p>Số tài khoản: 8888392630052 - Agribank - Chủ tài khoản: Lê Trần Hoàng Thanh</p>
            <p>Nội dung: Payment for {{ user?.id || 'unknown' }} - {{ selectedPlan.name }}</p>
            <button class="confirm-button" @click="confirmPayment" :disabled="isProcessing">Xác nhận đã chuyển</button>
          </div>
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>
        <div v-if="paymentConfirmed" class="confirmation-message">
          <p class="success-message">Tài khoản của bạn sẽ được nâng cấp trong 24 giờ. Chúng tôi sẽ thông báo qua email!</p>
        </div>
      </div>
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải thông tin...</span>
      </div>
      <!-- Modal xác nhận -->
      <div v-if="showConfirmationModal" class="modal-overlay">
        <div class="modal-content">
          <p class="modal-message">Dịch vụ sẽ được nâng cấp trong vòng 24 giờ. Vui lòng chờ...</p>
          <button class="modal-close-button" @click="closeModal">Đóng</button>
        </div>
      </div>
      <footer class="payment-footer">
        <p>Thanh toán an toàn và bảo mật với công nghệ AI hiện đại.</p>
      </footer>
    </main>
    <Footer class="full-width" />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import authService from '@/services/authService';

export default {
  components: { Header, Footer },
  data() {
    const plan = this.$route.query.plan || 'plus'; // Giá trị mặc định là 'plus'
    return {
      fullName: '',
      email: '',
      paymentMethod: 'bank_transfer',
      error: '',
      paymentConfirmed: false,
      isProcessing: false,
      user: { role: 'user' }, // Giá trị mặc định cho user với role là 'user'
      selectedPlan: {
        name: plan === 'plus' ? 'Plus' : 'Pro',
        price: plan === 'plus' ? '99.000' : '499.000',
        limit: plan === 'plus' ? '10 bài/ngày' : 'Không giới hạn',
      },
      loading: true, // Thêm trạng thái loading
      showConfirmationModal: false, // Thêm trạng thái cho modal
    };
  },
  async created() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Vui lòng đăng nhập để tiếp tục.';
      this.loading = false;
      this.user = { role: 'user' };
      return;
    }
    try {
      const result = await authService.getUser();
      this.user = result.user || { role: 'user' };
    } catch (err) {
      console.error('Lỗi lấy thông tin người dùng:', err);
      this.error = 'Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.';
      this.user = { role: 'user' };
    } finally {
      this.loading = false;
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    async confirmPayment() {
      if (this.isProcessing || !this.user?.id) {
        this.error = 'Vui lòng đảm bảo thông tin người dùng đã được tải.';
        return;
      }
      this.isProcessing = true;
      this.error = '';
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: this.selectedPlan.name.toLowerCase(),
            amount: this.selectedPlan.price,
            userId: this.user.id,
          }),
        });
        if (response.ok) {
          this.showConfirmationModal = true; // Hiển thị modal thay vì set paymentConfirmed ngay
        } else {
          const errorData = await response.json();
          this.error = errorData.msg || 'Xác nhận thất bại.';
        }
      } catch (err) {
        console.error('Lỗi xác nhận:', err);
        this.error = 'Có lỗi xảy ra. Vui lòng thử lại.';
      } finally {
        this.isProcessing = false;
      }
    },
    closeModal() {
      this.showConfirmationModal = false;
      this.paymentConfirmed = true; // Chuyển sang trạng thái xác nhận sau khi đóng modal
    },
  },
};
</script>

<style scoped>
.payment-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #e6f0fa 0%, #f0f7ff 100%);
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  color: #1a202c;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.payment-main {
  flex: 1;
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.full-width {
  width: 100%;
  box-sizing: border-box;
}

.payment-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 2rem;
}

.payment-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2b6cb0;
  margin-bottom: 1rem;
}

.payment-subtitle {
  font-size: 1.2rem;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
}

.payment-details {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.plan-selected {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.plan-price, .plan-limit {
  font-size: 1.5rem;
  color: #3182ce;
  margin-bottom: 1rem;
}

.user-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.user-info p {
  margin: 0.25rem 0;
  color: #4a5568;
}

.qr-code {
  margin-top: 1.5rem;
}

.qr-image {
  width: 200px;
  height: 200px;
  margin-bottom: 1rem;
}

.confirm-button {
  background: #2b6cb0;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background 0.3s ease;
  margin-top: 1rem;
}

.confirm-button:hover:not(:disabled) {
  background: #1a5582;
}

.confirm-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #fee2e2;
  border-radius: 0.375rem;
}

.success-message {
  color: #15803d;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #dcfce7;
  border-radius: 0.375rem;
}

.confirmation-message {
  margin-top: 1.5rem;
}

.payment-footer {
  text-align: center;
  color: #4a5568;
  padding-bottom: 2rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #718096;
  padding: 1rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #3182ce;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.modal-message {
  font-size: 1.1rem;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.modal-close-button {
  background: #2b6cb0;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.modal-close-button:hover {
  background: #1a5582;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.7s ease-out;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .payment-title { font-size: 2rem; }
  .payment-details { padding: 1.5rem; }
  .qr-image { width: 150px; height: 150px; }
}
</style>