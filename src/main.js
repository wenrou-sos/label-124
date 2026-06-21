import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import {
  Button,
  Cell,
  CellGroup,
  Icon,
  Tabbar,
  TabbarItem,
  NavBar,
  Card,
  Tag,
  NoticeBar,
  Popup,
  Dialog,
  Toast,
  Calendar,
  Radio,
  RadioGroup,
  Rate,
  Field,
  ActionSheet,
  Badge,
  Grid,
  GridItem,
  Divider,
  Stepper,
  Picker,
  Empty,
  Loading,
  Overlay,
} from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import routes from './router'
import './styles/global.css'

const app = createApp(App)
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

app.use(router)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Icon)
app.use(Tabbar)
app.use(TabbarItem)
app.use(NavBar)
app.use(Card)
app.use(Tag)
app.use(NoticeBar)
app.use(Popup)
app.use(Dialog)
app.use(Toast)
app.use(Calendar)
app.use(Radio)
app.use(RadioGroup)
app.use(Rate)
app.use(Field)
app.use(ActionSheet)
app.use(Badge)
app.use(Grid)
app.use(GridItem)
app.use(Divider)
app.use(Stepper)
app.use(Picker)
app.use(Empty)
app.use(Loading)
app.use(Overlay)

app.mount('#app')
