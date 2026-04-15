# iGEM Wiki

这是一个为 iGEM 团队量身定制的专业、通用且模块化的静态网站生成平台。本项目基于 Python Flask 框架开发，采用前后端分离的 Jinja2 模板架构，让团队成员能够高效、无缝地协同构建项目 Wiki。

## 核心特性

* **组件化开发架构**: 深度采用 Jinja2 模板继承 (`{% extends %}`, `{% block %}`)，实现全站导航栏、页脚、元数据等公共结构的彻底解耦与复用。
* **双语平滑切换框架**: 预先配置了 `data-text-en` 和 `data-text-zh` 数据结构，原生支持中英双语的无缝热切换。
* **100% 静态导出**: 完美集成 `Frozen-Flask`，可将整个动态应用一键冻结并导出至 `/public` 目录，完全符合 iGEM 官方的纯静态提交流程规范。
* **支持高级排版的侧边导航**: 内置专为湿实验/干实验长篇报告设计的动态目录 (TOC) 侧边栏，支持平滑滚动监听与层级折叠。

## 快速上手

### 1. 安装项目依赖

请确保你的计算机上已安装 Python 3.8 或更高版本，然后执行以下命令安装运行所需的扩展包：

```bash
pip install -r requirements.txt
```

### 2. 启动本地开发环境

在开发过程中，你可以启动支持热重载的 Flask 本地服务器：

```bash
python app.py
```
启动后在浏览器中访问：`http://127.0.0.1:5000/`

### 3. 如何新增一篇文章

以新增一篇“干实验 - 软件开发 (Dry Lab - Software)”文章为例：

1. **创建模板文件**: 在 `wiki/pages/drylab/software.html` 新建 HTML 文件，并继承通用的文章布局模板：
    ```html
    {% extends 'templates/layouts/article.html' %}
    {% block title %}Software | iGEM Wiki{% endblock %}
    {% block toc %} ... {% endblock %}
    {% block hero %} ... {% endblock %}
    {% block article %} ... {% endblock %}
    ```
2. **注册后端路由**: 打开 `app.py`，并将这个新页面绑定到路由系统：
    ```python
    @app.route('/drylab/software')
    def drylab_software():
        return render_template('pages/drylab/software.html', 
                               is_subpage=True, 
                               active_nav='Dry-Lab', 
                               current_path='/drylab/software')
    ```
3. **更新主导航**: 最后，在共享的 `wiki/templates/components/nav.html` 文件中，向包含 Dry Lab 的下拉菜单里加上一行新链接即可。整个网站将会同步更新！

### 4. 发布到生产环境 (部署至 iGEM Gitlab)

当你们的 Wiki 开发完毕，准备上传或部署时，需要将 Python 应用转化为完全独立的静态 HTML 网页集：

```bash
flask freeze
```
打包成功后，静态文件将被输出在根目录的 `public/` 文件夹中。你只需要将 `public/` 内的所有资源直接 Commit 并在 iGEM GitLab 仓库中 Push 即可完成提交流程。

----