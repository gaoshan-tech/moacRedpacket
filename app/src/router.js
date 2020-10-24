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
    redirect: '/select-wallet'
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
    name: 'packet-details',
    component: () => import('./view/packet-details'),
    meta: {
      title: '领取详情'
    }
  },
  {
    name: 'personal-packets',
    component: () => import('./view/personal-packets'),
    meta: {
      title: '红包记录'
    }
  },
  {
    name: 'vote-list',
    component: () => import('./view/vote-list'),
    meta: {
      title: '投票列表'
    }
  },
  {
    name: 'build-vote',
    component: () => import('./view/build-votes'),
    meta: {
      title: '发布投票'
    }
  },
  {
    name: 'vote-details',
    component: () => import('./view/vote-details'),
    meta: {
      title: '投票详情'
    }
  },
    {
        name: 'vote-details-finished',
        component: () => import('./view/vote-details-finished'),
        meta: {
            title: '投票详情(投票后的状态页面)'
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
    name: 'vote-people-list',
    component: () => import('./view/vote-people-list'),
    meta: {
      title: '查看投票人'
    }
  },
  {
    name: 'single-vote-people-list',
    component: () => import('./view/single-vote-people-list'),
    meta: {
      title: '查看单项投票人'
    }
  },
  {
    name: 'test',
    component: () => import('./view/test'),
    meta: {
      title: 'test'
    }
  }
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
