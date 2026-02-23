# 1. Node.js ka version select karein
FROM node:18

# 2. App directory banayein
WORKDIR /usr/src/app

# 3. Package files copy karein aur install karein
COPY package*.json ./
RUN npm install

# 4. Baaki saara code copy karein
COPY . .

# 5. Port expose karein (Back4app ke liye)
EXPOSE 8080

# 6. Server start karein
CMD [ "node", "index.js" ]