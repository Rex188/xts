# 学生通讯社官方网站 (Student Press Agency Website)

记录学通社自 2023 年以来的活动纪实、团队成员变迁与视觉图库（30+ 照片长廊）。

---

## 📁 目录架构规划

```text
xtwebsite/
├── index.html               # 官方主页（Index / 门户页，含英雄动效、精选大事记、成员速览）
├── gallery.html             # 照片长廊专页（横向视差画廊，支持 30+ 张海量高品质照片）
│
├── assets/
│   ├── data/                # 结构化数据（解耦展示与内容，方便更新维护）
│   │   ├── activities.json  # 2023 至今的活动大事记记录
│   │   ├── members.json     # 历届部门与人员架构、变迁变动
│   │   └── photos.json      # 画廊照片元数据（标题、年份、分类、路径）
│   │
│   └── images/              # 媒体静态资源
│       ├── gallery/         # 存放 30+ 张活动精选与纪实照片
│       ├── members/         # 社员头像与职务肖像照
│       ├── activities/      # 活动专题封面图
│       └── ui/              # 校徽/社徽/图标/背景等
│
├── css/                     # 模块化样式表
│   ├── common.css           # 全局样式（排版、色彩变量、导航栏、页脚）
│   ├── homepage.css         # 首页专用样式（卡片飞入、GSAP时间轴、数据统计）
│   └── gallery.css          # 照片长廊专用样式（Locomotive Scroll 横向画廊）
│
├── js/                      # 交互与动画脚本
│   ├── homepage.js          # 首页交互动效与数据挂载
│   └── gallery.js           # 画廊横向平滑滚动与大图灯箱
│
└── templates/               # CodePen 原始参考设计模版（完整保留原版代码）
    ├── homepage/            # GSAP Carousel / Gallery 落地页设计
    └── photo_gallery/       # Locomotive Scroll 水平滚动画廊设计
```

---

## 🚀 本地开发与预览方式

可以使用以下任意一种方式在本地启动轻量静态服务器：

```bash
# 方式 1: 使用 Python 3
python3 -m http.server 8000

# 方式 2: 使用 npx
npx serve .
```

启动后在浏览器打开 `http://localhost:8000` 即可实时预览。
