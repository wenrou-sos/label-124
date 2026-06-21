import TabBarLayout from '../layouts/TabBarLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/',
    component: TabBarLayout,
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: '首页', icon: 'home-o', index: 0 },
      },
      {
        path: 'booking',
        name: 'Booking',
        component: () => import('../views/Booking.vue'),
        meta: { title: '约车', icon: 'calendar-o', index: 1 },
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('../views/Courses.vue'),
        meta: { title: '已约课程', icon: 'orders-o', index: 2 },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '我的', icon: 'user-o', index: 3 },
      },
    ],
  },
  {
    path: '/booking-detail/:coachId',
    name: 'BookingDetail',
    component: () => import('../views/BookingDetail.vue'),
    meta: { title: '预约时段' },
  },
  {
    path: '/review/:courseId',
    name: 'Review',
    component: () => import('../views/Review.vue'),
    meta: { title: '训练评价' },
  },
  {
    path: '/simulator',
    name: 'Simulator',
    component: () => import('../views/Simulator.vue'),
    meta: { title: '考场模拟预约' },
  },
  {
    path: '/coach/:coachId',
    name: 'CoachDetail',
    component: () => import('../views/CoachDetail.vue'),
    meta: { title: '教练详情' },
  },
]

export default routes
