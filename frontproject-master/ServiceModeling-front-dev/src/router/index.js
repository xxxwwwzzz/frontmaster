import Vue from 'vue'
import Router from 'vue-router'
// eslint-disable-next-line no-unused-vars
import index from '../pages/index'
import projects from '../pages/projects/projects'
import workspace from '../pages/workspace/workspace'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: index
    },
    {
      path: '/projects',
      component: projects
    },
    {
      path: '/workspace',
      component: workspace
    }
  ],
  mode: 'history'
})
