import {createRouter, createWebHistory} from 'vue-router'

import RouteConstants from "@/router/RouteConstants.js";

import Login from '@/views/auth/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import SignUp from "@/views/auth/SignUp.vue";
import ForgotPassword from "@/views/auth/ForgotPassword.vue";


const routes = [
    { ...RouteConstants.HOME, component: Dashboard, meta: {requiresAuth: false} },
    { ...RouteConstants.LOGIN, component: Login },
    { ...RouteConstants.SIGN_UP, component: SignUp },
    { ...RouteConstants.FORGOT_PASSWORD, component: ForgotPassword },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})


router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        next({name: 'Login'})
    } else if (to.name === 'Login' && token) {
        next({name: 'Dashboard'})
    } else {
        next()
    }
})

export default router;
