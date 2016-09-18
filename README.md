# 代码运行步骤
## 配置跨域环境
打开本地hosts文件，添加如下配置项

* 127.0.0.1 a.test.com
* 127.0.0.1 b.test.com

[配置后的hosts文件内容](https://github.com/ToBeNumerOne/cross-domain/blob/master/hosts)

配置完成之后，打开终端运行PING命令：

eg: ping a.test.com

确保配置跨域模拟环境成功

## 安装依赖
在当前项目根目录下运行

````
npm install
````

## 启动本地服务器
在当前项目根目录下运行

````
node server.js
````



