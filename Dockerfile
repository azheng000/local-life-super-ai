FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源代码
COPY tsconfig.json ./
COPY src ./src

# 编译TypeScript
RUN npm run build

# 安装生产依赖
RUN npm install --production

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
