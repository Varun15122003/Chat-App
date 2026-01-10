FROM node:18-alpine
WORKDIR /app

# Vite build ke liye variables declare karein
ARG VITE_SOCKET_URL
ARG VITE_API_URL

# Inhe build environment mein set karein
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .

# Dependencies aur Build
RUN cd client && npm install && npm run build
RUN cd server && npm install
RUN cd socket && npm install

EXPOSE 8080

# Dono server ko ek saath start karein
CMD ["sh", "-c", "node socket/index.js & node server/index.js"]