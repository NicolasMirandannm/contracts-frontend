import {createRouter, createWebHistory} from 'vue-router'

import RouteConstants from "@/router/RouteConstants.js";

import Login from '@/views/auth/Login.vue';
import Home from '@/views/Home.vue';
import SignUp from "@/views/auth/SignUp.vue";
import ForgotPassword from "@/views/auth/ForgotPassword.vue";
import NotFound from "@/views/not-found/NotFound.vue";
import { zhHans } from "vuetify/locale";
import UserService from "@/api/services/manager/UserService.js";


const routes = [
    { ...RouteConstants.HOME, component: Home, meta: {requiresAuth: true} },
    { ...RouteConstants.LOGIN, component: Login },
    { ...RouteConstants.SIGN_UP, component: SignUp },
    { ...RouteConstants.FORGOT_PASSWORD, component: ForgotPassword },
    { ...RouteConstants.NOT_FOUND, component: NotFound },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})


router.beforeEach((to, from, next) => {
    const currentUser = UserService.getCurrentUser();
    const hasToken = !!currentUser.token && !!currentUser.id;

    if (to.meta.requiresAuth && !hasToken) {
        next(RouteConstants.LOGIN.push())
    } else if (to.name === RouteConstants.LOGIN.name && hasToken) {
        next(RouteConstants.HOME.push())
    } else {
        next()
    }
})

export default router;
