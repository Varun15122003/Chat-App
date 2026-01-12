FROM node:18-alpine
WORKDIR /app

# Vite build ke liye saare variables declare karein
ARG VITE_SOCKET_URL
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Inhe build environment mein set karein taaki Vite inhe build ke waqt utha sake
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY . .

# Dependencies aur Build
# Vite build ke waqt ENV variables ko static files mein embed kar deta hai
RUN cd client && npm install && npm run build
RUN cd server && npm install
RUN cd socket && npm install

EXPOSE 8080

# Dono server ko ek saath start karein
CMD ["sh", "-c", "node socket/index.js & node server/index.js"]