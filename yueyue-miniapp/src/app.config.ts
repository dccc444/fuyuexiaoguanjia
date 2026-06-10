export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/buddy/index',
    'pages/planner/index',
    'pages/mine/index',
    'pages/battle-book/index',
    'pages/buddy-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    backgroundColor: '#fff6fb',
    navigationBarBackgroundColor: '#fff6fb',
    navigationBarTitleText: '赴约小管家',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9e8ea3',
    selectedColor: '#e65297',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/buddy/index',
        text: '搭子'
      },
      {
        pagePath: 'pages/planner/index',
        text: '规划'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
