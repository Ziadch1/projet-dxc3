FROM node:22 AS build

WORKDIR /app

COPY . .

RUN npm install


FROM node:22 AS production

WORKDIR /app

COPY --from=build /app ./

EXPOSE 5000

CMD ["npm", "start"]
