FROM node:alpine3.12
WORKDIR /app

RUN apk add ffmpeg && \
    npm i -g yarn && \
    yarn set version berry && \
    yarn install 
EXPOSE 3000    

CMD ["yarn", "dev"]
