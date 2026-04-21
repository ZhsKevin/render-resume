# H&S简历


## 一份优雅简约的在线简历

- 优化构建，页面秒开无闪烁
- 自适应屏幕兼容移动端

- 支持部署到ghpages，可在线浏览
- 自动生成 PDF，全自动化流程

- 提示：本项目如果npm用不了就使用阿里镜像源cnpm命令，具体方法百度即可

### 项目简介：

​	H&S简历是一个在线简历页面自动化生成项目，用户fork本项目后再使用Git工具Clone到本地修改后托管在GitHub pages或者阿里云等其他提供页面托管服务的平台上，实现生成个人在线简历的功能。

### 特点：

- 简洁、雅观、大气
- 优化结构构建，页面秒开无闪烁

- 项目基于 Node.js 环境开发，其他不需要任何环境，简单易操作易上手
- 使用[@media ]() screen自适应屏幕，Css同时开发移动端，移动端访问无异常

- 使用webpack打包器，面向过程进行前端开发，基本所有操作都可实现自动化

1. 1. 支持自动化流程实现部署到GitHub pages (pub)
   2. 全自动化流程，支持本地热部署，实时浏览修改情况

1. 1. 自动化生成CNAME文件，实现GitHub pages域名解析

- 支持使用命令云应用部署，如云对象存储+域名解析 (build)



### 演示页面

#### 电脑端效果：

<img src="https://zhs-common.oss-cn-beijing.aliyuncs.com/projects/resume/11.png" alt="img" style="zoom: 33%;" />

#### 手机端效果：

<img src="https://zhs-common.oss-cn-beijing.aliyuncs.com//projects/resume/12.png" alt="img" style="zoom: 50%;" />



## [环境搭建](https://www.yuque.com/docs/share/aa48414e-1e2e-455a-a070-722d6b15473c?#)

主要介绍搭建方法以及注意事项

## [修改部署](https://www.yuque.com/docs/share/8ba5f1c4-bebe-4199-9307-8433644836d2?#)

提供了两种部署方式 分别为：页面托管部署（GitHubpages+域名解析）、和云应用部署（云对象存储+域名解析），参考来实现即可
