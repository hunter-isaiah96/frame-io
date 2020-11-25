FROM node:alpine3.12

# container filesystem config
WORKDIR /app
ENV HOST 0.0.0.0

# reduce shell operations to a single layer
RUN apk update && \
    apk upgrade && \
    apk add g++ make python && \
    apk add git ffmpeg && \
    yarn set version berry && \
    yarn install 

# allow incoming traffic to the below ports
EXPOSE 3000    

CMD yarn dev
