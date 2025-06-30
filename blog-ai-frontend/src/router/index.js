import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Register from '@/pages/Register.vue';
import Dashboard from '@/pages/Dashboard.vue';
import CreatePost from '@/pages/CreatePost.vue';
import EditPost from '@/pages/EditPost.vue';
import PostHistory from '@/pages/PostHistory.vue';
import UserProfile from '@/components/Blog/UserProfile.vue';
import Home from '@/pages/Home.vue';
import ViewPost from '@/pages/ViewPost.vue';
import AdminDashboard from '@/pages/AdminDashboard.vue'; 
import Pricing from '@/pages/Pricing.vue';
import Payment from '@/pages/Payment.vue';


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/profile', component: UserProfile },
  { path: '/create-post', name: 'CreatePost', component: CreatePost },
  { path: '/edit-post/:id', name: 'EditPost', component: EditPost, props: true },
  { path: '/history', name: 'PostHistory', component: PostHistory },
  { path: '/view-post/:id', name: 'ViewPost', component: ViewPost, props: true },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAdmin: true } }, 
  { path: '/pricing', name: 'Pricing', component: Pricing },
  { path: '/payment', name: 'Payment', component: Payment },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware kiểm tra quyền admin
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAdmin && (!token || !isAdmin())) {
    next('/login');
  } else {
    next();
  }
});

function isAdmin() {
  // Giả sử role được lưu trong token hoặc fetch từ API
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1])); // Giải mã JWT đơn giản
    return decoded.role === 'admin';
  }
  return false;
}

export default router;