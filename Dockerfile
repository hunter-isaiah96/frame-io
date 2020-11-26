FROM node:14.15.1-alpine

# create destination directory
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git
RUN apk add g++ make python3

# copy the app, note .dockerignore
COPY . /usr/src/nuxt-app/
RUN yarn install

EXPOSE 3000
EXPOSE 5432
EXPOSE 5050
# build necessary, even if no static files are needed,
# since it builds the server as well

# set app serving to permissive / assigned
ENV HOST 0.0.0.0
# set app port

# start the app
CMD yarn dev