FROM node:21-alpine
WORKDIR noteworthy-backend/
COPY . .
RUN npm i -g typescript
RUN npm install
CMD ["npm","run", "dev"]
EXPOSE 3001