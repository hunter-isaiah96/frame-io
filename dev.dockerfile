FROM node:14.15.1-alpine

# container filesystem config
ADD . /app
WORKDIR /app
ENV HOST 0.0.0.0

# reduce shell operations to a single layer
RUN apk update && \
    apk upgrade && \
    apk add g++ make python3 && \ 
    npm install

# allow incoming traffic to the below ports
EXPOSE 3000    

CMD npm run dev
