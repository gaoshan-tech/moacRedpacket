import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routes = [
  // {
  //   path: '*',
  //   redirect: '/select-wallet'
  // },
  {
    path: '/',
    name: '/',
    redirect: '/homepage'
  },
  {
    name: 'homepage',
    component: () => import('./view/homepage'),
    meta: {
      title: '墨客红包首页'
    }
  },
  {
    name: 'select-wallet',
    component: () => import('./view/select-wallet'),
    meta: {
      title: '选择钱包'
    }
  },
  {
    name: 'create-red-envelope',
    component: () => import('./view/create-red-envelope'),
    meta: {
      title: '创建红包'
    }
  },
  {
    name: 'create-success',
    component: () => import('./view/create-success'),
    meta: {
      title: '创建红包'
    }
  },
  {
    name: 'get-packet',
    component: () => import('./view/get-packet'),
    meta: {
      title: '抢红包'
    }
  },
  {
    name: 'packet-details',
    component: () => import('./view/packet-details'),
    meta: {
      title: '领取详情'
    }
  },
  {
    name: 'receive-record',
    component: () => import('./view/receive-record'),
    meta: {
      title: '红包领取记录'
    }
  },
  {
    name: 'create-record',
    component: () => import('./view/create-record'),
    meta: {
      title: '红包领取记录'
    }
  },

];

// add route path
routes.forEach(route => {
  route.path = route.path || '/' + (route.name || '');
});

const router = new Router({
  scrollBehavior: () => ({y: 0}),
  routes: routes
});
// const router = new Router({ routes });

router.beforeEach((to, from, next) => {
  // const title = to.meta && to.meta.title;
  // if (title) {
  //   document.title = title;
  // }
  next();
});

export {
  router
};
