FROM node:18-alpine

WORKDIR /app

# Sabhi folders ki package files copy karein
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY socket/package*.json ./socket/

# Dependencies install karein
RUN cd client && npm install
RUN cd server && npm install
RUN cd socket && npm install

# Saara source code copy karein
COPY . .

# Client ko build karein
RUN cd client && npm run build

# Port 8080 expose karein (Azure standard)
EXPOSE 8080

# Ek startup script banate hain jo dono ko chalaye
CMD ["sh", "-c", "node socket/index.js & node server/index.js"]